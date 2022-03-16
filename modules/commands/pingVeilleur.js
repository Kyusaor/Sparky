module.exports = {

    name: "pingveilleur",

    description: "Créée un salon d'annonce des évènements infernaux veilleur et dragon postés sur le bot",

    level: 2,

    run: async function (args){

        //Récupération des variables utiles
        let msg = args.msg;
        let bot = args.bot;
        let Discord = args.Discord;
        let kyu = args.kyu;
        let ping_veilleur = args.gconfig[msg.guild.id].veilleur;

        //Confirmation et réinitialisation des infos de guilde (partie ping veilleur)
        if(ping_veilleur){
            let confirmation1 = await msg.channel.send("Les annonces veilleur sont déjà paramétrées. Voulez-vous:\n-🔄 Redéfinir les paramètres\n-❌ Annuler\n\n⚠️*La demande sera annulée après 1 minute*");
            let reac = confirmation1.react('🔄');
            reac = confirmation1.react('❌');

            let coll = await confirmation1.awaitReactions((reaction, user) => (user.id == msg.author.id) && (reaction.emoji.name == '❌' || '🔄'), { time: 60000, max: 1 });
            let reaction_confi = coll.first();
            confirmation1.delete();
            if(!reaction_confi || (reaction_confi.emoji.name != '🔄')) return msg.channel.send("Annulé!");

            if(!msg.guild.me.hasPermission(['MANAGE_CHANNELS', 'MANAGE_ROLES'], false, true)) return msg.channel.send("Je n'ai pas toutes les permissions nécessaires: j'ai besoin des permissions pour gérer les roles et les salons (afin de pouvoir créer le salon et les rôles d'annonce).\nVous pourrez me retirer ces permissions une fois le salon créé");
            let CDR = msg.guild.roles.get(ping_veilleur.roles.CDR); console.log(ping_veilleur.roles.CDR)
            let CDT = msg.guild.roles.get(ping_veilleur.roles.CDT);
            let ID = msg.guild.roles.get(ping_veilleur.roles.ID);
            let IDR = msg.guild.roles.get(ping_veilleur.roles.IDR);
            let IV = msg.guild.roles.get(ping_veilleur.roles.IV);
            let IVR = msg.guild.roles.get(ping_veilleur.roles.IVR);
            let ancien_chan = msg.guild.channels.get(ping_veilleur.chan_notifs)

            CDR.delete();
            CDT.delete();
            ID.delete();
            IDR.delete();
            IV.delete();
            IVR.delete();
            ancien_chan.delete()

            if(ping_veilleur.chan_board){ancien_chan = msg.guild.channels.get(ping_veilleur.chan_board); ancien_chan.delete()}
        };


        //Conditions et paramétrage
        if(!msg.guild.me.hasPermission(['MANAGE_CHANNELS', 'MANAGE_ROLES'], false, true)) return msg.channel.send("Je n'ai pas toutes les permissions nécessaires: j'ai besoin des permissions pour gérer les roles et les salons (afin de pouvoir créer le salon et les rôles d'annonce).\nVous pourrez me retirer ces permissions une fois le salon créé");
        ping_veilleur = {};
        msg.channel.send("__```Paramétrage des annonces veilleur et dragon```__");
        

        //Supression auto
        let demande = await msg.channel.send("Voulez-vous que les messages d'annonces soient supprimés automatiquement lorsque l'évènement infernal est passé?\n\n⚠️*La demande sera annulée après 1 minute*");
        let reac = await demande.react('✅');
        react = await demande.react('❌');
        let coll = await demande.awaitReactions((reaction, user) => (user.id == msg.author.id) && (reaction.emoji.name == '❌' || '✅'), { time: 60000, max: 1 });
        let reaction_supression = coll.first();
        demande.delete();

        if(!reaction_supression) {
            return msg.channel.send("Demande annulée");
        }
        else if(reaction_supression.emoji.name == '✅'){
            ping_veilleur.supp_auto = true;
            msg.channel.send("`1)`Les messages d'annonce seront supprimés automatiquement après une heure!");
        }
        else {
            ping_veilleur.supp_auto = false;
            msg.channel.send("`1)`Les messages seront conservés");
        }

        //2- Mentions globales
        let message_demande_MG = await msg.channel.send("Voulez-vous obtenir les notifications envoyées par le staff du bot?\n\n⚠️*La demande sera annulée après 1 minute*");
        react = await message_demande_MG.react('✅');
        react = await message_demande_MG.react('❌');
        coll = await message_demande_MG.awaitReactions((reaction, user) => (user.id == msg.author.id) && (reaction.emoji.name == '❌' || '✅'), { time: 60000, max: 1});
        let reaction_demande_MG = coll.first();
        message_demande_MG.delete();

        if(!reaction_demande_MG) {
            return msg.channel.send("Demande annulée");
        }
        else if(reaction_demande_MG.emoji.name == '✅'){
            ping_veilleur.ping_global = true;
            msg.channel.send("`2)`Les annonces d'évènements infernaux globales seront publiées!");
        }
        else {
            ping_veilleur.ping_global = false;
            msg.channel.send("`2)`Vous ne recevrez que les évènements partagés par les membres du serveur");
        }


        //Création des salons et rôles
        let chan_board; let chan_notifs;

        if(ping_veilleur.supp_auto){
            chan_board = await msg.guild.createChannel("notifs-veilleurs-dragons", { 
                type:'text',
                permissionOverwrites: [
                    {
                        id: msg.guild.id,
                        deny:['SEND_MESSAGES', 'ADD_REACTIONS', 'MANAGE_MESSAGES']
                    },
                    {
                        id: bot.user.id,
                        allow:['SEND_MESSAGES', 'ADD_REACTIONS']
                    }], 
                topic:"Lisez le panneau d'information pour vous attribuer les rôles voulus. Ici seront également publiées les annonces d'évènements infernaux Veilleurs et Dragons"
                }
            ).catch(console.error)
            ping_veilleur.chan_notifs = chan_board.id;
        } 
        else {
            chan_board = await msg.guild.createChannel("tableau-veilleurs-dragons", { 
                permissionOverwrites: [
                    {
                        id: msg.guild.id,
                        deny:['SEND_MESSAGES', 'ADD_REACTIONS', 'MANAGE_MESSAGES']
                    },
                    {
                        id: bot.user.id,
                        allow:['SEND_MESSAGES', 'ADD_REACTIONS']
                    }
                ],
                type: "text",
                topic:"Lisez le panneau d'information pour vous attribuer les rôles voulus"
                }
            ).catch(console.error)

            chan_notifs = await msg.guild.createChannel("notifs-veilleurs-dragons", { 
                permissionOverwrites: [
                    {
                        id: msg.guild.id,
                        deny:['SEND_MESSAGES', 'ADD_REACTIONS', 'MANAGE_MESSAGES']
                    },
                    {
                        id: bot.user.id,
                        allow:['SEND_MESSAGES', 'ADD_REACTIONS']
                    }
                ],
                type:'text',
                topic:"Lisez le panneau d'information pour vous attribuer les rôles voulus. Ici seront également publiées les annonces d'évènements infernaux Veilleurs et Dragons"
                }
            ).catch(console.error)

            ping_veilleur.chan_notifs = chan_notifs.id;
            ping_veilleur.chan_board = chan_board.id;
        }

        let embed = new Discord.MessageEmbed()
        .setTitle("__**Signalement des Veilleurs et Dragons**__")
        if(ping_veilleur.supp_auto){embed.setDescription("Dans ce salon seront publiés les évènements infernaux et challenge Veilleurs et Dragons\n\nCliquez sur les réactions sous le message pour vous abonner aux notifications")}
        else{embed.setDescription("Les mentions des évènements infernaux Veilleur et Dragon seront publiées dans le <#" + ping_veilleur.chan_notifs + ">")}
        embed.setFooter("Développé avec amour par Kyusaki#9053")
        .addBlankField()
        .addField("__Evènements Infernaux__", "Sélection des notifications d'évènements infernaux")
        .addField("<:rechVeill:660453261979025418> Recherche (Veilleur):", "Vous serez mentionné lorsqu'un évènement infernal veilleur recherche est en cours")
        .addField("<:rechDrag:660453599318638592> Recherche (Dragon):", "Vous serez mentionné lorsqu'un évènement infernal Dragon Recherche est en cours")
        .addField("<:veilleur:607194832271573024> Veilleur (hors recherche):", "Vous serez mentionné lorsqu'un évènement infernal veilleur (sauf recherche) est en cours")
        .addField("<:dragonLM:607194934759391242> Dragon (hors recherche):", "Vous serez mentionné lorsqu'un évènement infernal dragon (sauf recherche) est en cours")
        .addBlankField()
        .addField("__Challenges__", "Recevez les notifs des challenge dragon")
        .addField("<:fantassin:607554773851570181> Entraînement:", "Vous serez mentionné lorsqu'il y aura un Challenge troupes Dragon")
        .addField("<:academie:607196986948452377> Recherche:", "Vous serez mentionné lorsqu'il y aura un challenge recherche Dragon")
        .addBlankField()
        .addField("__Signaler un évènement__", "Signalez **vous-même** l'évènement!")
        .addField(":regional_indicator_v: Veilleur:", "Signalez un veilleur")
        .addField(":regional_indicator_d: Dragon:", "Signalez un Dragon")

        let msg_board = await chan_board.send(embed);
        reac = await msg_board.react('660453261979025418');
        reac = await msg_board.react('660453599318638592');
        reac = await msg_board.react('607194832271573024');
        reac = await msg_board.react('607194934759391242');
        reac = await msg_board.react('607554773851570181');
        reac = await msg_board.react('607196986948452377');
        reac = await msg_board.react('🇻');
        reac = await msg_board.react('🇩');


        let role_IVR = await msg.guild.createRole({
            name:'InfernalRechercheVeilleur',
            hoist:false,
            mentionnable:true,
        });
        let role_IDR = await msg.guild.createRole({
            name:'InfernalRechercheDragon',
            hoist:false,
            mentionnable:true,
        });
        let role_IV = await msg.guild.createRole({
            name:'InfernalVeilleur',
            hoist:false,
            mentionnable:true,
        });
        let role_ID = await msg.guild.createRole({
            name:'InfernalDragon',
            hoist:false,
            mentionnable:true,
        });
        let role_CDT = await msg.guild.createRole({
            name:'ChallDragonTroupes',
            hoist:false,
            mentionnable:true,
        });
        let role_CDR = await msg.guild.createRole({
            name:'ChallDragonRecherche',
            hoist:false,
            mentionnable:true,
        });

        ping_veilleur.roles = {
            IVR:role_IVR.id,
            IDR:role_IDR.id,
            IV:role_IV.id,
            ID:role_ID.id,
            CDT:role_CDT.id,
            CDR:role_CDR.id
        }

        //Application des changements
        args.gconfig[msg.guild.id].veilleur = ping_veilleur;
    }
}