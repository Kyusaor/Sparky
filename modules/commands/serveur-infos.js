const Discord = require('discord.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const utils = require('../utils.js');


module.exports = {

    name: "serveur-infos",

    description: "Envoie les infos du serveur",

    level: 1,

    data: 
        new SlashCommandBuilder()
            .setName('serveur-infos')
            .setDescription('Envoie les infos du serveur'),

    run: async function(args) {

        let creation = args.intera.guild.createdAt;
        let title = args.intera.guild.name;
        let pdp = args.intera.guild.iconURL();
        let ownerUser = await args.bot.users.fetch(args.intera.guild.ownerId);
        let owner = ownerUser.tag;
        let membercount = args.intera.guild.memberCount;
        
        let embed = new EmbedBuilder()
            .setTitle(title)
            .setColor([16, 231, 215])
            .setThumbnail(pdp)
            .addFields([
                {name: "__Propriétaire__", value: owner},
                {name: "__Serveur créé le__", value: utils.zero(creation.getDate()) + "/" + utils.zero(creation.getMonth() + 1) + "/" + creation.getFullYear() + " à " + utils.zero(creation.getHours()) + ":" + utils.zero(creation.getMinutes())},
                {name: "__Nombre de membres__", value: membercount.toString()}
            ])
            .setFooter({text: "ID: " + args.intera.guildId, iconURL: args.kyu.displayAvatarURL()});

        args.intera.reply({embeds: [embed]})
        .catch(err => utils.errorSendReply('serveur-infos', args))
    }
}