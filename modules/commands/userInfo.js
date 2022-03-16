const Discord = require('discord.js');

module.exports = {

    name: "userinfo",

    description: "Envoie les infos de compte discord",

    level: 1,

    run: function(args) {

        //Récupération des variables nécessaires
        let msg = args.msg;

        //Déclaration des variables utiles
        let membre = msg.mentions.members.first() || msg.member;
        let liste_roles = membre.roles.cache.map(r=> r.name).slice(0, -1).join(', ');
        if(membre.roles.cache.size == 1) liste_roles = "Aucun rôle";
        let date_join = membre.joinedAt;
        

        let compte_discord = membre.user;
        let date_creation = compte_discord.createdAt;
        let pdp = compte_discord.displayAvatarURL();

        let auteur = compte_discord.username;
        if(membre.nickname) auteur += " (" + membre.nickname + ")"

        function zero(variable) {
            if(variable < 10){
                variable = '0' + variable  
            }
            return variable
        };

        //Création puis envoi de l'embed
        let profileType = "Compte";
        if(membre.user.bot) {profileType = "Bot"}
        const embed = new Discord.MessageEmbed()
            .setAuthor(auteur)
            .setColor([13, 84, 236])
            .setThumbnail(pdp)
            .setFooter("ID: " + compte_discord.id)
            .addField("__" + profileType + " créé le__:", zero(date_creation.getDate()) + "/" + zero(date_creation.getMonth() + 1) + "/" + date_creation.getFullYear() + " à " + zero(date_creation.getHours()) + ":" + zero(date_creation.getMinutes()))
            .addField("__Date d'arrivée sur le serveur__:", "Le " + zero(date_join.getDate()) + "/" + zero(date_join.getMonth() + 1) + "/" + date_join.getFullYear() + " à " + zero(date_join.getHours()) + ":" + zero(date_join.getMinutes()))
            .addField("__Rôles__", liste_roles)
        msg.channel.send(embed)
    }
}