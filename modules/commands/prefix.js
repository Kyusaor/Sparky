const fs = require('fs');

module.exports = {
    name : "préfixe",

    structure : "préfixe <nouveau préfixe>",

    description : "Définit un nouveau préfixe pour le bot",

    level: 2,

    run : function (args) {

        //Récupération des variables
        let msg = args.msg;
        var gconfig = args.gconfig;

        //Exécution de la commande
        if(msg.content.trim().split(' ').length != 2) return msg.channel.send("Spécifiez un préfixe en un seul caractère (autre que espace)");
        if(msg.content.trim().split(' ')[1].length != 1) return msg.channel.send("Spécifiez un préfixe en un seul caractère (autre que espace)");
        if(msg.content.trim().split(' ')[1] == gconfig[msg.guild.id].prefix) return msg.channel.send("C'est déjà le préfixe...")
        gconfig[msg.guild.id].prefix = msg.content.trim().split(' ')[1]
        msg.channel.send("Préfixe actuel: `" + gconfig[msg.guild.id].prefix + "`")
        .then(fs.writeFileSync('./data/guild_config.json', JSON.stringify(gconfig)))

        
    }
}