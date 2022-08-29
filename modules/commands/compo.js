const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const utils = require('../utils.js');

module.exports = {

    name: 'compo',
    description: 'Envoie les compos de héros en chasse du monstre donné',

    data: new SlashCommandBuilder()
        .setName('compo')
        .setDescription('envoie les compos de héros en chasse du monstre donné')
        .setDMPermission(false)
        .addStringOption(mob =>
            mob
                .setName('monstre')
                .setDescription('le monstre dont vous voulez la compo')
                .setRequired(true)
                .addChoices(
                    { name: 'Aile de Givre', value: './images/mob/agivre.png'},
                    { name: 'Ailes Noires', value: './images/mob/anoires.png'},
                    { name: 'Bête des Neiges', value: './images/mob/bete.png'},
                    { name: 'Chaman Vaudou', value: './images/mob/chaman.png'},
                    { name: 'Cott-rage', value: './images/mob/cottrage.png'},
                    { name: 'Drider de l\'Enfer', value: './images/mob/drider.png'},
                    { name: 'Epinator', value: './images/mob/epinator.png'},
                    { name: 'Faucheuse', value: './images/mob/faucheuse.png'},
                    { name: 'Flipper Arctique', value: './images/mob/flipper.png'},
                    { name: 'Gargantua', value: './images/mob/gargantua.png'},
                    { name: 'Gladiateur Serpent', value: './images/mob/serpent'},
                    { name: 'Golem Antique', value: './images/mob/golem.png'},
                    { name: 'Gorzilla', value: './images/mob/gorzilla.png'},
                    { name: 'Griffon', value: './images/mob/griffon.png'},
                    { name: 'Méga-Larve', value: './images/mob/larve.png'},
                    { name: 'Mecha-Troyen', value: './images/mob/mecha.png'},
                    { name: 'Morfalange', value: './images/mob/morfalange.png'},
                    { name: 'Nécrose', value: './images/mob/necrose.png'},
                    { name: 'Nocéros', value: './images/mob/noceros.png'},
                    { name: 'Reine Abeille', value: './images/mob/abeille.png'},
                    { name: 'Sabrecroc', value: './images/mob/sabrecroc.png'},
                    { name: 'Serrulule', value: './images/mob/serrulule.png'},
                    { name: 'Titan des Marées', value: './images/mob/titan.png'},
                    { name: 'Wyrm de Jade', value: './images/mob/wyrm.png'},
                )
        ),

    run: async function (args) {

        args.intera.reply({files: [args.intera.options.getString('monstre')]})
        .catch(err => utils.errorSendReply('compo', args))        
    }
}