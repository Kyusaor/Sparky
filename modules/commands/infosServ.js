const Discord = require('discord.js');
const fs = require('fs');
const utils = require('./utils.js');

module.exports = {

    name: "infoserv",

    structure: "infoserv <ID>",

    description: "Envoi des infos sur le serveur mentionné",

    level: 3,

    run: function (args){

        //Récupération des variables
        let msg = args.msg;
        let bot = args.bot;
        let gconfig = JSON.parse(fs.readFileSync('./data/guild_config.json'));

        //Conditions d'exécution
        if(msg.content.split(' ').length > 2) return msg.channel.send("Format de commande invalide")
        let guildID = msg.content.split(' ')[1] || msg.guild.id;
        if(!gconfig[guildID]) return msg.channel.send("ID invaide");

        //Exécution
        let guild = bot.guilds.cache.get(guildID);
        if(!guild) return msg.channel.send("Je ne peux pas récupérer les infos de serveurs où je ne suis pas");
        let creation = guild.createdAt;

        let embed = new Discord.MessageEmbed()
        .setTitle(gconfig[guildID].name)
        .setColor([0,174,219])
        .setThumbnail(guild.iconURL())
        .addField("__ID:__", guildID)
        .addField("__Propriétaire__", guild.owner.user.tag + "\nID: " + guild.owner.user.id)
        .addField("__Serveur créé le__", utils.zero(creation.getDate()) + "/" + utils.zero(creation.getMonth() + 1) + "/" + creation.getFullYear() + " à " + utils.zero(creation.getHours()) + ":" + utils.zero(creation.getMinutes()))
        .addField("__Nombre de membres__", guild.memberCount)
        .addField("__Préfixe du bot:__", gconfig[guildID].prefix)
        msg.channel.send(embed)
    },
}