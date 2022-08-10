const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const utils = require('../utils.js');

module.exports = {

    name: 'veilleur',
    description: 'définit le panneau de notifications d\'évènement infernaux',

    data: new SlashCommandBuilder()
        .setName('veilleur')
        .setDescription('définit le panneau de notifications d\'évènement infernaux'),

    run: async function (args) {

        let intera = args.intera;
        intera.deferReply();
        console.log(1)
        //Check perm admin/gérer salons
        if(!intera.memberPermissions.has([PermissionFlagsBits.ManageChannels])) return utils.interaReply("Vous devez avoir la permission de gérer les salons pour exécuter cette commande !", intera);
        console.log(2)

        //Check perm du bot
        let botmember = await intera.guild.members.fetch(args.bot);
        let missingPermsString = "Je ne peux pas définir le panneau de notifications sans les permissions nécessaires. Il me manque ces permissions:\n";
        if(!botmember.permissions.has([PermissionFlagsBits.ManageRoles])) missingPermsString += "-`Gérer les rôles`\n";
        if(!botmember.permissions.has([PermissionFlagsBits.ManageChannels])) missingPermsString += "-`Gérer les salons`\n";
        if(!botmember.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles])) return utils.interaReply(missingPermsString, intera);
        console.log(3)


        //Confirmation puis réinitialisation des rôles
        let gpconfig = args.gpconfig[intera.guildId]
        if(!gpconfig) {
            gpconfig = {}
        }
        
        console.log(4)
        if(gpconfig.ping) {
            console.log(4.1)

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

            console.log(4.2)
            utils.interaReply({ content: "Les notifications d'infernaux sont déjà définies, voulez-vous les reparamétrer?", components: [boutons]}, intera)

            //Collecteur du bouton
            let coll;
            try {
                const filter = (i) => i.user.id == intera.user.id && ['reparam-oui', 'reparam-non'].includes(i.customId)
                coll = await intera.channel.awaitMessageComponent({ filter, time: 30000, componentType: ComponentType.Button}) 
            }
            catch { return utils.interaReply({content: "Commande annulée", components: []}, intera)}
            
            if(coll.customId == 'reparam-non') return utils.interaReply({content: "Commande annulée", components: []}, intera)
            console.log(4.3)
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

        console.log(5)

        //Création des salons
        utils.interaReply("<a:loading:739785338347585598> Paramétrage en cours...", intera)
        /*try {
            await intera.reply("<a:loading:739785338347585598> Paramétrage en cours...")
        } catch {
            await intera.followUp("<a:loading:739785338347585598> Paramétrage en cours...")
        }*/
        
        gpconfig = {};
        let chan_board, chan_notifs;

        chan_board = await intera.guild.channels.create({

            name: 'tableau-veilleur-dragon',
            topic: 'Abonnez-vous aux notifications d\'évènements infernaux et challenge !',
            permissionsOverwrites: [
                {
                    id: intera.guild.id,
                    deny:[PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages]
                },
                {
                    id: args.bot.user.id,
                    allow:[PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel]
                }
            ],
            reason: 'creation du salon d\'abonnement aux notifications'
        }).catch(e => utils.errorSendReply('veilleur - crea chan_board', args))

        console.log(6)

        chan_notifs = await intera.guild.channels.create({

            name: 'notifs-veilleurs-dragons',
            topic: 'Abonnez-vous aux notifications d\'évènements infernaux et challenge sur le salon <#' + chan_board.id + '>!',
            permissionsOverwrites: [
                {
                    id: intera.guild.id,
                    deny:[PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages]
                },
                {
                    id: args.bot.user.id,
                    allow:[PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel]
                }
            ],
            reason: 'creation du salon d\'abonnement aux notifications'
        }).catch(e => utils.errorSendReply('veilleur - crea chan_notifs', args))

        console.log(7)
        if(!chan_board || !chan_notifs) {
            if(chan_board) intera.guild.delete(chan_board, 'crash bot')
            if(chan_notifs) intera.guild.delete(chan_notifs, 'crash bot')
            return utils.interaReply("Une erreur s'est produite lors de l'exécution de la commande", intera)
        }
        console.log(8)

        utils.interaReply("Les salons <#" + chan_board + "> et <#" + chan_notifs + "> ont été créés", intera)//à retirer plus tard
        gpconfig.chan_board = chan_board.id;
        gpconfig.chan_notifs = chan_notifs.id;
        gpconfig.ping = true;
        console.log(9)

        //Envoi du message d'autorole

        args.gpconfig[intera.guildId] = gpconfig;
        fs.writeFileSync('./data/globalPing.json', JSON.stringify(args.gpconfig));

    }
}