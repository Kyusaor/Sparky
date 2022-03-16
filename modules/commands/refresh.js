module.exports = {

    name:'refresh',

    description:'Refresh le statut des serveurs dans la db',

    level:3,

    async run(args){

        let msg = args.msg;
        let bot = args.bot;
        let gconfig = args.gconfig;

        let loading = await msg.channel.send("<a:loading:739785338347585598> Opération en cours...")

        //verif que les serv où est le bot sont bien déinis dans la db
        await bot.guilds.cache.forEach(g => {

            if(!gconfig[g.id]){
                gconfig[g.id] = {
                    name:g.name,
                    prefix:"!",
                    active:true
                }
            }
            if(!gconfig[g.id].active) gconfig[g.id].active = true;
        })

        for(i in gconfig){
            let serv = await bot.guilds.cache.get(i);

            serv ? gconfig[i].active = true : gconfig[i].active = false;
        }

        loading.delete();
        msg.channel.send("Les serveurs ont été mis à jour !")
    },
}