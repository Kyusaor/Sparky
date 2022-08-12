const config = require('../data/config.js');
const fs = require('fs');
const { ActivityType } = require('discord.js');

module.exports = {

    daySince(date){
        let mtn = Date.now();
        let ecart = Math.floor((mtn - date) / 86400000);
        return ecart
    },

    stringifyDate(date) {

        let day = this.zero(date.getDate());
        let month = this.zero(date.getMonth() + 1);
        let year = date.getFullYear();

        let hour = this.zero(date.getHours());
        let minute = this.zero(date.getMinutes());
        let daysSince = this.daySince(date);

        return day + "/" + month + "/" + year + " à " + hour + ":" + minute + " (il y a " + daysSince + " jours)"
    },
           
    statusLoop(bot){
        let server_count = bot.guilds.cache.size;
        bot.user.setPresence({activities: [{name: server_count + " serveurs", type: ActivityType.Watching}], status: 'online'})
        setTimeout(()=>{bot.user.setPresence({activities: [{name: "Écrivez / pour obtenir la liste des commandes"}], status: 'online'})}, 10000)
        setTimeout(()=>{this.statusLoop(bot)}, 20000)
    },

    displayConsoleHour(date) {
        if(!date) date = new Date();
        let message = "[" + this.zero(date.getDate()) + "/" + this.zero(date.getMonth() + 1) + "] [" + this.zero(date.getHours() + 1) + ":" + this.zero(date.getMinutes()) + ":" + this.zero(date.getSeconds()) + "] "
        return message
    },

    async envoi_log(chan_log, bot, data1) {
        let message_console = "";
        let date = new Date();

        switch (chan_log) {
            //Logs des commandes effectuées sur le bot
            /*
            data1 = interaction
            */
            case config.logs_users:
                bot.channels.cache.get(chan_log).send("`NOUVELLE COMMANDE:`\nUtilisateur: `" + data1.user.tag + "`\nID: `" + data1.user.id + "`\nCommande: `" + data1.commandName + "`\n\nServeur: `" + data1.guild.name + "`\nID: `" + data1.guild.id + "`");
                message_console = this.displayConsoleHour(date) + data1.user.tag + " (ID: " + data1.user.id + ") vient de faire la commande: " + data1.commandName;
                break;

            //logs des arrivées/départs du bot sur des serveurs
            case config.logs_serveurs:
                /*
                data1 = guild
                info2 = est défini si le bot rejoins un serveur
                */
                if (info2) { info2 = "📥 " } else { info2 = "📤 " }
                bot.channels.cache.get(chan_log).send(info2 + data1.name + " (" + data1.id + ")\nMembres: " + data1.memberCount)
                if (info2 === "📥 ") { info2 = "(+) " } else { info2 = "(-) " }
                message_console = this.displayConsoleHour(date) + info2 + data1.name + " (ID:" + data1.id + ")";
                if(info2 === "(+) "){
                    let owner = await bot.users.fetch(data1.ownerID).catch(e => console.log('Fetch owner impossible'))
                    if(owner) {
                        message_console += "\nOwner: " + owner.tag + " (" + owner.id + ")";
                        bot.channels.cache.get(chan_log).send("\nOwner: " + owner.tag + " (" + owner.id + ")")
                    };
                }
                break;

            //logs des connexions du bot
            /*
            data1 = version du bot
            */
            case config.logs_connexions:
                bot.channels.cache.get(chan_log).send(data1);
                message_console = "\n\n             SPARKY\n\nBot discord Lords Mobile français\nDéveloppé par Kyusaki\n\nVersion:       " + data1 + "\nDate: " + this.displayConsoleHour(date) + "\n\nConsole:"; break;

            default:
                break;
        }

        console.log(message_console);
    },

    link: "https://discord.gg/6Dtrzax",

    VeilleurReac: ['660453261979025418', '660453599318638592', '607194832271573024', '607194934759391242', '607554773851570181', '607196986948452377', '740689133600768091', '740688906755768470'],

    async deleteRole(bot, guildId, id){
        let serv = await bot.guilds.cache.get(guildId)
        if(!serv) return console.log(guildId + ": guilde introuvable")
        let role = await serv.roles.cache.get(id)
        role ? role.delete() : console.log(id + ": role introuvable (serveur " + serv.name + ", " + serv.id + ")")
    },

    async giveRole(bot, userId, guildId, roleId, chanReponse){
        let serv = await bot.guilds.cache.get(guildId);
        if(!serv) return console.log(guildId + ": serveur introuvable")

        let membre = await serv.members.fetch(userId);
        if(!membre) return console.log(userId + ": membre introuvable (serv " + serv.name + ", " + guildId + ")")

        let role = await serv.roles.cache.get(roleId);
        if(!role) return console.log(roleId + ": role introuvable (serv " + serv.name + ", " + guildId + ")")

        let chanrep = await serv.channels.cache.get(chanReponse);

        try {
            if(membre.roles.cache.has(roleId)) {
                if(chanrep) {
                    let mess = await chanrep.send("Tu possèdes déjà ce rôle <@" + userId + ">!");
                    mess.delete({timeout: 10000})
                }
                return console.log(guildId + ": Impossible de give le role " + roleId + " à " + membre.user.tag + ", " + userId + ": déjà le rôle")
            }
            await membre.roles.add(role);
            if(chanrep) {
                let mess = await chanrep.send("Vous avez reçu le rôle " + role.name + " <@" + userId + "> !");
                mess.delete({timeout: 10000})
            }
        }
        catch {
            if(chanReponse){
                if(chanrep) {
                    let mess = await chanrep.send("échec d'attribution <@" + userId + ">").catch(e => e)
                    mess.delete({timeout: 10000})
                }
            }
            return console.log(guildId + ": Impossible de give le role " + roleId + " à " + membre.user.tag + ", " + userId + ": raison inconnue");
        }
    },

    async removeRole(bot, userId, guildId, roleId, chanReponse){
        let serv = await bot.guilds.cache.get(guildId);
        if(!serv) return console.log(guildId + ": serveur introuvable")

        let membre = await serv.members.fetch(userId);
        if(!membre) return console.log(userId + ": membre introuvable (serv " + serv.name + ", " + guildId + ")")

        let role = await serv.roles.cache.get(roleId);
        if(!role) return console.log(roleId + ": role introuvable (serv " + serv.name + ", " + guildId + ")")

        let chanrep = await serv.channels.cache.get(chanReponse);

        try {
            if(!membre.roles.cache.has(roleId)) {
                if(chanrep) {
                    let mess = await chanrep.send("Tu n'as pas ce rôle <@" + userId + ">!");
                    mess.delete({timeout: 10000})
                }
                return console.log(guildId + ": Impossible d'enlever le role " + roleId + " à " + membre.user.tag + ", " + userId + ": pas le rôle")
            }
            await membre.roles.remove(role);
            if(chanrep) {
                let mess = await chanrep.send("Vous n'avez plus le rôle " + role.name + " <@" + userId + "> !");
                mess.delete({timeout: 10000})
            }
        }
        catch {
            if(chanReponse){
                if(chanrep) {
                    let mess = await chanrep.send("échec de suppression <@" + userId + ">").catch(e => e)
                    mess.delete({timeout: 10000})
                }
            }
            return console.log(guildId + ": Impossible d'enlever le role " + roleId + " à " + membre.user.tag + ", " + userId + ": raison inconnue");
        }
    },

    async deleteChan(bot, guildId, id){
        let serv = await bot.guilds.cache.get(guildId)
        if(!serv) return console.log(guildId + ": guilde introuvable")
        let chan = await serv.channels.cache.get(id)
        chan ? chan.delete() : console.log(id + ": salon introuvable (" + serv.name + ", " + serv.id + ")")
    },

    speed: {
        "1 minute": 1,
        "3 minutes": 3,
        "5 minutes": 5,
        "10 minutes": 10,
        "15 minutes": 15,
        "30 minutes": 30,
        "60 minutes": 60,
        "3 heures": 180,
        "8 heures": 480,
        "15 heures": 900,
        "24 heures": 1440,
        "3 jours": 4320,
        "7 jours": 10080,
        "30 jours": 43200,
    },

    zero(x) {
        if (x < 10) {
            x = "0" + x;
        }
        return x
    },

    async interaReply(text, intera) {
        try {
            let rep = await intera.fetchReply();
            if(rep) {
                console.log('rep1')
                return await intera.editReply(text)
            } else {
                console.log('rep2')
                return await intera.reply(text)
            }
        } catch {
            console.log('rep3')
            await intera.deleteReply().catch(e => e);
            return intera = await intera.followUp(text)
        }
    },

    errorSendReply(command, args) {console.log(this.displayConsoleHour() + "Impossible d'envoyer la commande [" + command + "] dans le salon " + args.intera.channel.id + " (Serveur " + args.intera.guild.name + ")")},
}