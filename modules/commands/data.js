const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const utils = require('../utils.js');

module.exports = {

    name:'data',
    description:'Envoie la base de données du bot en mp',
    isDev: false,

    data: 
        new SlashCommandBuilder()
            .setName('data')
            .setDescription('Envoie la base de donnée')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async run(args){

        let mp = await args.intera.user.createDM();

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