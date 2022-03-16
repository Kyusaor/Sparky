module.exports = {

    name: "reboot",

    description:"Relance le bot",

    level: 3,

    run: function (args){

        //Récupération des variables
        let msg = args.msg;
        let bot = args.bot;
        let config = args.config;

        //Exécution de la commande

        msg.channel.send("Reboot en cours...");
        bot.destroy();
        bot.login(config.token)
        .then(msg.channel.send("Bot relancé!"))
    }
}