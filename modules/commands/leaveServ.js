module.exports = {

    name: "leaveserv",

    structure: "leaveserv <ID>",

    description: "Fait partir le bot du serveur donné",

    level: 3,

    run: function (args) {

        let msg = args.msg;
        let bot = args.bot;
        let gconfig = args.gconfig;

        if(msg.content.trim().split(' ').length != 2) return msg.channel.send("Format de commande invalide");
        let guildID = msg.content.trim().split(' ')[1];
        let guild = bot.guilds.cache.get(guildID);
        if(!guild) return msg.channel.send("ID invalide");
        if(!gconfig[guildID]) {msg.channel.send("Ce serveur n'est pas enregistré")}
        else {gconfig[guildID].active = false}
        guild.leave()
        .then(msg.channel.send("J'ai quitté le serveur " + gconfig[guildID].name))
        .catch(console.error)
    }
}