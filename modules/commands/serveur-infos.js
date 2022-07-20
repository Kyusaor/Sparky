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
        console.log(creation)
        let title = args.intera.guild.name;
        console.log(title)
        let pdp = args.intera.guild.iconURL();
        console.log(pdp)
        let ownerUser = await args.bot.users.fetch(args.intera.guild.ownerId);
        let owner = ownerUser.tag;
        console.log(owner)
        let membercount = args.intera.guild.memberCount;
        console.log(utils.zero(creation.getDate()) + "/" + utils.zero(creation.getMonth() + 1) + "/" + creation.getFullYear() + " à " + utils.zero(creation.getHours()) + ":" + utils.zero(creation.getMinutes()))
        
        let embed = new Discord.MessageEmbed({
            title: title,
            color: [16, 231, 215],
            thumbnail: pdp,
            fields: {
                owner: [,"__Propriétaire__", owner],
                creationDate: ["__Serveur créé le__", utils.zero(creation.getDate()) + "/" + utils.zero(creation.getMonth() + 1) + "/" + creation.getFullYear() + " à " + utils.zero(creation.getHours()) + ":" + utils.zero(creation.getMinutes())],
                memberCount: ["__Nombre de membres__", membercount]
            },
            footer: { text: "ID: " + args.intera.guild.id, iconURL: args.kyu.avatarURL}
        })

        console.log(embed)
        args.intera.channel.send(embed).catch(c => console.log("nope"))
        console.log("2")
        args.intera.reply(embed)
        .catch(err => utils.errorSendReply('info', args))
        console.log('3')
    }
}