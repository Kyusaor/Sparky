const config = require('../../data/config.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../utils.js');

module.exports = {

    name: 'lien',
    description: 'Envoie le lien pour m\'ajouter sur votre serveur',

    isDev: true,

    data: 
        new SlashCommandBuilder()
            .setName('lien')
            .setDescription('Envoie le lien pour m\'ajouter sur votre serveur'),

    run(args){

        args.intera.reply("Voici le lien pour m'ajouter sur votre serveur:\n<https://discord.com/oauth2/authorize?client_id=" + args.bot.user.id + "&scope=bot&permissions=" + config.botperm + ">")
        .catch(error => console.log(utils.displayConsoleHour() + "Impossible d'envoyer le lien dans le salon " + args.intera.channel.id + " (Serveur " + args.intera.guild.name + ")"))
    }
}