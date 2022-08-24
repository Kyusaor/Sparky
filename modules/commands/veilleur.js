const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SelectMenuBuilder } = require('discord.js');
const utils = require('../utils.js');
const fs = require('fs');

module.exports = {

    name: 'veilleur',
    description: 'définit le panneau de notifications d\'évènement infernaux',
    admin: true,

    data: new SlashCommandBuilder()
        .setName('veilleur')
        .setDescription('définit le panneau de notifications d\'évènement infernaux')
        .setDMPermission(false),

    run: async function (args) {

        let intera = args.intera;
        //Check perm admin/gérer salons
        if(intera.user.id !== args.kyu.id && !intera.memberPermissions.has([PermissionFlagsBits.ManageChannels])) return utils.interaReply("Vous devez avoir la permission de gérer les salons pour exécuter cette commande !", intera);

        //Check perm du bot
        let botmember = await intera.guild.members.fetch(args.bot);
        let missingPermsString = "Je ne peux pas définir le panneau de notifications sans les permissions nécessaires. Il me manque ces permissions:\n";
        if(!botmember.permissions.has([PermissionFlagsBits.ManageRoles])) missingPermsString += "-`Gérer les rôles`\n";
        if(!botmember.permissions.has([PermissionFlagsBits.ManageChannels])) missingPermsString += "-`Gérer les salons`\n";
        if(!botmember.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles])) return utils.interaReply(missingPermsString, intera);


        //Confirmation puis réinitialisation des rôles
        let gpconfig = args.gpconfig[intera.guildId]
        if(!gpconfig) {
            gpconfig = {}
        }
        
        if(gpconfig.ping) {

            //Création du message
            let boutons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('reparam-oui')
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Secondary),
                    
                    new ButtonBuilder()
                        .setCustomId('reparam-non')
                        .setEmoji('❌')
                        .setStyle(ButtonStyle.Secondary)
                )

            await utils.interaReply({ content: "Les notifications d'infernaux sont déjà définies, voulez-vous les reparamétrer?", components: [boutons]}, intera)

            //Collecteur du bouton
            let coll;
            try {
                const filter = (i) => i.user.id == intera.user.id && ['reparam-oui', 'reparam-non'].includes(i.customId)
                coll = await intera.channel.awaitMessageComponent({ filter, time: 30000, componentType: ComponentType.Button}) 
            }
            catch { return utils.interaReply({content: "Commande annulée", components: []}, intera)}
            
            if(coll.customId == 'reparam-non') return utils.interaReply({content: "Commande annulée", components: []}, intera)
            await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.CDR);
            await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.CDT);
            await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.ID);
            await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.IVR);
            await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.IV);
            await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.IDR);
            await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.OJ);
            await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.OR);
            await utils.deleteChan(args.bot, intera.guild.id, gpconfig.chan_notifs);
            await utils.deleteChan(args.bot, intera.guild.id, gpconfig.chan_board);

        }

        //Création des salons
        await utils.interaReply({content: "<a:loading:739785338347585598> Paramétrage en cours...", components: []}, intera)
        
        gpconfig = {};
        let chan_board, chan_notifs;

        chan_board = await intera.guild.channels.create({

            name: 'tableau-veilleur-dragon',
            topic: 'Abonnez-vous aux notifications d\'évènements infernaux et challenge !',
            permissionOverwrites: [
                {
                    id: intera.guild.id,
                    deny:[PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages]
                },
                {
                    id: intera.applicationId,
                    allow:[PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageMessages]
                }
            ],
            reason: 'creation du salon d\'abonnement aux notifications'
        }).catch(console.error)


        chan_notifs = await intera.guild.channels.create({

            name: 'notifs-veilleurs-dragons',
            topic: 'Abonnez-vous aux notifications d\'évènements infernaux et challenge pour recevoir les mentions!',
            permissionOverwrites: [
                {
                    id: intera.guild.id,
                    deny:[PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages]
                },
                {
                    id: intera.applicationId,
                    allow:[PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel]
                }
            ],
            reason: 'creation du salon d\'abonnement aux notifications'
        }).catch(e => utils.errorSendReply('veilleur - crea chan_notifs', args))


        if(!chan_board || !chan_notifs) {
            if(chan_board) intera.guild.delete(chan_board, 'crash bot')
            if(chan_notifs) intera.guild.delete(chan_notifs, 'crash bot')
            return utils.interaReply("Une erreur s'est produite lors de l'exécution de la commande", intera)
        }


        //Envoi du message d'autorole
        let autoRoleEmbed = new EmbedBuilder()
            .setTitle('__**Signalement des Veilleurs et Dragons**__')
            .setDescription('Sélectionnez les évènements infernaux et les challenges qui vous intéressent. Les mentions seront faites dans le <#' + chan_notifs.id + ">")
            .setThumbnail('https://media.discordapp.net/attachments/659758501865717790/1007676744330903602/infernaux.png')
            .addFields(
                {
                    name: "__Comment ça marche?__",
                    value: 'Cliquez sur le menu déroulant et sélectionnez les types d\'évènements pour lesquels vous voulez être notifiés. C\'est tout!'
                }
            )
            .setFooter({text: 'Développé avec amour par ' + args.kyu.tag, iconURL: args.kyu.displayAvatarURL()})

        let menu = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('autorole')
                    .setPlaceholder('Choissez vos abonnements')
                    .setMinValues(0)
                    .setMaxValues(8)
                    .addOptions(
                        {
                            value: 'IVR',
                            label: 'Veilleur Recherche',
                            emoji: {
                                name: 'rechVeill',
                                id: '660453261979025418'
                            },
                            description: 'Soyez notifié quand il y a un évènement infernal veilleur recherche'
                        },
                        {
                            value: 'IV',
                            label: 'Veilleur',
                            emoji: {
                                name: 'veilleur',
                                id: '607194832271573024'
                            },
                            description: 'Soyez notifié quand il y a un évènement infernal veilleur'
                        },
                        {
                            value: 'IDR',
                            label: 'Dragon Recherche',
                            emoji: {
                                name: 'rechDrag',
                                id: '660453599318638592'
                            },
                            description: 'Soyez notifié quand il y a un évènement infernal dragon recherche'
                        },
                        {
                            value: 'ID',
                            label: 'Dragon du Chaos',
                            emoji: {
                                name: 'dragonLM',
                                id: '607194934759391242'
                            },
                            description: 'Soyez notifié quand il y a un évènement infernal dragon'
                        },
                        {
                            value: 'CDR',
                            label: 'Challenge Dragon Recherche',
                            emoji: {
                                name: 'academie',
                                id: '607196986948452377'
                            },
                            description: 'Soyez notifié quand il y a un challenge dragon recherche'
                        },
                        {
                            value: 'CDT',
                            label: 'Challenge Dragon Entraînement',
                            emoji: {
                                name: 'fantassin',
                                id: '607554773851570181'
                            },
                            description: 'Soyez notifié quand il y a un challenge dragon entraînement'
                        },
                        {
                            value: 'OR',
                            label: 'Orbes Rouges',
                            emoji: {
                                name: 'redorb',
                                id: '740688906755768470'
                            },
                            description: 'Soyez notifié quand il y a un infernal orbes rouges'
                        },
                        {
                            value: 'OJ',
                            label: 'Orbes Jaunes',
                            emoji: {
                                name: 'yellorb',
                                id: '740689133600768091'
                            },
                            description: 'Soyez notifié quand il y a un infernal orbes jaunes'
                        },
                    )
            )

        await chan_board.send({embeds: [autoRoleEmbed], components: [menu]});

        //Création des rôles
        async function creaRole (title) {
            let role = await intera.guild.roles.create({
                name: title,
                hoist: false,
                permissions: "0",
                mentionnable: true,
            })
            return role
        }

        let IVR = await creaRole('Veilleur recherche');
        let IV = await creaRole('Veilleur');
        let IDR = await creaRole('Dragon recherche');
        let ID = await creaRole('Dragon');
        let OR = await creaRole('Orbes rouges');
        let OJ = await creaRole('Orbes jaunes');
        let CDR = await creaRole('Challenge dragon recherche');
        let CDT = await creaRole('Challenge dragon troupes');


        await utils.interaReply("Terminé ! Les salons <#" + chan_board + "> et <#" + chan_notifs + "> ont bien été créés\nFaites `/stopveilleur` pour les supprimer", intera)

        //Gestion de la db
        gpconfig = {
            chan_board: chan_board.id,
            chan_notifs: chan_notifs.id,
            ping: true,
            roles: {
                IVR: IVR.id,
                IV: IV.id,
                IDR: IDR.id,
                ID: ID.id,
                OR: OR.id,
                OJ: OJ.id,
                CDR: CDR.id,
                CDT: CDT.id,
            }
        }

        args.gpconfig[intera.guildId] = gpconfig;
        fs.writeFileSync('./data/globalPing.json', JSON.stringify(args.gpconfig));

    }
}