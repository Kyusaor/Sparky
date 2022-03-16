const config = require('../data/config.js');
const Discord = require('discord.js');
const utils = require('./utils.js');

module.exports = {

    name: 'infobot',

    description:'Envoie les infos sur le bot',

    level: 1,

    async run(args){

        //Récupération des variables
        let msg = args.msg;
        let bot = args.bot;
        let kyu = args.kyu;

        //Récupération des infos
        let ServerCount = bot.guilds.cache.size;
        let Ping = Math.round(bot.ws.ping);
        let Version = config.version;
        let Color = [59,229,53];
        let Thumb = bot.user.displayAvatarURL();
        let Title = bot.user.tag;
        let ID = bot.user.id;
        let Prefix = args.gconfig[args.msg.guild.id].prefix;
        

        //Création de l'embed
        let embed = new Discord.MessageEmbed()
        .setColor(Color)
        .setTitle(Title)
        .setThumbnail(Thumb)
        .addField("__ID:__", ID)
        .addField("__Nombre de serveurs:__", ServerCount)
        .addField("__Version du bot:__", Version)
        .addField("__Ping:__", Ping + " ms")
        .addField("__Préfixe:__", Prefix)
        .setFooter("Développé par Kyusaki#9053", kyu.displayAvatarURL())


        msg.channel.send(embed)
        .catch(error => console.log(utils.displayConsoleHour() + "Impossible d'envoyer le préfixe. #" + msg.channel.name + ", " + msg.guild.name + " (" + msg.guild.id + ")"))
    }
}