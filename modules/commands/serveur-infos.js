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
        let pdp = args.intera.guild.iconURL();
            
        let embed = new Discord.MessageEmbed()
            .setTitle(args.intera.guild.name)
            .setColor([16, 231, 215])
            .setThumbnail(pdp)
            .addField("__Propriétaire__", args.intera.guild.owner.user.tag)
            .addField("__Serveur créé le__", utils.zero(creation.getDate()) + "/" + utils.zero(creation.getMonth() + 1) + "/" + creation.getFullYear() + " à " + utils.zero(creation.getHours()) + ":" + utils.zero(creation.getMinutes()))
            .addField("__Nombre de membres__", args.intera.guild.memberCount)
            .setFooter({ text: "ID: " + args.intera.guild.id, iconURL: args.kyu})

        args.intera.reply(embed)
        .catch(err => utils.errorSendReply('info', args))
    }
}