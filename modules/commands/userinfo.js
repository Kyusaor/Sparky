const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../utils');


module.exports = {

    name: "info",

    description: "Envoie les infos d\'un compte discord",

    level: 1,

    data: 
        new SlashCommandBuilder()
            .setName('userinfo')
            .setDescription('Envoie les infos d\'un compte discord')
            .addUserOption(opt => opt.setName('pseudo').setDescription('Le membre cible'))
            .addNumberOption(opt => opt.setName('id').setDescription('L\'id de l\'utilisateur')),

    run: async function(args) {

        let user = args.intera.options.getUser('pseudo') || args.intera.user;
        let embed = new Discord.MessageEmbed();

        //Récup infos user
        let pseudo = user.username;
        let profileType = "Compte";
        if(user.bot) {profileType = "Bot"}
        let crea = user.createdAt;
        let creaTitle = "__" + profileType + " créé le__:";
        let creaString = utils.zero(crea.getDate()) + "/" + utils.zero(crea.getMonth() + 1) + "/" + crea.getFullYear() + " à " + utils.zero(crea.getHours()) + ":" + utils.zero(crea.getMinutes());        
        let pdp = user.displayAvatarURL();

        //Création embed
        embed
            .setThumbnail(pdp)
            .setColor([13, 84, 236])
            .setFooter({text: "ID: " + user.id})
            .addField(creaTitle, creaString)

        //Récup infos membre
        let membre = await args.intera.guild.members.fetch(user.id);
        if(membre) {
            
            if(membre.nickname) pseudo += " (" + membre.nickname + ")"
            let joinDate = membre.joinedAt;
            let joinString = "Le " + utils.zero(joinDate.getDate()) + "/" + utils.zero(joinDate.getMonth() + 1) + "/" + joinDate.getFullYear() + " à " + utils.zero(joinDate.getHours()) + ":" + utils.zero(joinDate.getMinutes())
            let rolesList = membre.roles.cache.map(r=> r.name).slice(0, -1).join(', ');
            embed
                .addField("__Date d\'arrivée sur le serveur:__", joinString)
                .addField("__Rôles:__", rolesList)
        }
        
        embed
            .setAuthor({name: pseudo})

        args.intera.reply({embeds: [embed]})
        .catch(err => utils.errorSendReply('userinfo', args))
        
    }
}