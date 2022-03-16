//Paramétrage global
const Discord = require('discord.js');
const config = require('./data/config.js');
const bot = new Discord.Client({ intents: config.intents});
const fs = require('fs');
var gconfig = JSON.parse(fs.readFileSync('./data/guild_config.json'));
var gpconfig = JSON.parse(fs.readFileSync('./data/globalPing.json'));


//Récupération des fichiers nécessaires
const ServChang = require('./modules/ServersChanging.js');
const CommandManager = require('./modules/commandManager.js');
const utils = require('./modules/utils.js');
const ReactManager = require('./modules/reactManager.js');
const Private = require('./data/private.js');


//Déclaration des fonctions utilisées
var kyu = [];
var usersStatus = [];
var chan_mp;


//Démarrage du bot
bot.login(Private.token);

bot.on('ready', async () => {
    utils.envoi_log(config.logs_connexions, bot, config.version)
    utils.statusLoop(bot);
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

    if (msg.channel.type != 'GUILD_TEXT') return;
    if (msg.author.bot) return;
    if(!gconfig[msg.guild.id]) {
        console.log(gconfig[msg.guild.id])
        console.log(msg.guild.name)
        gconfig[msg.guild.id] = {
            name : msg.guild.name,
            prefix : "!",
            active : true,
        }
        return console.log(utils.displayConsoleHour() + " guild crée car inexistante: " + msg.guild.name + " (" + msg.guild.id + ")");
    }

    //Envoie le préfixe lorsqu'il est mentionné
    if(msg.content.split(' ').length == 1 && msg.mentions.has(bot.user, { ignoreEveryone: true, ignoreRoles: true })){
        let embed = new Discord.MessageEmbed()
            .setColor([59,229,53])
            .setThumbnail('https://media.discordapp.net/attachments/659758501865717790/680102643519193089/help_sparky.png')
            .setTitle("Perdu?")
            .setDescription("Pour obtenir la liste de mes commandes, faites **/aide**")
            .setFooter("Développé par Kyusaki#9053", kyu.displayAvatarURL())
        msg.channel.send(embed)
        .catch(error => console.log(utils.displayConsoleHour() + "Impossible d'envoyer le préfixe. #" + msg.channel.name + ", " + msg.guild.name + " (" + msg.guild.id + ")"))
    }

    //Vérifie que le messge est une commande
    if (!(msg.content.trim().startsWith(gconfig[msg.guild.id].prefix) || ((msg.author.id === kyu.id) && msg.content.startsWith(config.devPrefix)))) return;

    //Définit la liste des commandes accessibles au membre
    let liste_commandes = new CommandManager(msg.member);

    //Vérifie si la commande existe puis l'exécute
    let command_caller = msg.content.trim().toLowerCase().split(' ')[0].slice(1);
    if(Object.keys(liste_commandes.aliases).includes(command_caller)){command_caller = liste_commandes.aliases[command_caller]}
    if (liste_commandes[command_caller]) {
        let args = {
            msg: msg,
            kyu: kyu,
            prefix: utils.préfixe(msg.guild.id, gconfig, bot),
            command_caller: command_caller,
            bot: bot,
            gconfig: gconfig,
            gpconfig: gpconfig,
            userstatus: usersStatus,
        }
        await liste_commandes[command_caller].command.run(args);

        //Envoi dans la console
        utils.envoi_log(config.logs_users, bot, msg, command_caller);

        fs.writeFileSync('./data/guild_config.json', JSON.stringify(gconfig));
        fs.writeFileSync('./data/globalPing.json', JSON.stringify(gpconfig));

    }

})

//Gestion des mp
bot.on('messageCreate', async msg => {
    if(msg.channel.type != "DM" || msg.author.bot) return;
    
    let MsgFiles = [];
    msg.attachments.forEach(e => {
        MsgFiles.push(e.url)
    });

    chan_mp.send("`" + msg.author.id + "`")
    chan_mp.send('__**' + msg.author.tag + ' a envoyé:**__')

    chan_mp.send(msg.content, { files: MsgFiles });

    if(msg.content == "!aide") msg.channel.send("Vous devez exécuter la commande aide sur un serveur, pas en messages privés avec moi 😄").catch(e => e)
})

//gestion réactions
bot.on('messageReactionAdd', async (reaction, user) => {
    await user.fetch().catch(e => console.log('Errreur fetch reactadd'));
    if(!reaction) return;
    ReactManager.selecter(reaction, user, bot, gpconfig, true);
})

bot.on('messageReactionRemove', async (reaction, user) => {
    await user.fetch().catch(e => console.log('Errreur fetch reactremove'));
    if(!reaction) return;
    ReactManager.selecter(reaction, user, bot, gpconfig, false);
})