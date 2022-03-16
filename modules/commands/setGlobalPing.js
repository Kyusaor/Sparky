const Discord = require('discord.js');
const fs = require('fs');

module.exports = {

    name: "setglobalping",

    description: "Redéfinit le message de ping global",

    level: 3,

    run: async function (args){

        let msg = args.msg;
        let gpdata = args.gpconfig;

        msg.delete();

        let embed = new Discord.MessageEmbed()
        .setTitle("Mentions globales")
        .setDescription("Panneau d'envoi des mentions veilleur dragon globales. Pas d'erreurs pour ces mentions, merci de ne pas ping un event déjà mentionné")
        .setColor([253,90,24])
        .addField("** **", "** **")
        .addField("Ping Veilleur 🇻", "Notifie les évènements infernaux veilleur")
        .addField("Ping dragon 🇩", "Notifie les évènements infernaux dragon")
        .addField("Evènement infernal: orbes rouges <:redorb:740688906755768470>", "Notifie un infernal orbes de talent lumineux")
        .addField("Evènement infernal: orbes jaunes <:yellorb:740689133600768091>", "Notifie un infernal orbes de talent brillant")

        let emb = await msg.channel.send(embed);
        await emb.react('🇻');
        await emb.react('🇩');
        await emb.react('740688906755768470');
        await emb.react('740689133600768091');


        gpdata.settings.msg_annonce = emb.id;
        fs.writeFileSync('./data/globalPing.json', JSON.stringify(gpdata));
    }
}