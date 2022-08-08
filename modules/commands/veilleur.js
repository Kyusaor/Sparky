const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

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
        
        
    }
}