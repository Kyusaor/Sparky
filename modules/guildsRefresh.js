module.exports = {

    name: "guildsrefresh",

    description:"Mets à jour le fichier liste des serveurs",

    level: 3,

    run: async function(args){

        //Récupération des variables
        let bot = args.bot;
        const gconfig = args.gconfig;
        let msg = args.msg;

        //Récupération de la liste des serveurs
        let mess = await msg.channel.send("Chargement en cours...");

        for(i in gconfig){
            let guild = await bot.guilds.cache.get(i);
            if(guild){
                gconfig[i].active = true;
                console.log("1")
            }
            else{
                gconfig[i].active = false;
                console.log("2")
            }
        }

        setTimeout(() => {
            for(i in gconfig){
                console.log(gconfig[i].active)
            }
            fs.writeFileSync('./data/guild_config.json', JSON.stringify(gconfig));
            mess.edit("Terminé!")
        }, 10000);
        
    }
}