const defVal = require('../../data/defaultValues.js');
const { SlashCommandBuilder } = require('discord.js');
const utils = require('../utils.js');

module.exports = {

    name: 'cycle',

    description: 'Envoie les prochaines rotations de monstres',

    level: 1,

    data: 
        new SlashCommandBuilder()
            .setName('cycle')
            .setDescription('Envoie les prochaines rotations de monstres (obsolète)')
            .setDMPermission(false),

    run(args) {

        args.intera.reply("Le cycle de monstres étant désormais aléatoire, cette commande a donc été malheureusement rendue obsolète")
        .catch(err => utils.errorSendReply('cycle', args))
/*
        //Récupération des variables utiles
        let msg = intera.msg;
        let Mobs = defVal.cycle;

        //Calcul du nombre de jours écoulés depuis la date origine
        let tsAjd = Date.now();
        let ecart = Math.floor((tsAjd - defVal.origine) / 86400000);
        
        //Calcul de la position des mobs dans la liste
        let mob = ecart % Mobs.length;
        let mob2 = mob + 1;
        if(mob2 == Mobs.length) mob2 = 0;


        let liste = "__**Cycle des monstres**__\n\nAujourd'hui: " + Mobs[mob] + " et " + Mobs[mob2] + "\n";

        for(i = 1; i < (Mobs.length + 1); i++) {
            let dateAjd = new Date(tsAjd + (86400000 * i));

            if(dateAjd.getUTCDay() == 1) liste += "\n";
            let dateString = "`" + defVal.jours[dateAjd.getUTCDay()] + " [" + utils.zero(dateAjd.getUTCDate()) + "/" + utils.zero(dateAjd.getUTCMonth() + 1) + "]`";

            mob++;
            mob2++;
            if(mob == Mobs.length) mob = 0;
            if(mob2 == Mobs.length) mob2 = 0;

            liste += "\n" + dateString + " " + Mobs[mob] + " et " + Mobs[mob2]
        }
        liste += "\n\n**__Note:__ Les nouveaux monstres n'étant pas encore définis dans le cycle de monstres, celui-ci est amené à changer lorsqu'il y sera intégré**"

        msg.channel.send(liste)
*/
    },

}