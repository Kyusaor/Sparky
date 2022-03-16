const Discord = require('discord.js');
module.exports = {

    name: "aide",

    description: "Envoi de la liste des commandes et de leur description",

    level: 1,

    run: function (args) {

        //Récupération des variabes utiles
        let msg = args.msg;
        let prefix = args.gconfig[msg.guild.id].prefix;
        const CommandManager = require('../modules/commandManager.js');
        let liste = new CommandManager(msg.member);
        let kyu = args.kyu;

        function listeCommandes(embed, lvl) {
            for (i = 0; i < Object.keys(liste).length - 1; i++) {
                if(Object.values(liste)[i].command.EE) continue;
                if (Object.values(liste)[i].command.level == lvl) {
                    let titre = "";
                    let desc = "";
                    if (Object.values(liste)[i].command.structure) {
                        titre = "**" + prefix + Object.values(liste)[i].command.structure + "**";
                        desc = Object.values(liste)[i].command.description;
                    } else {
                        titre = "**" + prefix + Object.values(liste)[i].command.name + "**"
                        desc = Object.values(liste)[i].command.description
                    }
                    if (Object.values(liste)[i].alias) { titre += " (ou " + prefix + Object.values(liste)[i].alias + ")" }

                    embed.addField(titre, desc)
                }
            }
        };

        //Création du message
        let thumbn = "";
        if (msg.author.id === kyu.id) { thumbn = 'https://cdn.discordapp.com/attachments/659758501865717790/680168774468763671/PicsArt_02-20-10.39.20.png' }
        else if (msg.member.hasPermission(['ADMINISTRATOR'])) { thumbn = 'https://cdn.discordapp.com/attachments/659758501865717790/680168774468763671/PicsArt_02-20-10.39.20.png' }
        else { thumbn = 'https://media.discordapp.net/attachments/659758501865717790/680102643519193089/help_sparky.png' }

        let embed = new Discord.MessageEmbed()

            //Définition de la mise en forme
            .setTitle("Aide")
            .setDescription("Voilà les commandes auquelles tu as accès " + msg.author.username + "!\n*Dans les description de commandes les < et > sont là par convention, il ne faut pas les écrire :)*")
            .setColor([59, 229, 53])
            .setFooter("Développé par Kyusaki#9053", kyu.displayAvatarURL())
            .setThumbnail(thumbn)

            //Ajout des commandes selon les permissions du membre
            .addField('\u200b', '\u200b', false)
            .addField("__**Commandes générales**__", "** **")
        listeCommandes(embed, 1)

        if (msg.member.hasPermission('ADMINISTRATOR') || (msg.member.user.id == kyu.id)) {
            embed.addField('\u200b', '\u200b', false)
            embed.addField("__**Commandes admin**__", "** **")
            listeCommandes(embed, 2)
        };

        if (msg.author.id == kyu.id) {
            embed.addField('\u200b', '\u200b', false)
            embed.addField("__**Commandes Propriétaire du bot**__", "** **")
            listeCommandes(embed, 3)
        }

        //Envoi du message
        msg.channel.send(embed)
    }
}