const utils = require('../utils.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {

    name: "send",
    description: "Envoie un message dans le salon donné",
    isDev: true,

    data: new SlashCommandBuilder()
        .setName("send")
        .setDescription("Envoie un message dans le salon donné")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addUserOption(user =>
            user.setName('user')
            .setDescription('Le membre cible')
        )
        .addStringOption(id => 
            id.setName('id')
            .setDescription("L'id de l'user")
        )
        .addStringOption(msg =>
            msg.setName('message')
            .setDescription('Le contenu du message')
        )
        .addAttachmentOption(att =>
            att.setName('fichier')
            .setDescription('Le fichier à envoyer')
        ),

    run: async function (args) {

        let entries = args.intera.options;

        if(!entries.getUser('user') && !entries.getString('id')) return args.intera.reply('Merci de spécifier un user cible');

        let user = await entries.getUser('user') || await args.bot.users.fetch(entries.getString('id'));
        if(!user) return args.intera.reply('User introuvable')
        
        let msgPayload = {};
        msgPayload.content = await entries.getString('message') || ""
        if(entries.getAttachment('fichier')) msgPayload.files = [entries.getAttachment('fichier')]

        try { await user.send(msgPayload) }
        catch { return args.intera.reply('Echec d\'envoi du message') }

        if(entries.getString('message')) msgPayload.content = "Envoyé avec succès à " + user.tag + " (" + user.id.toString() + "):\n" + msgPayload.content;
        else msgPayload.content = 'Envoyé avec succès à ' + user.tag + " (" + user.id.toString() + "):"
        
        return args.intera.reply(msgPayload)
        .catch(err => utils.errorSendReply('send', args))        
        
    }
}