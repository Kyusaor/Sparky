const Discord = require('discord.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../data/config.js');
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
            let crea = utils.stringifyDate(user.createdAt);
            let creaTitle = "__" + profileType + " créé le__:";
            let pdp = user.displayAvatarURL();
    
            //Création embed
            embed
                .setThumbnail(pdp)
                .setColor([13, 84, 236])
                .setFooter({text: "ID: " + user.id})
                .addFields([{name: creaTitle, value: crea}])
    
            //Récup infos membre
            let membre = await args.intera.guild.members.fetch(user.id);
            if(membre) {
                
                if(membre.nickname) pseudo += " (" + membre.nickname + ")"
                let joinDate = utils.stringifyDate(membre.joinedAt);
                let rolesList = membre.roles.cache.map(r=> r.name).slice(0, -1).join(', ');
                embed
                    .addFields([
                        {name: "__Date d\'arrivée sur le serveur:__", value: joinDate},
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
            let creation = utils.stringifyDate(args.intera.guild.createdAt);
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
                    {name: "__Serveur créé le__", value: creation},
                    {name: "__Nombre de membres__", value: membercount.toString()}
                ])
                .setFooter({text: "ID: " + args.intera.guildId, iconURL: args.kyu.displayAvatarURL()});
    
            args.intera.reply({embeds: [embed]})
            .catch(err => utils.errorSendReply('serveur-infos', args))
    
        }

        //Infos bot
        else if (sub == "bot") {

            let Color = [59,229,53];
            let Title = args.bot.user.tag;
            let Thumb = args.bot.user.displayAvatarURL();
            let ID = args.bot.user.id;
            let creaDate = utils.stringifyDate(args.bot.user.createdAt);
            let joinDate = utils.stringifyDate(args.intera.guild.joinedAt);
            let ServerCount = args.bot.guilds.cache.size;
            let Version = config.version;
            let Ping = Math.round(args.bot.ws.ping);
            let inviteLink = "<https://discord.com/api/oauth2/authorize?client_id=" + args.bot.user.id + "&permissions=" + config.botperm + "&scope=bot%20applications.commands" + ">"
            
            let embed = new EmbedBuilder()
                .setColor(Color)
                .setTitle(Title)
                .setThumbnail(Thumb)
                .addFields([
                    {name: "__ID:__", value: ID},
                    {name: "__Date de création:__", value: creaDate},
                    {name: "__Date d'ajout sur le serveur:__", value: joinDate},
                    {name: "__Nombre de serveurs:__", value: ServerCount.toString()},
                    {name: "__Version du bot:__", value: Version},
                    {name: "__Ping:__", value: Ping + " ms"},
                    {name: "__Lien d'ajout:__", value: inviteLink}
                ])
                .setFooter({text: "Développé par Kyusaki#9053", iconURL: args.kyu.displayAvatarURL()})
           
            args.intera.reply({embeds: [embed]})
                .catch(err => utils.errorSendReply('info bot', args))        
        }

        else return console.log("Pas de subcommande valide")
    }
            
}