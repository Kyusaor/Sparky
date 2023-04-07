const config = require('../data/config.js');
const fs = require('fs');
const { ActivityType } = require('discord.js');

module.exports = {

    daySince(date){
        let mtn = Date.now();
        let ecart = Math.floor((mtn - date) / 86400000);
        return ecart
    },

    formatNumberPerHundreds(num) {
        let str = num.toString();
        let i = Math.floor(str.length / 3);
        let j = str.length % 3;
        let out = str.slice(0, j);
        str = str.slice(j)

        for(let k = 0; k <= i; k++) {
            out += " " + str.slice(0, 3)
            str = str.slice(3)
        }
        
        return out
    },

    batiments: {
        autel: {
            ressources: {
                ble: [594, 891, 1336, 2004, 3007, 4510, 6766, 10149, 15223, 22835, 34253, 51379, 77069, 115603, 173405, 260108, 390163, 585245, 877867, 1316801, 1975202, 2962803, 4444205, 6666308, 13332616],
                pierre: [810, 1215, 1822, 2733, 4100, 6150, 9226, 13839, 20759, 31139, 46709, 70063, 105094, 157641, 236462, 354694, 532041, 798061, 1197092, 1795638, 2693457, 4040186, 6060280, 9090420, 18180841],
                bois: [810, 1215, 1822, 2733, 4100, 6150, 9226, 13839, 20759, 31139, 46709, 70063, 105094, 157641, 236462, 354694, 532041, 798061, 1197092, 1795638, 2693457, 4040186, 6060280, 9090420, 18180841],
                minerai: [486, 729, 1093, 1640, 2460, 3690, 5535, 8303, 12455, 18683, 28025, 42037, 63056, 94585, 141877, 212816, 319224, 478836, 718255, 1077383, 1616074, 2424112, 3636168, 5454252, 10908504],
                items: [1, 2, 5, 12, 20, 30, 45, 60, 85, 100, 120, 150, 180, 250, 340, 500, 700, 900, 1200, 1500, 1800, 2100, 2400, 3000, 4500],
            },
            name: {batiment: "autel", item: "Cristaux d'âme"},
            images: ['https://media.discordapp.net/attachments/659758501865717790/1050450719599251518/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1050450748326019082/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1050450770614554714/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1050450802520637581/latest.png'],
            itemCost: {1: 15, 10: 120, 100: 1100, 1000: 10000}
        },
        salle: {
            ressources: {
                ble: [0, 375000, 562500, 843750, 1262625, 1898437, 2847656, 4271484, 6407226],
                pierre: [0, 375000, 562500, 843750, 1262625, 1898437, 2847656, 4271484, 6407226],
                bois: [0, 375000, 562500, 843750, 1262625, 1898437, 2847656, 4271484, 6407226],
                minerai: [0, 375000, 562500, 843750, 1262625, 1898437, 2847656, 4271484, 6407226],
                items: [0, 5, 25, 55, 75, 145, 295, 900, 3500],    
            },
            name: {batiment: "salle au trésor", item: "Pioches de cristal"},
            images: ['https://media.discordapp.net/attachments/659758501865717790/1053310152192839710/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053310152725499914/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053310153144946768/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053310153606303804/latest.png'],
            itemCost: {1: 20, 10: 160, 100: 1500, 1000: 14000}
        },
        prison: {
            ressources: {
                ble: [375, 562, 843, 1265, 1898, 2847, 4271, 6407, 9610, 14416, 21624, 32436, 48654, 72982, 109473, 164210, 246315, 369472, 554209, 831314, 1246971, 1870456, 2805685, 4208528, 8417056],
                pierre: [375, 562, 843, 1265, 1898, 2847, 4271, 6407, 9610, 14416, 21624, 32436, 48654, 72982, 109473, 164210, 246315, 369472, 554209, 831314, 1246971, 1870456, 2805685, 4208528, 8417056],
                bois: [375, 562, 843, 1265, 1898, 2847, 4271, 6407, 9610, 14416, 21624, 32436, 48654, 72982, 109473, 164210, 246315, 369472, 554209, 831314, 1246971, 1870456, 2805685, 4208528, 8417056],
                minerai: [375, 562, 843, 1265, 1898, 2847, 4271, 6407, 9610, 14416, 21624, 32436, 48654, 72982, 109473, 164210, 246315, 369472, 554209, 831314, 1246971, 1870456, 2805685, 4208528, 8417056],
                items: [1, 2, 5, 12, 20, 30, 45, 60, 85, 100, 120, 150, 180, 250, 340, 500, 700, 900, 1200, 1500, 1800, 2100, 2400, 3000, 4500],    
            },
            name: {batiment: "prison", item: "Menottes en acier"},
            images: ['https://media.discordapp.net/attachments/659758501865717790/1053311615107350629/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053311615719723018/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053311616160120963/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053311616525017169/latest.png'],
            itemCost: {1: 15, 10: 120, 100: 1100, 1000: 10000}
        },
        hall: {
            ressources: {
                ble: [140, 210, 315, 472, 708, 1063, 1594, 2392, 3588, 5382, 8073, 12109, 18164, 27246, 40870, 61305, 91957, 137936, 206904, 310357, 465535, 698303, 1047455, 1571183, 3142367],
                pierre: [140, 210, 315, 472, 708, 1063, 1594, 2392, 3588, 5382, 8073, 12109, 18164, 27246, 40870, 61305, 91957, 137936, 206904, 310357, 465535, 698303, 1047455, 1571183, 3142367],
                bois: [140, 210, 315, 472, 708, 1063, 1594, 2392, 3588, 5382, 8073, 12109, 18164, 27246, 40870, 61305, 91957, 137936, 206904, 310357, 465535, 698303, 1047455, 1571183, 3142367],
                minerai: [140, 210, 315, 472, 708, 1063, 1594, 2392, 3588, 5382, 8073, 12109, 18164, 27246, 40870, 61305, 91957, 137936, 206904, 310357, 465535, 698303, 1047455, 1571183, 3142367],
                items: [1, 2, 5, 12, 20, 30, 45, 60, 85, 100, 120, 150, 180, 250, 340, 500, 700, 900, 1200, 1500, 1800, 2100, 2400, 3000, 4500],
            },
            name: {batiment: "hall de bataille", item: "Grimoires de guerre"},
            images: ['https://media.discordapp.net/attachments/659758501865717790/1053314872869392445/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053314873234292827/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053314873628561408/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053314873980895242/latest.png'],
            itemCost: {1: 15, 10: 120, 100: 1100, 1000: 10000}
        },
    },

    stringifyDuration(duree) {
        let days = Math.floor(duree / 1440);
        let hours = Math.floor((duree - days * 1440) / 60);
        let minutes = duree % 60;

        let string = Math.floor(minutes) + " minutes";
        if(hours > 0) string = hours + " heures et " + string;
        if(days > 0) string = days + " jours, " + string;
        
        return string
    },

    troupes: {
        1: {
            time: 15,
            might: 2,
            gold: 0,
            rss: 50
        },
        2: {
            time: 30,
            might: 8,
            gold: 5,
            rss: 100
        },
        3: {
            time: 60,
            might: 24,
            gold: 10,
            rss: 150
        },
        4: {
            time: 120,
            might: 2,
            gold: 500,
            rss: 1000
        },
        inf: ["ble", "bois", "minerai"],
        snipe: ["ble", "pierre", "bois"],
        cav: ["ble", "pierre", "minerai"],
        engin: ["ble", "pierre", "bois", "minerai"],
        subv: {
            1: [0, 0.5, 1, 1.5, 2.5, 3.5, 4.5, 7, 10, 16, 40],
            2: [0, 0.5, 1, 1.5, 2.5, 3.5, 4.5, 7, 10, 16, 40],
            3: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 7, 11, 30],
            4: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 7, 11, 30]
        },
        type: {inf: "infanterie", snip: "archers", cav: "cavaliers", engin: "engins de siège"}
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
           
    async statusLoop(bot){
        let server_count = bot.guilds.cache.size;
        try { bot.user.setPresence({activities:[{name: server_count + " serveurs", type:ActivityType.Watching}], status:'online'}) }
        catch {}
        setTimeout(()=>{
            try {bot.user.setPresence({activities:[{name: "Écrivez / pour obtenir la liste des commandes"}], status:'online'})}
            catch {}
        }, 10000)
        setTimeout(()=>{this.statusLoop(bot)}, 20000)
    },

    createHellEventMessage(type) {
        let currentHour = new Date();
        let nextEventHour = new Date();
        nextEventHour.setMinutes(55);

        let minutesRemaining = nextEventHour.getMinutes() - currentHour.getMinutes();
        if(minutesRemaining < 1) minutesRemaining += 60

        return ", un évènement " + type + " est en cours !\nIl reste **" + minutesRemaining + "** minutes!"
    },

    displayConsoleHour(date) {
        if(!date) date = new Date();
        let message = "[" + this.zero(date.getDate()) + "/" + this.zero(date.getMonth() + 1) + "] [" + this.zero(date.getHours() + 1) + ":" + this.zero(date.getMinutes()) + ":" + this.zero(date.getSeconds()) + "] "
        return message
    },

    async envoi_log(chan_log, bot, data1, info2) {
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
                let owner = await bot.users.fetch(data1.ownerId).catch(e => console.log('Fetch owner impossible'))
                if(owner) {
                    message_console += "\nOwner: " + owner.tag + " (" + owner.id + ")";
                    bot.channels.cache.get(chan_log).send("\nOwner: " + owner.tag + " (" + owner.id + ")")
                };
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

    async deleteRole(bot, guildId, id, chan){
        let serv = await bot.guilds.cache.get(guildId)
        if(!serv) return console.log(guildId + ": guilde introuvable")
        let role = await serv.roles.cache.get(id)
        role ? role.delete().catch(e => chan.send("Mon rôle est inférieur au rôle <@&" + id + "> (le plus haut des deux roles avec le même nom), vous devrez le supprimer manuellement")) : console.log(id + ": role introuvable (serveur " + serv.name + ", " + serv.id + ")")
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
            if(intera.replied) {
                return await intera.editReply(text)
            } else {
                return await intera.reply(text)
            }
        } catch {
            await intera.deleteReply().catch(e => e);
            return intera = await intera.followUp(text)
        }
    },

    errorSendReply(command, args) {console.log(this.displayConsoleHour() + "Impossible d'envoyer la commande [" + command + "] dans le salon " + args.intera.channel.id + " (Serveur " + args.intera.guild.name + ")")},
}