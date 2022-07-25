const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
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
        
        let embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setColor([16, 231, 215])
            .setThumbnail(pdp)
            .addField("__Propriétaire__", owner)
            .addField("__Serveur créé le__", utils.zero(creation.getDate()) + "/" + utils.zero(creation.getMonth() + 1) + "/" + creation.getFullYear() + " à " + utils.zero(creation.getHours()) + ":" + utils.zero(creation.getMinutes()))
            .addField("__Nombre de membres__", membercount.toString())
            .setFooter({text: "ID: " + args.intera.guild.id, iconURL: args.kyu.displayAvatarURL()});

        args.intera.reply({embeds: [embed]})
        .catch(err => utils.errorSendReply('serveur-infos', args))
    }
}