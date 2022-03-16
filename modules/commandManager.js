//Récupération des config
const Config = require('../data/config.js');

//Commandes admin
const Veilleur = require('./commands/veilleur.js');
const StopVeilleur = require('./commands/stopVeilleur.js');

//Commandes pour tout le monde
const SpeedUp = require('./commands/speedup.js');
const Compo = require('./commands/compo.js');
const UserInfos = require('./commands/userInfo.js');
const InfoServeur = require('./commands/serverInfo.js');
const Aide = require('./commands/aide.js');
const Contact = require('./commands/contact.js');
const Credits = require('./commands/credits.js');
const Lien = require('./commands/lien.js');
const InfoBot = require('./commands/infobot.js');
const Cycle = require('./commands/cycle.js');
//const Rotation = require('./commands/rotation.js');

//Commandes propriétaire du bot
const ListeServeurs = require('./commands/listeServeurs.js');
const Data = require('./commands/data.js');
const createInvite = require('./commands/createInvite.js');
const Say = require('./commands/say.js');
const SetGlobalPing = require('./commands/setGlobalPing.js');
const InfosServ = require('./commands/infosServ.js');
const Refresh = require('./commands/refresh.js');
const LeaveServ = require('./commands/leaveServ.js');
const Reboot = require('./commands/reboot.js');
const Send = require('./commands/send.js');


//Construction des commandes disponibles pour le membre donné
module.exports = function (member) {

    //déclare la variable dans laquelle seront enregistrées les commandes disponibles pour le membre
    let commandesMembre = {};

    //Ajoute les commandes si l'utilisateur est Kyusaki
    if (member.user.id === Config.kyu) {
        commandesMembre.listeserveurs = { command: ListeServeurs };
        commandesMembre.createinvite = { command: createInvite };
        commandesMembre.say = { command: Say };
        commandesMembre.setglobalping = { command: SetGlobalPing };
        commandesMembre.infoserv = { command: InfosServ };
        commandesMembre.leaveserv = { command: LeaveServ };
        commandesMembre.refresh = { command: Refresh };
        commandesMembre.reboot = { command: Reboot };
        commandesMembre.data = { command: Data };
        commandesMembre.send = { command: Send };
    };

    //Ajoute les commandes si le membre a les permissions admin ou qu'il s'agit de Kyusaki
    if (member.hasPermission('ADMINISTRATOR') || (member.user.id == Config.kyu)) {
        commandesMembre.préfixe = { command: Prefix };
        commandesMembre.veilleur = { command: Veilleur };
        commandesMembre.stopveilleur = { command: StopVeilleur };
    };

    //Ajoute les commandes membres
    commandesMembre.speedup = { command: SpeedUp, alias: "su" };
    commandesMembre.compo = { command: Compo, alias: "c" };
    commandesMembre.userinfo = { command: UserInfos, alias: "ui" };
    commandesMembre.infoserveur = { command: InfoServeur };
    commandesMembre.aide = { command: Aide, alias: "a" };
    commandesMembre.contact = { command: Contact };
    commandesMembre.credits = { command: Credits };
    commandesMembre.lien = { command: Lien};
    commandesMembre.infobot = { command: InfoBot };
    commandesMembre.cycle = { command: Cycle };
    //commandesMembre.rotation = { command: Rotation, alias: "rota" };

    //Ajoute les Eastereggs
    //commandesMembre.kyu = { command: EEkyu };

    //Gestion des alias
    commandesMembre.aliases = {
        su: "speedup",
        c: "compo",
        a: "aide",
        ui: "userinfo",
        //rota: "rotation",
    }


    //La fonction renvoie la variable commandesMembres
    return commandesMembre
}