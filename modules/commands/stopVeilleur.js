const utils = require('../utils');
const config = require('../../data/config.js');

module.exports = {

    name: "stopveilleur",

    description: "Supprime les channels et rôles pour le signalement d'évènements infernaux et challenges",

    level: 2,

    run: async function (args){

        //Récupération des variables
        let msg = args.msg;
        let bot = args.bot;
        let ping_veilleur = args.gpconfig[msg.guild.id];

        //Conditions
        if(!ping_veilleur || !ping_veilleur.ping) return msg.channel.send("Le signalement des évènements n'est pas activé!");

        if(!msg.channel.permissionsFor(bot.user).has('SEND_MESSAGES')) return console.log(utils.displayConsoleHour() + " pas la perm d'écrire dans le salon " + msg.channel.id);
        if(!msg.channel.permissionsFor(bot.user).has('ADD_REACTIONS')) return msg.channel.send("Je n'ai pas la permission d'ajouter des réactions dans ce salon, j'en ai besoin pour vous faire confirmer la suppression");
        let confirmation = await msg.channel.send("Etes-vous sûr(e) de vouloir supprimer les salons et rôles concernés?\n\n:warning:Il sera impossible d'annuler, il faudra tout redéfinir si vous voulez réactiver les notifications");
        confirmation.react('✅');
        confirmation.react('❌');

        let coll;
        try{
            coll = await confirmation.awaitReactions((reaction, user)=> user.id === msg.author.id, {max: 1, time: 20000, errors: ['time']})
        }
        catch {
            let mess = await msg.channel.send("Annulé!");
            return mess.delete({ timeout : 10000})
        }

        let reac = coll.first();
        confirmation.delete();
        if(reac.emoji.name != '✅'){
            let mess = await msg.channel.send("Annulé!");
            return mess.delete({ timeout : 10000})
        }

        //Suppression des rôles et channels
        if(!msg.guild.me.hasPermission(['MANAGE_CHANNELS', 'MANAGE_ROLES'], false, true)) return msg.channel.send("Je n'ai pas toutes les permissions nécessaires: j'ai besoin des permissions `Gérer les roles` et `Gérer les salons` (afin de pouvoir créer le salon et les rôles d'annonce).\nVous pourrez me retirer ces permissions une fois le salon créé");
        await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.CDR);
        await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.CDT);
        await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.ID);
        await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.IDR);
        await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.IV);
        await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.OJ);
        await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.OR);
        await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.IVR);
        await utils.deleteChan(bot, msg.guild.id, ping_veilleur.chan_notifs)

        if(ping_veilleur.chan_board) utils.deleteChan(bot, msg.guild.id, ping_veilleur.chan_board);

        //Application au fichier de guilde
        ping_veilleur.ping = false;

        msg.channel.send("Les notifications d'évènements et challenge est désactivée!\n*Si vous le réactivez, pensez à avertir vos membres, il faudra se réabonner aux notifications*");

        let logdb = await bot.channels.cache.get(config.logs_db);
        if(!logdb) return console.log(utils.displayConsoleHour + " Chan log db introuvable")

        let owner = await bot.users.fetch(msg.guild.ownerID)
        logdb.send("Stop guilde " + msg.guild.name + "\nid: " + msg.guild.id + "\nOwner: " + owner.username + " (id: " + owner.id + ")",{files:[
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