const fs = require('fs');
const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const utils = require('../utils.js');
const config = require('../../data/config.js');

module.exports = {

    name: 'stopveilleur',
    description: 'Supprime les salons de signalement des challenges et évènements infernaux',
    admin: true,

    data: new SlashCommandBuilder()
        .setName('stopveilleur')
        .setDescription('Supprime les salons de signalement des challenges et évènements infernaux')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    run: async function(args) {

        let intera = args.intera;

        //Check perm du membre
        if(intera.user.id !== args.kyu.id && !intera.memberPermissions.has([PermissionFlagsBits.ManageChannels])) return utils.interaReply("Vous devez avoir la permission de gérer les salons pour exécuter cette commande !", intera);

        //Check perm du bot
        let botmember = await intera.guild.members.fetch(args.bot);
        let missingPermsString = "Je ne peux pas définir le panneau de notifications sans les permissions nécessaires. Il me manque ces permissions:\n";
        if(!botmember.permissions.has([PermissionFlagsBits.ManageRoles])) missingPermsString += "-`Gérer les rôles`\n";
        if(!botmember.permissions.has([PermissionFlagsBits.ManageChannels])) missingPermsString += "-`Gérer les salons`\n";
        if(!botmember.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles])) return utils.interaReply(missingPermsString, intera);

        let gpconfig = args.gpconfig[intera.guildId];
        if(!gpconfig || !gpconfig.ping) return utils.interaReply('Le signalement des évènements infernaux n\'est pas paramétré sur ce serveur. Faites `/veilleur` pour le définir', intera);

        //Envoi du message de confirmation
        let boutons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('oui')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Secondary),
            
                new ButtonBuilder()
                    .setCustomId('non')
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Secondary)
            )

        await utils.interaReply({content: 'Voulez-vous supprimer les salons <#' + gpconfig.chan_board + "> et <#" + gpconfig.chan_notifs + ">?\n\n:warning: **Cette action est irréversible!**", components: [boutons]}, intera);

        //Récupération de la réaction
        let coll;
        try {
            const filter = (i) => i.user.id == intera.user.id && ['oui', 'non'].includes(i.customId)
            coll = await intera.channel.awaitMessageComponent({ filter, time: 30000, componentType: ComponentType.Button}) 
        }
        catch { return utils.interaReply({content: "Commande annulée", components: []}, intera)}
        if(coll.customId == 'non') return utils.interaReply({content: "Commande annulée", components: []}, intera)

        //Supression des rôles et salons
        await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.CDR);
        await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.CDT);
        await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.ID);
        await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.IVR);
        await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.IV);
        await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.IDR);
        await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.OJ);
        await utils.deleteRole(args.bot, intera.guild.id, gpconfig.roles?.OR);
        await utils.deleteChan(args.bot, intera.guild.id, gpconfig.chan_notifs);
        await utils.deleteChan(args.bot, intera.guild.id, gpconfig.chan_board);

        gpconfig = {
            ping: false
        };

        args.gpconfig[intera.guildId] = gpconfig;
        fs.writeFileSync('./data/globalPing.json', JSON.stringify(args.gpconfig));

        await utils.interaReply({content: 'Les salons de signalements d\'évènements infernaux ont été supprimés!\nPour les redéfinir, faites `/veilleur`', components: []}, intera).catch(e => e);

        //Envoi d'une backup
        let logdb = await args.bot.channels.fetch(config.logs_db);
        if(!logdb) return console.log(utils.displayConsoleHour + " Chan log db introuvable");

        let owner = await args.bot.users.fetch(intera.guild.ownerId)

        logdb.send({
            content: "Stop guilde " + intera.guild.name + "\nid: " + intera.guild.id + "\nOwner: " + owner.username + " (id: " + owner.id + ")",
            files:[
                {
                    attachment:'./data/globalPing.json',
                    name:'globalPing.json',
                },
                {
                    attachment:'./data/guild_config.json',
                    name:'guild_config.json'
                }
        ]})
        .catch(error => console.log(utils.displayConsoleHour(new Date()) + "Impossible d'envoyer les logs db"))
    }
}