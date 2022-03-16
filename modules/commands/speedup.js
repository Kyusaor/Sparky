const Discord = require('discord.js');
const utils = require('./utils.js');

module.exports = {

    name:"speedup",

    description:"Lance un calculateur de temps d'accelération total dans votre sac",

    level: 1,

    run: async function (args){
        //Récupération des arguments utiles
        let msg = args.msg;
        let UsSt = args.userstatus;
        function deleteUserStatus(id){
            for(i in UsSt){
                if(UsSt[i] == id){
                    UsSt.splice(i, 1)
                }
            }
        }

        //Check s'il n'y a pas déjà une commande en cours
        if(UsSt.includes(msg.author.id)) { let mess = await msg.channel.send("Désolé, mais il semble que vous avez déjà une commande en cours"); return mess.delete({timeout:10000}) }
        UsSt.push(msg.author.id);

        //Déclaration de la fonction qui calcule le total de temps à partir des minutes
        function total_ecrit(vari){
            let jours = 0;
            let heures = 0;
            while(vari >= 1440){
                vari -= 1440;
                jours++;
            }
            while(vari >= 60){
                vari -= 60;
                heures++
            }
            let tot = jours + " jours, " + heures + " heures, " + vari + " minutes"
            return tot
        }

        //Déclaration de la fonction qui va créer le message à chaque itération
        function Calculateur(su, i) {
            su = new Discord.MessageEmbed()
            .setTitle("__CALCULATEUR DE SPEEDUP__")
            .setDescription("Calculez votre durée totale d'accélération!")
            .setColor([15, 126, 42])
            .setThumbnail("https://cdn.discordapp.com/attachments/600624775080968202/613044782075346944/PicsArt_08-19-06.20.50.png")
            .addField('\u200b', '\u200b', false)
            .addField("Entrez votre nombre d'accélérateurs __" + i + "__", total)
            .setFooter("Demandé par " + msg.author.username)
            return su
        }

        //Initialisation des variables
        let temps = 0;
        let total = "0 jours, 0 heures, 0 minutes"
        let auteur = msg.author.id;
        let embed;

        //Lancement de la boucle
        for(var i in utils.speed){
            embed = new Calculateur(embed, i)
            let mess = await msg.channel.send(embed)
            var coll
            try {
                coll = await msg.channel.awaitMessages(message => (message.author.id === auteur) && (!isNaN(parseInt(message.content))), { max: 1, time: 180000, errors: ['time']})
            }
            catch {
                msg.channel.send("Demande annulée");
                mess.delete();
                deleteUserStatus(msg.author.id)
                return
            }
            let duree = parseInt(coll.first().content, 10)
            temps += duree * utils.speed[i];
            total = total_ecrit(temps)
            mess.delete();
            coll.first().delete();
        }

        //Envoi du dernier message pour le total final
        let emb = new Discord.MessageEmbed()
        .setTitle("__CALCULATEUR DE SPEEDUP__")
        .setDescription("Calculez votre durée totale d'accélération")
        .setColor([15, 126, 42])
        .addField("Voici votre stock total d'accélérateurs:", total)
        .setFooter("Demandé par " + msg.author.username)
        msg.channel.send(emb)
        
        //Suppression de l'user de la liste des occupés
        deleteUserStatus(msg.author.id)
    }
}