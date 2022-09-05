const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const utils = require('../utils');

module.exports = {

    name: 'setglobalping',
    description: 'Redéfinis le message d\'envoi des infernaux',
    isDev: true,

    data: new SlashCommandBuilder()
        .setName('setglobalping')
        .setDescription('Redéfinis le message d\'envoi des infernaux')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async run (args) {

        if(args.intera.user.id !== args.kyu.id) return args.intera.reply("Vous n'avez pas la permission de réaliser cette commande");

        let embed = new EmbedBuilder()
            .setTitle("Mentions globales")
            .setDescription("Panneau d'envoi des mentions veilleur dragon globales. Pas d'erreurs pour ces mentions, merci de ne pas ping un event déjà mentionné")
            .setColor([253,90,24])
            .addFields([
                {name: "** **", value: "** **"},
                {name: "Ping Veilleur <:veilleur:607194832271573024>", value: "Notifie les évènements infernaux veilleur"},
                {name: "Ping dragon <:dragon:607194934759391242>", value: "Notifie les évènements infernaux dragon"},
                {name: "Evènement infernal: orbes rouges <:redorb:740688906755768470>", value: "Notifie un infernal orbes de talent lumineux"},
                {name: "Evènement infernal: orbes jaunes <:yellorb:740689133600768091>", value: "Notifie un infernal orbes de talent brillant"},
            ])

        let boutons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Veilleur')
                    .setEmoji('607194832271573024')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('Dragon')
                    .setEmoji('607194934759391242')
                    .setStyle(ButtonStyle.Secondary),
                    
                new ButtonBuilder()
                    .setCustomId('OR')
                    .setEmoji('740688906755768470')
                    .setStyle(ButtonStyle.Secondary),
                    
                new ButtonBuilder()
                    .setCustomId('OJ')
                    .setEmoji('740689133600768091')
                    .setStyle(ButtonStyle.Secondary),
            )
        
        let board = await args.intera.channel.send({embeds: [embed], components: [boutons]});
        args.intera.reply({content: 'Fait!', ephemeral: true})

        args.gpconfig.settings.msg_annonce = board.id;
        fs.writeFileSync('./data/guild_config.json', JSON.stringify(args.gpconfig))
    }
}