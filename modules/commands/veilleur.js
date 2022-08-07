const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {

    name: 'veilleur',
    description: 'définit le panneau de notifications d\'évènement infernaux',

    data: new SlashCommandBuilder()
        .setName('veilleur')
        .setDescription('définit le panneau de notifications d\'évènement infernaux'),

    run: async function (args) {

        let botmember = await args.intera.guild.members.fetch(args.bot);
        let missingPermsString = "Je ne peux pas définir le panneau de notifications sans les permissions nécessaires. Il me manque ces permissions:\n"
        if(botmember.permissions.has([PermissionFlagsBits.ManageRoles])) missingPermsString += "-`Gérer les rôles`\n";
        if(botmember.permissions.has([PermissionFlagsBits.ManageChannels])) missingPermsString += "-`Gérer les salons`\n";
    }
}