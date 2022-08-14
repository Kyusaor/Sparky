//Paramétrage global
const Discord = require('discord.js');
global.config = require('./data/config.js');
const bot = new Discord.Client({ intents: config.GatewayIntentBits});
const fs = require('fs');
var gconfig = JSON.parse(fs.readFileSync('./data/guild_config.json'));
var gpconfig = JSON.parse(fs.readFileSync('./data/globalPing.json'));

//Récupération des fichiers nécessaires
const ServChang = require('./modules/ServersChanging.js');
const utils = require('./modules/utils.js');
const Private = require('./data/private.js');
const { InteractionType, ChannelType } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');


//Déclaration des fonctions utilisées
var kyu = [];
var usersStatus = [];
var chan_mp;


//Démarrage du bot
bot.login(Private.token);

bot.on('ready', async () => {
    utils.envoi_log(config.logs_connexions, bot, config.version)
    //utils.statusLoop(bot);
    kyu = await bot.users.fetch(config.kyu);
    chan_mp = await bot.channels.cache.get(config.logs_mp);
    let chanGP = await bot.channels.cache.get(config.gp_dashboard);
    chanGP.messages.fetch();
})


//Event raw, pour récupérer les réactions dans les messages non-cachés
bot.on('raw', async packet => {
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
    const channel = bot.channels.cache.get(packet.d.channel_id);
    if (channel.messages.cache.has(packet.d.message_id)) return;
    let message = await channel.messages.fetch(packet.d.message_id).catch(e => e);
    let user = await bot.users.fetch(packet.d.user_id).catch(e => e);
    let emoji = packet.d.emoji.name;
    if(packet.d.emoji.id) {emoji += ":" + packet.d.emoji.id}
    if(!message.reactions || !message.reactions.cache) return;
    const reaction = await message.reactions.cache.get(emoji);
    if (reaction) await reaction.users.cache.set(packet.d.user_id, user)
    if (packet.t === 'MESSAGE_REACTION_ADD') {
        bot.emit('messageReactionAdd', reaction, user);
    }
    if (packet.t === 'MESSAGE_REACTION_REMOVE') {
        bot.emit('messageReactionRemove', reaction, user);
    }
})



//Actions effectuée lorsque le bot rejoins un serveur
bot.on('guildCreate', guild => {
    ServChang.join(guild, bot, kyu, gpconfig, gconfig);
    utils.envoi_log(config.logs_serveurs, bot, guild, "info2");
})


//Actions effectuées lorsque le bot quitte un serveur
bot.on('guildDelete', guild => {
    ServChang.leave(guild, bot, gconfig);
    utils.envoi_log(config.logs_serveurs, bot, guild);
})


//Gestion des commandes
bot.on('messageCreate', async msg => {

    //Conditions pour exécuter le bloc
    await msg.author.fetch().catch(e => e);

    if (msg.channel.type == ChannelType.GuildText || (msg.channel.type == 1 && msg.content.toString() == "!aide")) return;
    if (msg.author.bot) return;

    //Envoie le préfixe lorsqu'il est mentionné
    if(msg.content.split(' ').length == 1 && msg.mentions.has(bot.user, { ignoreEveryone: true, ignoreRoles: true })){
        let embed = new EmbedBuilder()
            .setColor([59,229,53])
            .setThumbnail('https://media.discordapp.net/attachments/659758501865717790/680102643519193089/help_sparky.png')
            .setTitle("Perdu?")
            .setDescription("Pour obtenir la liste de mes commandes, faites **/aide**")
            .setFooter({text: "Développé par Kyusaki#9053", iconURL: kyu.displayAvatarURL()})
        msg.channel.send({embeds: [embed]})
        .catch(error => console.log(utils.displayConsoleHour() + "Impossible d'envoyer le préfixe. #" + msg.channel.name + ", " + msg.guild.name + " (" + msg.guild.id + ")"))
    }

})

//Gestion des / commandes
bot.on('interactionCreate', async intera => {

    if(intera.type !== InteractionType.ApplicationCommand) return;

    if(!gconfig[intera.guild.id]) {
        gconfig[intera.guild.id] = {
            name : intera.guild.name,
            active : true,
        }
        console.log(utils.displayConsoleHour() + " guild crée car inexistante: " + intera.guild.name + " (" + intera.guild.id + ")");
    }

    let commandFile = require('./modules/commands/' + intera.commandName + '.js')
    if(!commandFile) {
        intera.reply({ content: 'Une erreur est survenue pendant l\'éxecution de la commande!', ephemeral: true }).catch(e => e);
        return console.log('pas de commande')
    }
    if(!intera.guildId) return intera.reply('Les commandes sont à réaliser sur un serveur !');

    let args = {
        intera: intera,
        bot: bot,
        kyu: kyu,
        gconfig: gconfig,
        gpconfig: gpconfig,
        userstatus: usersStatus,
}
    try {
        await commandFile.run(args)
    } catch (error) {
        console.log(error)
        intera.deleteReply().catch(e => e)
        await intera.followUp({ content: 'Une erreur est survenue pendant l\'éxecution de la commande!', ephemeral: true });
    }

    //Envoi dans la console
    utils.envoi_log(config.logs_users, bot, intera);

    fs.writeFileSync('./data/guild_config.json', JSON.stringify(gconfig));
    fs.writeFileSync('./data/globalPing.json', JSON.stringify(gpconfig));
    
})

//Gestion des mp
bot.on('messageCreate', async msg => {
    if(msg.channel.type != ChannelType.DM || msg.author.bot) return;

    let MsgFiles = [];
    msg.attachments.forEach(e => {
        MsgFiles.push(e.url)
    });

    chan_mp.send("`" + msg.author.id + "`")
    chan_mp.send('__**' + msg.author.tag + ' a envoyé:**__')

    chan_mp.send(msg.content, { files: MsgFiles }).catch(e => e);

    if(msg.content == "!aide") msg.channel.send("Vous devez exécuter la commande aide sur un serveur, pas en messages privés avec moi 😄\n\nDe plus, le bot a désormais un unique préfixe ``/`` au lieu de ``!`` sur tous les serveurs").catch(e => e)
})