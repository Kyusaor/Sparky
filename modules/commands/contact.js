const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../utils.js');

module.exports = {

    name: 'contact',
    description: 'Nous contacter (discord ou email)',

    data:
        new SlashCommandBuilder()
            .setName('contact')
            .setDescription('Nous contacter (discord ou email)'),
        
    async run(args) {

        args.intera.reply("Besoin d'aide sur le bot, de signaler un bug ou simplement discuter avec des joueurs de Lords Mobile? Voilà le lien du serveur :wink: \n " + utils.link + "\n\nPour contacter le développeur, vous pouvez également envoyer un mail à __**sparky.botfr@gmail.com**__")
        .catch(err => utils.errorSendReply('contact', args))

    }
}