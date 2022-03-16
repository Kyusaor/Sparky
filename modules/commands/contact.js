const utils = require('./utils.js');

module.exports = {

    name: "contact",

    description: "Nous contacter (discord ou e-mail)",

    level: 1,

    run: function(args){

        //Récupération des variables nécessaires
        let msg = args.msg;

        //Envoi du message
        msg.channel.send("Besoin d'aide sur le bot, de signaler un bug ou simplement discuter avec des joueurs de Lords Mobile? Voilà le lien du serveur :wink: \n " + utils.link + "\n\nPour contacter le développeur, vous pouvez également envoyer un mail à __**sparky.botfr@gmail.com**__")
    }
}