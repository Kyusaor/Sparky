const { GatewayIntentBits, Partials } = require('discord.js');

module.exports = {
    
    kyu: "370293090407153665",

    version: "2.0",

    logs_connexions: "656141877770321960",
    logs_users: "656141824590872576",
    logs_serveurs: "656141779116097536",
    logs_mp:"750464720204726333",
    gp_dashboard:"647042988358238208",
    logs_db:"784919405896400916",
    logs_inf: "1013478125004398683",

    botperm:"2416217169",

    clientParam: {
        intents :[
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.Guilds,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.DirectMessageReactions,
        ],
        partials: [
            Partials.Channel,
            Partials.Message
        ]
    },
}