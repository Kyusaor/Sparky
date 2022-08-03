const Discord = require('discord.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const utils = require('../utils.js');

module.exports = {

    name:"credits",
    description:"Remerciements à ceux qui ont contribué au développement du bot",

    data:
        new SlashCommandBuilder()
            .setName("credits")
            .setDescription("Remerciements à ceux qui ont contribué au développement du bot")
            .setDMPermission(false),

    run:function(args){


        //Création du message de remerciement
        let embed = new EmbedBuilder()
            .setTitle("Remerciements")
            .setDescription("La liste des personnes qui ont aidé de près ou de loin au développement du bot")
            .setColor([246,19,19])
            .setFooter({text: "Développé par " + args.kyu.tag, iconURL: args.kyu.displayAvatarURL()})
            .addFields([
                {name: "Les testeurs", value: "Pour m'avoir aidé à la conception du bot et l'amélioration des rendus"},
                {name: "Les bêta testeurs", value: "Qui ont accepté de servir de cobayes pour un bot presque fini"},
                {name: "Les donateurs", value: "Pour m'avoir aidé à soutenir le coût du bot"},
                {name: "Et enfin...", value: "Tous les utilisateurs du bot pour avoir accordé leur confiance à ce projet :heart:"},
            ])

        args.intera.reply({embeds: [embed]})
        //.catch(err => utils.errorSendReply('credits', args))
    }
}