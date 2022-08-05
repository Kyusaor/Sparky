const Discord = require('discord.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const utils = require('../utils.js');

module.exports = {

    name: "infos",
    description: "Donne des infos sur un utilisateur, le serveur ou le bot",

    data:
        new SlashCommandBuilder()
            .setName("info")
            .setDescription("Donne des infos sur un utilisateur, le serveur ou le bot")
            .setDMPermission(false)
            .addSubcommand(sc => 
                sc.setName("utilisateur")
                .setDescription("Affiche les infos d'un compte discord")
                .addMentionableOption(opt => opt.setName('pseudo').setDescription('Le membre cible'))
            )
            .addSubcommand(sc => 
                sc.setName("serveur")
                .setDescription("Affiche les infos du serveur")
            )
            .addSubcommand(sc => 
                sc.setName("bot")
                .setDescription("Affiche les infos du bot")
            ),

    run: async function(args) {

        let sub = args.intera.options.getSubcommand()

        //Infos user
        if(sub == "utilisateur") {

            let parsedOption = args.intera.options.getMentionable('pseudo') || args.intera.user.id;
            let user = await args.bot.users.fetch(parsedOption);
            if(!user) return args.intera.reply("Cet utilisateur est introuvable")
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

        //Infos serveur
        else if (sub == "serveur") {
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
                    {name: "__Serveur créé le__", value: utils.zero(creation.getDate()) + "/" + utils.zero(creation.getMonth() + 1) + "/" + creation.getFullYear() + " à " + utils.zero(creation.getHours()) + ":" + utils.zero(creation.getMinutes()) + " (il y a " + utils.daySince(creation) + " jours)"},
                    {name: "__Nombre de membres__", value: membercount.toString()}
                ])
                .setFooter({text: "ID: " + args.intera.guildId, iconURL: args.kyu.displayAvatarURL()});
    
            args.intera.reply({embeds: [embed]})
            .catch(err => utils.errorSendReply('serveur-infos', args))
    
        }

        //Infos bot
        else if (sub == "bot") {

        }

        else return console.log("Pas de subcommande valide")
    }
            
}