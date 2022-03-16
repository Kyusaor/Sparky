const Discord = require('discord.js');

module.exports = {

    name:"credits",

    description:"Remerciements à ceux qui ont contribué au développement du bot",

    level: 1,

    run:function(args){

        //Récupération des arguments
        let msg = args.msg;
        let kyu = args.kyu;

        //Création du message de remerciement
        let embed = new Discord.MessageEmbed()
        .setTitle("Remerciements")
        .setDescription("La liste des personnes qui ont aidé de près ou de loin au développement du bot")
        .setColor([246,19,19])
        .setFooter("Développé par " + kyu.tag, kyu.displayAvatarURL())
        .addField("Les testeurs", "Pour m'avoir aidé à la conception du bot et l'amélioration des rendus")
        .addField("Les bêta testeurs", "Qui ont accepté de servir de cobayes pour un bot presque fini")
        .addField("Heph, développeur de HephBot", "Pour avoir aimablement accepté l'utilisation de ses compos monstres")
        .addField("Et enfin...", "Tous les utilisateurs du bot pour avoir accordé leur confiance à ce projet :heart:")
        msg.channel.send(embed)
    }
}