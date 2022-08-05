const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../utils');

module.exports = {

    name:'data',
    description:'Envoies la base de données du bot en mp',

    data: 
        new SlashCommandBuilder()
            .setName('data')
            .setDescription('Envoie la base de donnée'),

    async run(args){

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