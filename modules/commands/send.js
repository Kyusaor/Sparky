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

        let user = args.intera.options.getUser('user') || await args.bot.users.fetch(args.intera.options.getString('id'));
        if(!user) return args.intera.reply('User introuvable')
        
        let msgPayload = {};
        if(args.intera.options.getString('message')) msgPayload.content = args.intera.options.getString('message').toString()
        if(args.intera.options.getAttachment('fichier')) msgPayload.files = [args.intera.options.getAttachment('fichier')]

        try { await user.send(msgPayload) }
        catch { return args.intera.reply('Echec d\'envoi du message') }

        if(args.intera.options.getString('message')) msgPayload.content = 'Envoyé avec succès à ' + user.tag + " (" + user.id.toString() + "):\n" + args.intera.options.getString('message').toString()
        else msgPayload.content = 'Envoyé avec succès à ' + user.tag + " (" + user.id.toString() + "):"
        
        return args.intera.reply(msgPayload)
        .catch(err => utils.errorSendReply('send', args))        
        
    }
}