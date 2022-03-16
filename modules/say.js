module.exports = {

    name: "say",

    description: "Fais envoyer un message par le bot",

    level: 3,

    async run(args){

        //variables utiles
        let msg = args.msg;
        let bot = args.bot;

        //Récup salon
        msg.delete();
        let demande_salon = await msg.channel.send("Dans quel salon voulez-vous envoyer le message?");

        let reponse_chan;
        try {
            reponse_chan = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, { max: 1, time: 30000, errors: ['time']});
        }
        catch {
            msg.channel.send("Demande annulée")
            return demande_salon.delete()
        }
        demande_salon.delete()

        let chan;

        if(!reponse_chan.first()) return msg.channel.send("Demande annulée");

        chan = reponse_chan.first().mentions.channels.first();

        if(!chan){
            let content = reponse_chan.first().content.split(' ')[0]

            chan = await bot.channels.cache.get(content)

            if(!chan) return msg.channel.send("Salon invalide")
        }
        reponse_chan.first().delete();

        let demande_msg = await msg.channel.send("Que voulez-vous envoyer?")

        let reponse_msg;
        try {
            reponse_msg = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, { max: 1, time: 30000, errors: ['time']});
        }
        catch {
            msg.channel.send("Demande annulée")
            return demande_msg.delete()
        }
        demande_msg.delete();

        if(!reponse_msg.first()) return msg.channel.send("Demande annulée");

        reponse_msg.first().content ? chan.send(reponse_msg.first().content) : reponse_msg.first().attachments.forEach(element => chan.send({ files: [{attachment: element.url, name: element.filename}]}));

        reponse_msg.delete()
    }
}