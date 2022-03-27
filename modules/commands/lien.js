const config = require('../../data/config.js');
const utils = require('../utils.js');

module.exports = {

    name: 'lien',

    description:'Envoie le lien pour m\'ajouter sur votre serveur',

    level: 1,

    run(args){

        //Récupération des variables
        let msg = args.msg;
        let bot = args.bot;

        msg.channel.send("Voici le lien pour m'ajouter sur votre serveur:\n<https://discord.com/oauth2/authorize?client_id=" + bot.user.id + "&scope=bot&permissions=" + config.botperm + ">")
        .catch(error => console.log(utils.displayConsoleHour() + "Impossible d'envoyer le lien dans le salon " + msg.channel.id + " (Serveur " + msg.guild.name + ")"))
    }
}