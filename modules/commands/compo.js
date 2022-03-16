const utils = require('./utils.js');

module.exports = {

    name: 'compo',

    description: 'Envoie la compo chasse du monstre donné',

    structure: 'compo <mob>',

    level: 1,

    run (args) {

        let msg = args.msg;
        let prefix = args.prefix;
        let Mobs = utils.mob;
        let providedMonster = msg.content.toLowerCase().split(' ').slice(1).join(' ');

        if(!providedMonster) return msg.channel.send('La commande est `' + prefix + 'compo <monstre>`');

        if(providedMonster == "liste") {
            let liste = "Voici la liste des noms des monstres:";

            for(i in Mobs){
                liste += "\n> -" + i
            }

            return msg.channel.send(liste)
        }


        let nameListe = {}
        for(i in Mobs){
            Mobs[i].forEach(a => nameListe[a] = i)
        }

        if(!Object.keys(nameListe).includes(providedMonster)) return msg.channel.send('Hum, je ne connais pas ce monstre. Envoyez `' + prefix + 'compo liste` pour obtenir la liste des noms de monstres')

        let fileDirectory = './images/mob/' + nameListe[providedMonster] + '.png'
        if(!msg.channel.permissionsFor(msg.guild.me).has(['ATTACH_FILES'])) return msg.channel.send('Je n\'ai pas la permission de joindre des images. Vous devez m\'ajouter la permission `joindre des fichiers` pour cette commande')
        msg.channel.send({ files: [{ attachment: fileDirectory }] })
    }
}