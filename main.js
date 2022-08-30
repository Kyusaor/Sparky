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
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');


//Déclaration des fonctions utilisées
var kyu = [];
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

        if(!intera.guildId && intera.commandName !== 'lien') return intera.reply('Les commandes sont à réaliser sur un serveur !');
        
        if(intera.channel.type !== ChannelType.DM && !gconfig[intera.guild.id]) {
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
    
        let args = {
            intera: intera,
            bot: bot,
            kyu: kyu,
            gconfig: gconfig,
            gpconfig: gpconfig,
    }
        try {
            await commandFile.run(args)
        } catch (error) {
            console.log(error)
            intera.deleteReply().catch(e => e)
            await utils.interaReply({ content: 'Une erreur est survenue pendant l\'éxecution de la commande!', ephemeral: true }, intera).catch(e => e);
        }
    
        //Envoi dans la console
        if(intera.channel.type !== ChannelType.DM) utils.envoi_log(config.logs_users, bot, intera);
    
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
        if(!intera.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) return utils.interaReply({content: "Il me manque la permission de gérer les rôles", ephemeral: true}, intera)
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
        let roleping = intera.customId;

        switch(intera.customId) {

            case 'Veilleur':
                type = "infernal veilleur";

                let veillboutons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('recherche')
                            .setEmoji('660453261979025418')
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('construction')
                            .setEmoji('607559564535267348')
                            .setStyle(ButtonStyle.Secondary),
                            
                        new ButtonBuilder()
                            .setCustomId('fusion')
                            .setEmoji('607554115416883200')
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('labyrinthe')
                            .setEmoji('607561368421400576')
                            .setStyle(ButtonStyle.Secondary),
                            
                        new ButtonBuilder()
                            .setCustomId('royaume')
                            .setEmoji('607559484486844436')
                            .setStyle(ButtonStyle.Secondary),

                    )
                let veillboutons2 = new ActionRowBuilder()
                    .addComponents(                                
                        new ButtonBuilder()
                            .setCustomId('chasse')
                            .setEmoji('614816781420199937')
                            .setStyle(ButtonStyle.Secondary),
                                
                    )
                intera.reply({content: "__Choisis le type d'évènement Veilleur:__\n<:academie:607196986948452377>-Recherche\n<:batiment:607559564535267348>-Construction\n<:pacte:607554115416883200>-Fusion\n<:labyrinthe:607561368421400576>-Laby\n<:royaume_pouvoir:607559484486844436>-Royaume du pouvoir\n<:chasse:614816781420199937>: Chasse\n\n:warning: *Ignorez pour annuler*", components: [veillboutons, veillboutons2], ephemeral: true});
                
                let collVType;
                try {
                    const filter = (i) => i.user.id == intera.user.id && ['recherche', 'construction', 'fusion', 'labyrinthe', 'royaume', 'chasse'].includes(i.customId)
                    collVType = await intera.channel.awaitMessageComponent({ filter, time: 30000, componentType: ComponentType.Button}) 
                }
                catch { return await utils.interaReply({content: "Commande annulée", components: [], ephemeral: true}, intera)}
    
                let confirmVeilleur = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirmv-oui')
                            .setEmoji('✅')
                            .setStyle(ButtonStyle.Secondary),
                        
                        new ButtonBuilder()
                            .setCustomId('confirmv-non')
                            .setEmoji('❌')
                            .setStyle(ButtonStyle.Secondary)
                    )
                
                await utils.interaReply({ content: "Voulez vous signaler un infernal veilleur " + collVType.customId + "?", components: [confirmVeilleur], ephemeral: true}, intera)

                let collVconfirm;
                try {
                    const filter = (i) => i.user.id == intera.user.id && ['confirmv-non', 'confirmv-oui'].includes(i.customId)
                    collVconfirm = await intera.channel.awaitMessageComponent({ filter, time: 30000, componentType: ComponentType.Button}) 
                }
                catch { return utils.interaReply({content: "Commande annulée", components: [], ephemeral: true}, intera)}

                if(collVconfirm.customId == 'confirmv-non') return await utils.interaReply({content: "Commande annulée", components: [], ephemeral: true}, intera)
                await utils.interaReply({content: "Signalé!", ephemeral: true, components: []}, intera)
                
                type = "veilleur " + collVType.customId
                if(collVType.customId == "recherche") roleping = "IVR"
                else roleping = "IV"
                break;

            case 'Dragon':
                let dragonboutons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('recherche')
                            .setEmoji('660453599318638592')
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('construction')
                            .setEmoji('607559564535267348')
                            .setStyle(ButtonStyle.Secondary),
                            
                        new ButtonBuilder()
                            .setCustomId('labyrinthe')
                            .setEmoji('607561368421400576')
                            .setStyle(ButtonStyle.Secondary),
                            
                        new ButtonBuilder()
                            .setCustomId('royaume')
                            .setEmoji('607559484486844436')
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId('chasse')
                            .setEmoji('614816781420199937')
                            .setStyle(ButtonStyle.Secondary),
                    )
                let dragonboutons2 = new ActionRowBuilder()
                    .addComponents(                                
                        new ButtonBuilder()
                            .setCustomId('crech')
                            .setEmoji('🇷')
                            .setStyle(ButtonStyle.Secondary),
                                
                        new ButtonBuilder()
                            .setCustomId('ctrou')
                            .setEmoji('🇪')
                            .setStyle(ButtonStyle.Secondary),
)
                intera.reply({content: "__Choisis le type d'évènement Dragon:__\n<:academie:607196986948452377>-Recherche\n<:batiment:607559564535267348>-Construction-Fusion\n<:labyrinthe:607561368421400576>-Laby\n<:royaume_pouvoir:607559484486844436>-Royaume du pouvoir\n<:chasse:614816781420199937>: Chasse\n\nChallenge:\n-🇷:Challenge recherche\n-🇪:Challenge entraînement\n\n:warning: *Ignorez pour annuler*", components: [dragonboutons, dragonboutons2], ephemeral: true});
                
                let collDType;
                try {
                    const filter = (i) => i.user.id == intera.user.id && ['recherche', 'construction', 'labyrinthe', 'royaume', 'chasse', 'crech', 'ctrou'].includes(i.customId)
                    collDType = await intera.channel.awaitMessageComponent({ filter, time: 30000, componentType: ComponentType.Button}) 
                }
                catch { return await utils.interaReply({content: "Commande annulée", components: [], ephemeral: true}, intera)}
    
                let confirmDragon = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirmd-oui')
                            .setEmoji('✅')
                            .setStyle(ButtonStyle.Secondary),
                        
                        new ButtonBuilder()
                            .setCustomId('confirmd-non')
                            .setEmoji('❌')
                            .setStyle(ButtonStyle.Secondary)
                    )
                
                switch(collDType.customId) {
                    case 'recherche':
                        roleping = 'IDR'
                        type = "infernal dragon " + collDType.customId;
                        break;
                    
                    case 'crech':
                        roleping = 'CDR'
                        type = 'Challenge Dragon Recherche'
                        break;

                    case 'ctrou':
                        roleping = 'CDT'
                        type = 'Challenge Dragon Entrainement';
                        break;

                    default:
                        roleping = 'ID'
                        type = "infernal dragon " + collDType.customId;
                        break;
                }

                await utils.interaReply({ content: "Voulez vous signaler un " + type + "?", components: [confirmDragon], ephemeral: true}, intera)

                let collDconfirm;
                try {
                    const filter = (i) => i.user.id == intera.user.id && ['confirmd-non', 'confirmd-oui'].includes(i.customId)
                    collDconfirm = await intera.channel.awaitMessageComponent({ filter, time: 30000, componentType: ComponentType.Button}) 
                }
                catch { return utils.interaReply({content: "Commande annulée", components: [], ephemeral: true}, intera)}

                if(collDconfirm.customId == 'confirmd-non') return await utils.interaReply({content: "Commande annulée", components: [], ephemeral: true}, intera)
                await utils.interaReply({content: "Signalé!", ephemeral: true, components: []}, intera)
                break;

            case 'OR':
                type = "orbes rouges";
                let confirmOR = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirmor-oui')
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Secondary),
                    
                    new ButtonBuilder()
                        .setCustomId('confirmor-non')
                        .setEmoji('❌')
                        .setStyle(ButtonStyle.Secondary)
                )

                await utils.interaReply({content: "Voulez-vous signaler un infernal orbes rouges?", ephemeral: true, components: [confirmOR]}, intera)

                let collOR;
                try {
                    const filter = (i) => i.user.id == intera.user.id && ['confirmor-non', 'confirmor-oui'].includes(i.customId)
                    collOR = await intera.channel.awaitMessageComponent({ filter, time: 30000, componentType: ComponentType.Button}) 
                }
                catch { return utils.interaReply({content: "Commande annulée", components: [], ephemeral: true}, intera)}
                if(collOR.customId == 'confirmor-non') return await utils.interaReply({content: "Commande annulée", components: [], ephemeral: true}, intera)
                await utils.interaReply({content: "Signalé!", ephemeral: true, components: []}, intera)
                break;

            case 'OJ':
                type = "orbes jaunes";
                let confirmOJ = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirmoj-oui')
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Secondary),
                    
                    new ButtonBuilder()
                        .setCustomId('confirmoj-non')
                        .setEmoji('❌')
                        .setStyle(ButtonStyle.Secondary)
                )

                await utils.interaReply({content: "Voulez-vous signaler un infernal orbes jaunes?", ephemeral: true, components: [confirmOJ]}, intera)

                let collOJ;
                try {
                    const filter = (i) => i.user.id == intera.user.id && ['confirmoj-non', 'confirmoj-oui'].includes(i.customId)
                    collOJ = await intera.channel.awaitMessageComponent({ filter, time: 30000, componentType: ComponentType.Button}) 
                }
                catch { return utils.interaReply({content: "Commande annulée", components: [], ephemeral: true}, intera)}
                if(collOJ.customId == 'confirmoj-non') return await utils.interaReply({content: "Commande annulée", components: [], ephemeral: true}, intera)
                await utils.interaReply({content: "Signalé!", ephemeral: true, components: []}, intera)
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
            
            try {
                await chan_notifs.send("<@&" + gpconfig[serv].roles[roleping] + ">" + mess);
            } catch { console.log("Impossible d'envoyer la notif serveur " + serv) }
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