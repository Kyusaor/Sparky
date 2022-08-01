const Discord = require('discord.js');
const utils = require('../utils');

module.exports = {

    name: "info",

    description: "Envoie les infos d\'un compte discord",

    level: 1,

    data: 
        new Discord.SlashCommandBuilder()
            .setName('userinfo')
            .setDescription('Envoie les infos d\'un compte discord')
            .addMentionableOption(opt => opt.setName('pseudo').setDescription('Le membre cible'))
            .setDMPermission(false),

    run: async function(args) {

        let parsedOption = args.intera.options.getMentionable('pseudo');
        let user = await args.bot.users.fetch(parsedOption) || args.intera.user;
        let embed = new Discord.EmbedBuilder();

        //Récup infos user
        let pseudo = user.username;
        let profileType = "Compte";
        if(user.bot) {profileType = "Bot"}
        let crea = user.createdAt;
        let creaTitle = "__" + profileType + " créé le__:";
        let creaString = utils.zero(crea.getDate()) + "/" + utils.zero(crea.getMonth() + 1) + "/" + crea.getFullYear() + " à " + utils.zero(crea.getHours()) + ":" + utils.zero(crea.getMinutes()) + " (il y a " + utils.daySince(crea) + " jours)";
        let pdp = user.displayAvatarURL();

        //Création embed
        embed
            .setThumbnail(pdp)
            .setColor([13, 84, 236])
            .setFooter({text: "ID: " + user.id})
            .addFields([{name: creaTitle, value: creaString}])

        //Récup infos membre
        let membre = await args.intera.guild.members.fetch(user.id);
        if(membre) {
            
            if(membre.nickname) pseudo += " (" + membre.nickname + ")"
            let joinDate = membre.joinedAt;
            let joinString = "Le " + utils.zero(joinDate.getDate()) + "/" + utils.zero(joinDate.getMonth() + 1) + "/" + joinDate.getFullYear() + " à " + utils.zero(joinDate.getHours()) + ":" + utils.zero(joinDate.getMinutes()) + " (il y a " + utils.daySince(joinDate) + " jours)"
            let rolesList = membre.roles.cache.map(r=> r.name).slice(0, -1).join(', ');
            embed
                .addFields([
                    {name: "__Date d\'arrivée sur le serveur:__", value: joinString},
                    {name: "__Rôles:__", value: rolesList}
                ])
        }
        
        embed
            .setAuthor({name: pseudo})

        args.intera.reply({embeds: [embed]})
        .catch(err => utils.errorSendReply('userinfo', args))
        
    }
}