const config = require('../data/config.js');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = {

    compos: {
        morfalange: ["./images/mob/morfalange.png"],
        titan: ["./images/mob/titan.png"],
        abeille: ["./images/mob/abeille.png"],
        agivre: ["./images/mob/ailes de givre.png"],
        anoires: ["./images/mob/ailes noires.png"],
        bete: ["./images/mob/bete.png"],
        chaman: ["./images/mob/chaman.png"],
        drider: ["./images/mob/drider.png"],
        epinator: ["./images/mob/epinator.png"],
        faucheuse: ["./images/mob/faucheuse.png"],
        gargantua: ["./images/mob/gargantua.png"],
        golem: ["./images/mob/golem.png"],
        griffon: ["./images/mob/griffon.png"],
        mecha: ["./images/mob/mecha.png"],
        larve: ["./images/mob/larve.png"],
        noceros: ["./images/mob/noceros.png"],
        sabrecroc: ["./images/mob/sabrecroc.png"],
        serrulule:["./images/mob/serrulule.png"],
        wyrm: ["./images/mob/wyrm.png"],
        noms: {
            morfalange: "le Morfalange",
            titan: "le Titan des Marées",
            abeille: "la Reine Abeille",
            agivre: "l'Ailes de Givre",
            anoires: "les Ailes Noires",
            bete: "la Bête des Neiges",
            chaman: "le Chaman Vaudou",
            drider: "le Drider de l'Enfer",
            epinator: "l'Epinator",
            faucheuse: "la Faucheuse",
            gargantua: "le Gargantua",
            golem: "le Golem Antique",
            griffon: "le Griffon",
            mecha: "le Mecha Troyen",
            larve: "la Méga-Larve",
            noceros: "le Nocéros",
            sabrecroc: "Sabrecroc",
            serrulule: "le Serrulule",
            wyrm: "Wyrm de Jade"
        }
    },

    daySince(date){
        let mtn = Date.now();
        let ecart = Math.floor((mtn - date) / 86400000);
        return ecart
    },

    mob: {
        abeille: ['abeille', 'reine', 'reine abeille', 'bee', 'queen', 'queen bee'],
        agivre: ['ailes de givre', 'agivre', 'givre', 'frostwing', 'frost'],
        anoires: ['ailes noires', 'noires', 'anoires', 'anoire'],
        bete: ['bete', 'bete des neiges', 'bête', 'bête des neiges', 'snow beast', 'snow', 'beast'],
        chaman: ['chaman', 'vaudou', 'chaman vaudou', 'voodoo', 'voodoo chaman'],
        cottrage: ['cottrage', 'cott', 'cott-rage', 'cabane', 'cottageroar'],
        drider: ['drider', 'drider de l\'enfer', 'drider infernal', 'hell drider', 'hell'],
        epinator: ['epinator', 'épinator', 'terror', 'terrorthorn'],
        faucheuse: ['faucheuse', 'grim', 'reaper', 'grim reaper'],
        gargantua: ['gargantua', 'garg'],
        golem: ['golem', 'golem antique', 'hardrox'],
        gorzilla: ['gorzilla', 'gorilla', 'gorille', 'gawrilla'],
        griffon: ['gryffon', 'griffon', 'grifon', 'gryfon'],
        larve: ['larve', 'méga-larve', 'mega larve', 'mega', 'méga', 'mega-larve', 'megga maggot', 'maggot'],
        mecha: ['mécha', 'mecha', 'mécha troyen', 'mécha-troyen', 'troyen', 'mecha troyen', 'mecha-troyen', 'mecha trojan', 'trojan'],
        morfalange: ['morfalange', 'morfa', 'bon', 'bon appeti', 'morphalange'],
        noceros: ['nocéros', 'noceros'],
        sabrecroc: ['sabrecroc', 'saber', 'sabre', 'saberfang'],
        serrulule: ['serru', 'seru', 'serulule', 'serrulule', 'hibou', 'chouette', 'hootclaw'],
        titan: ['titan', 'titan des marées', 'titan des marees', 'tidal', 'tidal titan'],
        wyrm: ['wyrm', 'wyrm de jade', 'jade'],
    },
    
    embedFooter(kyu, embed) {
        embed.setFooter("Développé avec amour par " + kyu.tag, kyu.displayAvatarURL());;
    },

    async fetchEveryone(bot){
        let listguild = bot.guilds.cache.map(g => g.id);
        console.log(listguild[0])
        for(i = 0; i < bot.guilds.cache.size ; i++){
            let guild = await bot.guilds.cache.get(listguild[i]);
            console.log(guild.name + " (" + guild.memberCount + ")")
            await guild.members.fetch();
        }
       

    },

    statusLoop(bot){
        let server_count = bot.guilds.cache.size;
        bot.user.setActivity(server_count + " serveurs", { type: 'WATCHING' });
        setTimeout(()=>{bot.user.setActivity("mentionnez-moi pour avoir de l'aide")}, 20000)
        setTimeout(()=>{this.statusLoop(bot)}, 40000)
    },

    displayConsoleHour(date) {
        if(!date) date = new Date();
        let message = "[" + this.zero(date.getDate()) + "/" + this.zero(date.getMonth() + 1) + "] [" + this.zero(date.getHours() + 1) + ":" + this.zero(date.getMinutes()) + ":" + this.zero(date.getSeconds()) + "] "
        return message
    },

    async envoi_log(chan_log, bot, info1, info2) {
        let message_console = "";
        let date = new Date();

        switch (chan_log) {
            //Logs des commandes effectuées sur le bot
            /*
            info1 = msg
            info2 = commande effectuée
            */
            case config.logs_users:
                bot.channels.cache.get(chan_log).send("`NOUVELLE COMMANDE:`\nUtilisateur: `" + info1.author.tag + "`\nID: `" + info1.author.id + "`\nCommande: `" + info2 + "`\n\nServeur: `" + info1.guild.name + "`\nID: `" + info1.guild.id + "`");
                message_console = this.displayConsoleHour(date) + info1.author.tag + " (ID: " + info1.author.id + ") vient de faire la commande: " + info2;
                break;

            //logs des arrivées/départs du bot sur des serveurs
            case config.logs_serveurs:
                /*
                info1 = guild
                info2 = est défini si le bot rejoins un serveur
                */
                if (info2) { info2 = "📥 " } else { info2 = "📤 " }
                bot.channels.cache.get(chan_log).send(info2 + info1.name + " (" + info1.id + ")\nMembres: " + info1.memberCount)
                if (info2 === "📥 ") { info2 = "(+) " } else { info2 = "(-) " }
                message_console = this.displayConsoleHour(date) + info2 + info1.name + " (ID:" + info1.id + ")";
                if(info2 === "(+) "){
                    let owner = await bot.users.fetch(info1.ownerID).catch(e => console.log('Fetch owner impossible'))
                    if(owner) {
                        message_console += "\nOwner: " + owner.tag + " (" + owner.id + ")";
                        bot.channels.cache.get(chan_log).send("\nOwner: " + owner.tag + " (" + owner.id + ")")
                    };
                }
                break;

            //logs des connexions du bot
            /*
            info1 = version du bot
            */
            case config.logs_connexions:
                bot.channels.cache.get(chan_log).send(info1);
                message_console = "\n\n             SPARKY\n\nBot discord Lords Mobile français\nDéveloppé par Kyusaki\n\nVersion:       " + info1 + "\nDate: " + this.displayConsoleHour(date) + "\n\nConsole:"; break;

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
        role ? role.delete() : console.log(id + ": role introuvable (serveur " + serv.name + ", " + serv.id)
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

    errorSendReply(command, args) {console.log(this.displayConsoleHour() + "Impossible d'envoyer la commande [" + command + "] dans le salon " + args.intera.channel.id + " (Serveur " + args.intera.guild.name + ")")},
}