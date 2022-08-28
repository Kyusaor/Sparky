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
const { InteractionType, ChannelType, PermissionFlagsBits, ButtonStyle } = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');


//Déclaration des fonctions utilisées
var kyu = [];
var usersStatus = [];
var chan_mp, chan_logInf;


//Démarrage du bot
bot.login(Private.token);

bot.on('ready', async () => {
    utils.envoi_log(config.logs_connexions, bot, config.version)
    utils.statusLoop(bot);
    kyu = await bot.users.fetch(config.kyu);
    chan_mp = await bot.channels.cache.get(config.logs_mp);
    let chanGP = await bot.channels.cache.get(config.gp_dashboard);
    chan_logInf = await bot.channels.cache.get(config.logs_inf);
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
        intera.deferReply();
        if(intera.message.partial) {
            try {
                await intera.message.fetch();
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

//Gestion des pings infernaux
    if(intera.isButton()) {
        if(intera.message.id !== gpconfig.settings.msg_annonce) return;

        let type = "";

        switch(intera.customId) {

            case 'Veilleur':
                type = "infernal veilleur";

                let veillboutons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('VeillRech')
                            .setEmoji('660453261979025418')
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('VeillConstru')
                            .setEmoji('607559564535267348')
                            .setStyle(ButtonStyle.Secondary),
                            
                        new ButtonBuilder()
                            .setCustomId('VeillFusion')
                            .setEmoji('607554115416883200')
                            .setStyle(ButtonStyle.Secondary),
                            
                        new ButtonBuilder()
                            .setCustomId('VeillLaby')
                            .setEmoji('607561368421400576')
                            .setStyle(ButtonStyle.Secondary),
                            
                        new ButtonBuilder()
                            .setCustomId('VeillRdp')
                            .setEmoji('607559484486844436')
                            .setStyle(ButtonStyle.Secondary),
                            
                        new ButtonBuilder()
                            .setCustomId('VeillChasse')
                            .setEmoji('614816781420199937')
                            .setStyle(ButtonStyle.Secondary),
                            
                    )
                intera.reply({content: "__Choisis le type d'évènement Veilleur:__\n<:academie:607196986948452377>-Recherche\n<:batiment:607559564535267348>-Construction\n<:pacte:607554115416883200>-Fusion\n<:labyrinthe:607561368421400576>-Laby\n<:royaume_pouvoir:607559484486844436>-Royaume du pouvoir\n<:chasse:614816781420199937>: Chasse\n\n:warning: *Ignorez pour annuler*", components: [veillboutons]});

                break;

            case 'Dragon':
                type = "infernal dragon recherche";
                break;

            case 'OR':
                type = "orbes rouges";
                break;

            case 'OJ':
                type = "orbes jaunes";
                break;

            default:
                console.log("esh c'est pas normal ça hein")
                break;
        }

        let mess = utils.createHellEventMessage(type);

        for(serv of Object.keys(gpconfig)) {
            if(!gpconfig[serv].ping) continue;
            let chan_notifs = await bot.channels.fetch(gpconfig[serv].chan_notifs).catch(e => e);
            if(!chan_notifs) {console.log("salon introuvable: " + gpconfig[serv].chan_notifs + " (serveur " + serv); continue}
            
            await chan_notifs.send("<@&" + gpconfig[serv].roles[intera.customId] + ">" + mess);
        }

        console.log("Un " + type + " a été signalé par " + intera.user.username + " (" + intera.user.id + ")")
        chan_logInf.send("Un " + type + " a été signalé par " + intera.user.username + " (" + intera.user.id + ")")
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