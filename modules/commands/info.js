const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('./modules/utils.js');


module.exports = {

    name: "info",

    description: "Envoie les infos d\'un compte discord ou du serveur",

    level: 1,

    data: 
        new SlashCommandBuilder()
            .setName('info')
            .setDescription('Envoie les infos d\'un compte discord ou du serveur')
            .addSubcommand(sub =>
                sub
                    .setName('utilisateur')
                    .setDescription('Donne les infos d\'un utilisateur')
                    .addUserOption(opt => opt.setName('pseudo').setDescription('Le membre cible')))
            .addSubcommand(sub =>
                sub
                    .setName('serveur')
                    .setDescription('Donne les infos du serveur')
            ),

    run: function(args) {


        if(args.intera.options.getSubcommand() == 'serveur') {

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
        //Déclaration des variables utiles
        /*let membre = msg.mentions.members.first() || msg.member;
        let liste_roles = membre.roles.cache.map(r=> r.name).slice(0, -1).join(', ');
        if(membre.roles.cache.size == 1) liste_roles = "Aucun rôle";
        let date_join = membre.joinedAt;
        

        let compte_discord = membre.user;
        let date_creation = compte_discord.createdAt;
        let pdp = compte_discord.displayAvatarURL();

        let auteur = compte_discord.username;
        if(membre.nickname) auteur += " (" + membre.nickname + ")"

        function utils.zero(variable) {
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
            .addField("__" + profileType + " créé le__:", utils.zero(date_creation.getDate()) + "/" + utils.zero(date_creation.getMonth() + 1) + "/" + date_creation.getFullYear() + " à " + utils.zero(date_creation.getHours()) + ":" + utils.zero(date_creation.getMinutes()))
            .addField("__Date d'arrivée sur le serveur__:", "Le " + utils.zero(date_join.getDate()) + "/" + utils.zero(date_join.getMonth() + 1) + "/" + date_join.getFullYear() + " à " + utils.zero(date_join.getHours()) + ":" + utils.zero(date_join.getMinutes()))
            .addField("__Rôles__", liste_roles)
        msg.channel.send(embed)*/
    }
}