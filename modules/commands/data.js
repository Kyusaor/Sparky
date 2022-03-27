const utils = require('../utils.js');

module.exports = {

    name:'data',

    description:'Envoies la base de données du bot en mp',

    level: 3,

    async run(args){

        let msg = args.msg;

        let mp = await msg.author.createDM();

        mp.send({files:[
            {
                attachment:'./data/globalPing.json',
                name:'globalPing.json',
            },
            {
                attachment:'./data/guild_config.json',
                name:'guild_config.json'
            }
        ]})
        .catch(error => console.log(utils.displayConsoleHour(new Date()) + "Impossible d'envoyer les logs à " + msg.author.tag))
        
    }
}