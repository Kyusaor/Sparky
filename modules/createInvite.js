module.exports = {

    name: "createinvite",

    structure: "createinvite <ID>",

    description: "Créée une invitation unique pour le serveur donné",

    level: 3,

    run: function (args){

        let msg = args.msg;
        let bot = args.bot;
        let idg = msg.content.split(' ')[1];
            
        if(msg.content.trim().split(' ').length != 2) return msg.channel.send("Précisez un id valide");
        if(!Object.keys(args.gconfig).includes(idg)) return msg.channel.send("Ce serveur n'est pas enregistré");
        else {
            let guild1 = bot.guilds.cache.get(idg);
            if(!guild1) return msg.channel.send("Je ne suis pas sur ce serveur");
            let inviteChan = guild1.channels.cache.filter(c=> c.permissionsFor(guild1.me).has('CREATE_INSTANT_INVITE'));
            if(!inviteChan.last()) return msg.channel.send("Je n'ai pas la permission de créer d'invitation");
            inviteChan.last().createInvite()
            .then(inv => msg.channel.send(inv.url))
            .catch(console.error)
        }
    },
}