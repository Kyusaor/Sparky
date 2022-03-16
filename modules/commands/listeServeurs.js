module.exports = {

    name: "listeserveurs",

    description: "Envoie la liste des serveurs où se trouve le bot",

    level: 3,

    run: async function (args) {

        let msg = args.msg;
        let bot = args.bot;
        const gconfig = args.gconfig;
        

        let liste = "";
        let membres = 0;

        for(i in gconfig) {
            if(!gconfig[i].active) continue;
            
            let guild = await bot.guilds.cache.get(i);
            if(!guild) continue;

            let owner = await bot.users.fetch(guild.ownerID);
            let ownerTag;
            owner ? ownerTag = owner.tag : ownerTag = "Owner introuvable"

            let infos = "__**" + guild.name + "**__ (" + guild.id + "): :busts_in_silhouette:: `" + guild.memberCount + "`; :crown:: " + ownerTag + " (" + owner.id + ")\n\n";
            
            if((infos.length + liste.length) > 2000) {
                msg.channel.send(liste);
                liste = ""
            }
            liste += infos;
            membres += guild.memberCount
        }
        msg.channel.send(liste + "\n\n__Nombre de membres virtuel:__ `" + membres + "`")
    },

}