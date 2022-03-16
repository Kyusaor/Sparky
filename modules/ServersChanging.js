const Discord = require('discord.js');
const fs = require('fs');
const config = require('../data/config.js');

module.exports = {
    join: async function (guild, bot, kyu, gpconfig, gconfig){

        //Actualise l'activité du bot
        let server_count = bot.guilds.cache.size
        bot.user.setActivity(server_count + " serveurs", { type : 'WATCHING'});

        //Enregistre le serveur ou le redéfinit comme actif
        if(!gconfig[guild.id]){
            gconfig[guild.id] = {
            name : guild.name,
            prefix : "!",
            active : true,
            }
            gpconfig[guild.id] = {ping: false}
        }
        else {gconfig[guild.id].active = true}

        //Envoi d'un message privé au propriétaire du serveur
        let owner = await bot.users.fetch(guild.ownerID)
        let embed = new Discord.MessageEmbed()
        .setTitle("Bonjour " + owner.username + "!")
        .setDescription("Je me présente: je suis un bot discord Lords Mobile, conçu pour les serveurs de guilde.\n\nPar défaut mon préfixe est `!`, vous pourrez le modifier ultérieurement. La liste de mes commandes se trouve en faisant `!aide` sur votre serveur\n\nMerci de m'avoir ajouté!")
        .setColor([59,229,53])
        .setFooter("Développé par Kyusaki#9053", kyu.displayAvatarURL())
        owner.send(embed)
        .catch(e => console.log("owner incontactable"))

        //Applique les changements au fichier de config des serveurs
        fs.writeFileSync('./data/guild_config.json', JSON.stringify(gconfig), "UTF-8")

        let logdb = await bot.channels.cache.get(config.logs_db);
        if(!logdb) return console.log(utils.displayConsoleHour + " Chan log db introuvable")

        logdb.send("Nouveau serveur " + guild.name + "\nid: " + guild.id + "\nOwner: " + owner.username + " (id: " + owner.id + ")",{files:[
            {
                attachment:'./data/globalPing.json',
                name:'globalPing.json',
            },
            {
                attachment:'./data/guild_config.json',
                name:'guild_config.json'
            }
        ]})
        .catch(error => console.log(utils.displayConsoleHour(new Date()) + "Impossible d'envoyer les logs db"))


        //Applique les changements au fichier de config des serveurs
        fs.writeFileSync('./data/guild_config.json', JSON.stringify(gconfig), "UTF-8")
    },

    leave: async function(guild, bot, gconfig){

        //Actualise l'activité du bot
        let server_count = bot.guilds.cache.size
        bot.user.setActivity(server_count + " serveurs", { type : 'WATCHING'})

        //Enregistre le serveur comme quitté
        gconfig[guild.id].active = false;

        //Applique les changements au fichier de config des serveurs
        fs.writeFileSync('./data/guild_config.json', JSON.stringify(gconfig), "UTF-8")

        //envoi logs db
        let logdb = await bot.channels.cache.get(config.logs_db);
        if(!logdb) return console.log(utils.displayConsoleHour + " Chan log db introuvable")

        let owner = await bot.users.fetch(guild.ownerID)
        if(!owner) return console.log("Owner introuvable")

        logdb.send("Retrait serveur " + guild.name + "\nid: " + guild.id + "\nOwner: " + owner.username + " (id: " + owner.id + ")",{files:[
            {
                attachment:'./data/globalPing.json',
                name:'globalPing.json',
            },
            {
                attachment:'./data/guild_config.json',
                name:'guild_config.json'
            }
        ]})
        .catch(error => console.log(utils.displayConsoleHour(new Date()) + "Impossible d'envoyer les logs db"))

    }
}