const config = require('../../data/config.js');
const { SlashCommandBuilder } = require('discord.js');
const utils = require('../utils.js');

module.exports = {

    name: 'lien',
    description: 'Envoie le lien pour m\'ajouter sur votre serveur',

    data: 
        new SlashCommandBuilder()
            .setName('lien')
            .setDescription('Envoie le lien pour m\'ajouter sur votre serveur'),

    run(args){

        args.intera.reply("Voici le lien pour m'ajouter sur votre serveur:\n<https://discord.com/api/oauth2/authorize?client_id=" + args.bot.user.id + "&permissions=" + config.botperm + "&scope=bot%20applications.commands" + ">")
        .catch(error => utils.errorSendReply('lien', args))
    }
}