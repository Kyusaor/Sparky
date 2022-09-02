const { SlashCommandBuilder } = require('discord.js');
const utils = require('../utils');

module.exports = {

    name: 'speedup',
    description: 'Calcule votre total d\'accelérateurs dans votre sac (indisponible)',

    data: new SlashCommandBuilder()
        .setName('speedup')
        .setDescription('Calcule votre total d\'accelérateurs dans votre sac (indisponible)')
        .setDMPermission(false),

    run: async function(args) {

        await args.intera.reply('La commande speedup est malheureusement rendue indisponible à cause de la mise à jour discord, le temps qu\'une alternative simple à utiliser soit trouvée.')
            .catch(e => utils.errorSendReply('speedup', args))
    }
}