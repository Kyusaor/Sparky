const Discord = require('discord.js');
const fs = require('fs');
const utils = require('./utils');
const config = require('../data/config.js');

module.exports = {

    name: "veilleur",

    description: "Créée un salon d'annonce des évènements infernaux veilleur et dragon postés sur le bot",

    level: 2,

    run: async function (args){

        //Récupération des variables utiles
        let msg = args.msg;
        let bot = args.bot;
        let kyu = args.kyu;
        let ping_veilleur = args.gpconfig[msg.guild.id];

        if(!msg.channel.permissionsFor(bot.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL'])) return console.log(utils.displayConsoleHour() + "impossible de set le veilleur: manque perm de voir le salon " + msg.channel.id)
        if(!msg.channel.permissionsFor(bot.user).has(['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'])) return msg.channel.send("Je n'ai pas toutes les permissions requises sur ce salon: il me faut la permission de voir l'historique et d'ajouter des réactions");
        if(!ping_veilleur) ping_veilleur = { ping:false }

        //Confirmation et réinitialisation des infos de guilde (partie ping veilleur)
        if(ping_veilleur.ping){
            let confirmation1 = await msg.channel.send("Les annonces veilleur sont déjà paramétrées. Voulez-vous:\n-🔄 Redéfinir les paramètres\n-❌ Annuler\n\n⚠️*Ceci est irréversible, vos membres devront se réabonner*");
            await confirmation1.react('🔄');
            await confirmation1.react('❌');

            let coll;
            try {
                coll = await confirmation1.awaitReactions((reaction, user) => (user.id == msg.author.id) && (reaction.emoji.name == '❌' || '🔄'), { time: 60000, max: 1 })
            }
            catch {
                return msg.channel.send("Annulé!")
            }
            let reaction_confi = coll.first();
            confirmation1.delete();
            if(!reaction_confi || (reaction_confi.emoji.name != '🔄')) return msg.channel.send("Annulé!");

            if(!msg.guild.me.hasPermission(['MANAGE_CHANNELS', 'MANAGE_ROLES'], false, true)) return msg.channel.send("Je n'ai pas toutes les permissions nécessaires: j'ai besoin des permissions `Gérer les roles` et `Gérer les salons` (afin de pouvoir créer le salon et les rôles d'annonce).\nVous pourrez me retirer ces permissions une fois le salon créé");
            await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.CDR);
            await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.CDT);
            await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.ID);
            await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.IVR);
            await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.IV);
            await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.IDR);
            await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.OJ);
            await utils.deleteRole(bot, msg.guild.id, ping_veilleur.roles.OR);
            await utils.deleteChan(bot, msg.guild.id, ping_veilleur.chan_notifs);

            if(ping_veilleur.chan_board) utils.deleteChan(bot, msg.guild.id, ping_veilleur.chan_board);
        };


        //Conditions et paramétrage
        if(!msg.guild.me.hasPermission(['MANAGE_CHANNELS', 'MANAGE_ROLES'], false, true)) return msg.channel.send("Je n'ai pas toutes les permissions nécessaires: j'ai besoin des permissions `Gérer les roles` et `Gérer les salons` (afin de pouvoir créer le salon et les rôles d'annonce).\nVous pourrez me retirer ces permissions une fois le salon créé");
        ping_veilleur = {};


        //Mentions globales
        let message_demande_MG = await msg.channel.send("Voulez-vous obtenir les notifications envoyées par le staff du bot?\n\n⚠️*La demande sera annulée après 1 minute*");
        await message_demande_MG.react('✅');
        await message_demande_MG.react('❌');

        try {
            coll = await message_demande_MG.awaitReactions((reaction, user) => (user.id == msg.author.id) && (reaction.emoji.name == '❌' || '✅'), { time: 60000, max: 1, errors: ['time']})
        }
        catch {
            message_demande_MG.delete();
            return msg.channel.send("Demande annulée");
        }
        let reaction_demande_MG = coll.first();
        message_demande_MG.delete();

        if(reaction_demande_MG.emoji.name == '✅'){
            ping_veilleur.ping_global = true;
            msg.channel.send("Les annonces d'évènements infernaux globales seront publiées!");
        }
        else {
            ping_veilleur.ping_global = false;
            msg.channel.send("Vous ne recevrez que les évènements partagés par les membres du serveur");
        }
        



        //Création des salons et rôles
        let msg_chargement = await msg.channel.send("<a:loading:739785338347585598> Paramétrage en cours...");
        let chan_board; let chan_notifs;

        chan_board = await msg.guild.channels.create("tableau-veilleurs-dragons", { 
            permissionOverwrites: [
                {
                    id: msg.guild.id,
                    deny:['SEND_MESSAGES', 'ADD_REACTIONS', 'MANAGE_MESSAGES']
                },
                {
                    id: bot.user.id,
                    allow:['SEND_MESSAGES', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY', 'VIEW_CHANNEL']
                }
            ],
            type: "text",
            topic:"Lisez le panneau d'information pour vous attribuer les rôles voulus"
            }
        ).catch(e => e)

        chan_notifs = await msg.guild.channels.create("notifs-veilleurs-dragons", { 
            permissionOverwrites: [
                {
                    id: msg.guild.id,
                    deny:['SEND_MESSAGES', 'ADD_REACTIONS', 'MANAGE_MESSAGES']                    },
                {
                    id: bot.user.id,
                    allow:['SEND_MESSAGES', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY', 'VIEW_CHANNEL']
                }
            ],
            type:'text',
            topic:"Lisez le panneau d'information pour vous attribuer les rôles voulus. Ici seront également publiées les annonces d'évènements infernaux Veilleurs et Dragons"
            }
        ).catch(e => e)

        if(!chan_board || !chan_notifs) return msg.channel.send("Je n'ai pas les permissions nécessaires: il me faut la permission `gérer les salons`");
        ping_veilleur.chan_notifs = chan_notifs.id;
        ping_veilleur.chan_board = chan_board.id;

        let embed = new Discord.MessageEmbed()
        .setTitle("__**Signalement des Veilleurs et Dragons**__")
        if(ping_veilleur.supp_auto){embed.setDescription("Dans ce salon seront publiés les évènements infernaux et challenges Veilleurs et Dragons\n\nCliquez sur les réactions sous le message pour vous abonner aux notifications")}
        else{embed.setDescription("Les mentions des évènements infernaux Veilleur et Dragon seront publiées dans le <#" + ping_veilleur.chan_notifs + ">")}
        embed.setFooter("Développé avec amour par " + kyu.tag, kyu.displayAvatarURL())
        .addField("** **", "** **")
        .addField("__Evènements Infernaux__", "Sélection des notifications d'évènements infernaux")
        .addField("<:rechVeill:660453261979025418> Recherche (Veilleur):", "Vous serez mentionné lorsqu'un évènement infernal Veilleur Recherche est en cours")
        .addField("<:rechDrag:660453599318638592> Recherche (Dragon):", "Vous serez mentionné lorsqu'un évènement infernal Dragon Recherche est en cours")
        .addField("<:veilleur:607194832271573024> Veilleur (hors recherche):", "Vous serez mentionné lorsqu'un évènement infernal Veilleur (sauf recherche) est en cours")
        .addField("<:dragonLM:607194934759391242> Dragon (hors recherche):", "Vous serez mentionné lorsqu'un évènement infernal Dragon (sauf recherche) est en cours")
        .addField("<:yellorb:740689133600768091> Orbes Jaunes:", "Vous serez mentionné lorsqu'un évènement infernal avec des orbes jaunes débute")
        .addField("<:redorb:740688906755768470> Orbes Rouges:", "Vous serez mentionné lorsqu'un évènement infernal avec des orbes rouges débute")
        .addField("** **", "** **")
        .addField("__Challenges__", "Sélection des notifications des challenges Dragon du Chaos")
        .addField("<:fantassin:607554773851570181> Entraînement:", "Vous serez mentionné lorsqu'il y aura un challenge Troupes Dragon")
        .addField("<:academie:607196986948452377> Recherche:", "Vous serez mentionné lorsqu'il y aura un challenge Dragon Recherche")

        let msg_board = await chan_board.send(embed);
        ping_veilleur.msg_board = msg_board.id;
        utils.VeilleurReac.forEach(async r => await msg_board.react(r))

        let role_IVR = await msg.guild.roles.create({
            data: {
                name:'InfernalRechercheVeilleur',
                hoist:false,
                permissions:0,
                mentionable:true,
            }
        });
        let role_IDR = await msg.guild.roles.create({
            data: {
                name:'InfernalRechercheDragon',
                permissions:0,
                hoist:false,
                mentionable:true,
            }
        });
        let role_IV = await msg.guild.roles.create({
            data: {
                name:'InfernalVeilleur',
                hoist:false,
                permissions:0,
                mentionable:true,
            }
        });
        let role_ID = await msg.guild.roles.create({
            data: {
                name:'InfernalDragon',
                hoist:false,
                permissions:0,
                mentionable:true,
            }
        });
        let role_CDT = await msg.guild.roles.create({
            data: {
                name:'ChallDragonTroupes',
                permissions:0,
                hoist:false,
                mentionable:true,
            }
        });
        let role_CDR = await msg.guild.roles.create({
            data: {
                permissions:0,
                name:'ChallDragonRecherche',
                hoist:false,
                mentionable:true,
            }
        });
        let role_OJ = await msg.guild.roles.create({
            data: {
                name:'Orbes jaunes',
                permissions:0,
                hoist:false,
                mentionable:true,
            }
        });
        let role_OR = await msg.guild.roles.create({
            data: {
                name:'Orbes rouges',
                permissions:0,
                hoist:false,
                mentionable:true,
            }
        });

        ping_veilleur.roles = {
            IVR:role_IVR.id,
            IDR:role_IDR.id,
            IV:role_IV.id,
            ID:role_ID.id,
            CDT:role_CDT.id,
            CDR:role_CDR.id,
            OJ:role_OJ.id,
            OR:role_OR.id,
        }

        //Application des changements
        ping_veilleur.ping = true;
        args.gpconfig[msg.guild.id] = ping_veilleur;
        fs.writeFileSync('./data/globalPing.json', JSON.stringify(args.gpconfig));

        msg_chargement.delete();
        msg.channel.send("Terminé! Les mentions d'évènements infernaux ont été paramétrés, faites `" + args.gconfig[msg.guild.id].prefix + "stopveilleur` pour les supprimer")
        
        //Envoie backup
        let logdb = await bot.channels.cache.get(config.logs_db);
        if(!logdb) return console.log(utils.displayConsoleHour + " Chan log db introuvable")

        let owner = await bot.users.fetch(msg.guild.ownerID)
        logdb.send("Créa guilde " + msg.guild.name + "\nid: " + msg.guild.id + "\nOwner: " + owner.tag + " (id: " + owner.id + ")",{files:[
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