const Discord = require('discord.js');

module.exports = {

    name: "infoserveur",

    description: "Envoi des infos sur ce serveur",

    level: 1,

    run: function (args){

        //Récupération des variables nécessaires
        let msg = args.msg;

        //Déclaration des dates
        let creation = msg.guild.createdAt;
        let pdp = msg.guild.iconURL();
        function zero(variable) {
            if(variable < 10){
                variable = '0' + variable  
            }
            return variable
        };


        //Création et envoi du message
        const embed = new Discord.MessageEmbed()
        .setTitle(msg.guild.name)
        .setColor([16, 231, 215])
        .setThumbnail(pdp)
        .addField("__Propriétaire__", msg.guild.owner.user.tag)
        .addField("__Serveur créé le__", zero(creation.getDate()) + "/" + zero(creation.getMonth() + 1) + "/" + creation.getFullYear() + " à " + zero(creation.getHours()) + ":" + zero(creation.getMinutes()))
        .addField("__Nombre de membres__", msg.guild.memberCount)
        .addField("__Préfixe:__", args.gconfig[msg.guild.id].prefix)
        .setFooter("ID: " + msg.guild.id)
        msg.channel.send(embed)
    },
}