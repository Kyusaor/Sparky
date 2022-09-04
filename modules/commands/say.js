const { SlashCommandBuilder } = require("discord.js");
const { errorSendReply } = require("../utils");

module.exports = {

    name: 'say',
    description: 'Envoie un message dans le salon donné',
    isDev: true,

    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Envoie un message dans le salon donné')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(chan =>
            chan.setName('chan')
            .setDescription('le salon cible')
        )
        .addStringOption( id =>
            id.setName('id')
            .setDescription('l\'id du salon')
        )
        .addStringOption( msg =>
            msg.setName('msg')
            .setDescription('le contenu du message')
        )
        .addAttachmentOption(att =>
            att.setName('fichier')
            .setDescription('Le fichier à envoyer')
        ),

    run: async function(args) {

        let entries = args.intera.options;

        if(!entries.getChannel('chan') && !entries.getString('id')) return args.intera.reply('Merci de spécifier un salon cible');

        let chan = await entries.getChannel('chan') || await args.bot.channels.fetch(entries.getString('id'));
        if(!chan) return args.intera.reply('Channel introuvable')

        let payload = {};
        payload.content = await entries.getString('msg') || ""
        if(entries.getAttachment('fichier')) payload.files = [entries.getAttachment('fichier')];

        try { await chan.send(payload) }
        catch (error) { return args.intera.reply('Impossible d\'envoyer le message:\n' + error.toString()) }

        payload.content = "> Message envoyé sur le salon `" + chan.name + "` (" + chan.id + "), serveur `" + chan.guild.name + "` (" + chan.guild.id + "):\n" + payload.content;
        args.intera.reply(payload).catch(e => errorSendReply("say", args))
    }
}