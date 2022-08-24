//Paramétrage global
const Discord = require('discord.js');
const config = require('./data/config.js');
const bot = new Discord.Client(config.clientParam);
const fs = require('fs');
var gconfig = JSON.parse(fs.readFileSync('./data/guild_config.json'));
var gpconfig = JSON.parse(fs.readFileSync('./data/globalPing.json'));

//Récupération des fichiers nécessaires
const ServChang = require('./modules/ServersChanging.js');
const utils = require('./modules/utils.js');
const Private = require('./data/private.js');
const { InteractionType, ChannelType, PermissionFlagsBits } = require('discord.js');
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


//Gestion de la mention
bot.on('messageCreate', async msg => {

    //Conditions pour exécuter le bloc
    await msg.author.fetch().catch(e => e);
    if(msg.author.bot) return;

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

bot.on('interactionCreate', async intera => {

    intera.deferReply();

//Gestion des / commandes
    if(intera.type == InteractionType.ApplicationCommand) {

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
            await intera.followUp({ content: 'Une erreur est survenue pendant l\'éxecution de la commande!', ephemeral: true }).catch(e => e);
        }
    
        //Envoi dans la console
        utils.envoi_log(config.logs_users, bot, intera);
    
    }

//Gestion de l'autorole
    if(intera.isSelectMenu()) {
        if(intera.message.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Une erreur est survenue en récupérant le message:', error);
                return;
            }
        }
        if(intera.customId !== 'autorole') return;
        if(!intera.memberPermissions.has(PermissionFlagsBits.ManageRoles)) return utils.interaReply({content: "Il me manque la permission de gérer les rôles", ephemeral: true}, intera)
        if(!gpconfig[intera.guildId].roles) return console.log(utils.displayConsoleHour() + "Impossible de récupérer gpconfig de la guilde" + intera.guild.name + " (" + intera.guildId + ")");

        let membre = await intera.member.fetch();

        for(rol of Object.keys(gpconfig[intera.guildId].roles)) {
            let role = await intera.guild.roles.fetch(gpconfig[intera.guildId].roles[rol])
            if(!role) return console.log(utils.displayConsoleHour() + "Impossible de trouver le rôle " + rol + "(serveur " + intera.guild.name + " - " + intera.guildId + ")");
            if(intera.values.includes(rol)) await membre.roles.add(role, "Autorole sparky").catch(e => e)
            else await membre.roles.remove(role, "Autorole sparky").catch(e => e)
        }
        await utils.interaReply({content: "Vos rôles ont été mis à jour", ephemeral: true}, intera)
    }

    fs.writeFileSync('./data/guild_config.json', JSON.stringify(gconfig));
    fs.writeFileSync('./data/globalPing.json', JSON.stringify(gpconfig));
    
})

//Gestion des mp
bot.on('messageCreate', async msg => {
    if(msg.channel.type !== ChannelType.DM || msg.author.bot) return;

    let MsgFiles = [];
    msg.attachments.forEach(e => {
        MsgFiles.push(e.url)
    });

    chan_mp.send("`" + msg.author.id + "`")
    chan_mp.send('__**' + msg.author.tag + ' a envoyé:**__')

    if(msg.stickers.size == 1) chan_mp.send('{sticker}').catch(e => e)
    else chan_mp.send({ content: msg.content, files: MsgFiles }).catch(e => e);

    if(msg.content == "!aide") msg.channel.send("Vous devez exécuter la commande aide sur un serveur, pas en messages privés avec moi 😄\n\nDe plus, le bot a désormais un unique préfixe ``/`` au lieu de ``!`` sur tous les serveurs").catch(e => e)
})