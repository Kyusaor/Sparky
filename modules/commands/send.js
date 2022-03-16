module.exports = {

    name: 'send',

    description: 'Envoie un mp à un utilisateur',

    level: 3,

    async run(args){

        //Récupération variables
        let msg = args.msg;
        let bot = args.bot;

        let MsgUser = await msg.channel.send("A qui veux-tu que je l'envoie?")

        let repdesti;
        try {
            repdesti = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, { max: 1, time: 30000, errors: ['time']});
        }
        catch {
            MsgUser.delete();
            return msg.channel.send("Annulé")
        }

        MsgUser.delete();
        let desti = repdesti.first().mentions.users.first() || bot.users.cache.get(repdesti.first().content.trim());
        repdesti.first().delete();
        
        if(!desti) return msg.channel.send("User introuvable");

        let MsgContentAsk = await msg.channel.send("Que veux-tu envoyer?");
        let MsgContent;
        try {
            MsgContent = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, { max: 1, time: 30000, errors: ['time']});
        }
        catch {
            MsgContentAsk.delete();
            return msg.channel.send("Annulé")
        }

        MsgContentAsk.delete();
        let content = MsgContent.first().content;

        let attach = [];
        MsgContent.first().attachments.forEach(a => {
            attach.push(a.url)
        })

        desti.send(content, { files: attach })
        .catch(error => msg.channel.send("Impossible d'envoyer le message"))

        msg.channel.send('Envoyé avec succès à ' + desti.tag + ' (id: ' + desti.id + ')')
    }
}