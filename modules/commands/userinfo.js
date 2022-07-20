const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../utils.js');


module.exports = {

    name: "info",

    description: "Envoie les infos d\'un compte discord",

    level: 1,

    data: 
        new SlashCommandBuilder()
            .setName('userinfo')
            .setDescription('Envoie les infos d\'un compte discord')
            .addUserOption(opt => opt.setName('pseudo').setDescription('Le membre cible')),

    run: async function(args) {

        let user = args.intera.options.getUser('pseudo') || args.intera.user;

        let pseudo = user.username;
        
        
        let membre = await args.intera.guild.members.fetch(user.id);
        
        
    }
}