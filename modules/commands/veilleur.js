const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {

    name: 'veilleur',
    description: 'définit le panneau de notifications d\'évènement infernaux',

    data: new SlashCommandBuilder()
        .setName('veilleur')
        .setDescription('définit le panneau de notifications d\'évènement infernaux'),

    run: async function (args) {

        //Check perm admin/gérer salons
        if(!args.intera.memberPermissions.has([PermissionFlagsBits.ManageChannels])) return args.intera.reply("Vous devez avoir la permission de gérer les salons pour exécuter cette commande !");

        //Check perm du bot
        let botmember = await args.intera.guild.members.fetch(args.bot);
        let missingPermsString = "Je ne peux pas définir le panneau de notifications sans les permissions nécessaires. Il me manque ces permissions:\n";
        if(!botmember.permissions.has([PermissionFlagsBits.ManageRoles])) missingPermsString += "-`Gérer les rôles`\n";
        if(!botmember.permissions.has([PermissionFlagsBits.ManageChannels])) missingPermsString += "-`Gérer les salons`\n";
        if(!botmember.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles])) return args.intera.reply(missingPermsString);


        //Confirmation puis réinitialisation des rôles
        let gpconfig = args.gpconfig[args.intera.guildId]
        
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
            
            args.intera.reply({ content: "Les notifications d'infernaux sont déjà définies, voulez-vous les reparamétrer?", components: [boutons]})

            //Collecteur du bouton
            let coll;
            try {
                const filter = (i) => i.user.id == args.intera.user.id && ['reparam-oui', 'reparam-non'].includes(i.customId)
                coll = await args.intera.channel.awaitMessageComponent({ filter, time: 30000, componentType: ComponentType.Button}) 
            }
            catch { return args.intera.editReply({content: "Commande annulée", components: []})}
            
            if(coll.customId == 'reparam-non') return args.intera.editReply({content: "Commande annulée", components: []})

            await utils.deleteRole(bot, msg.guild.id, gpconfig.roles.CDR);
            await utils.deleteRole(bot, msg.guild.id, gpconfig.roles.CDT);
            await utils.deleteRole(bot, msg.guild.id, gpconfig.roles.ID);
            await utils.deleteRole(bot, msg.guild.id, gpconfig.roles.IVR);
            await utils.deleteRole(bot, msg.guild.id, gpconfig.roles.IV);
            await utils.deleteRole(bot, msg.guild.id, gpconfig.roles.IDR);
            await utils.deleteRole(bot, msg.guild.id, gpconfig.roles.OJ);
            await utils.deleteRole(bot, msg.guild.id, gpconfig.roles.OR);
            await utils.deleteChan(bot, msg.guild.id, gpconfig.chan_notifs);
            await utils.deleteChan(bot, msg.guild.id, gpconfig.chan_board);

        }
    }
}