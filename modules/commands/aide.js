const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const utils = require('../utils');

module.exports = {

    name: 'aide',
    description: 'Envoie la liste des commandes du bot',

    data: new SlashCommandBuilder()
        .setName('aide')
        .setDescription('Envoie la liste des commandes du bot'),

    run: async function(args) {

        if(args.intera.channel.type == ChannelType.DM) return args.intera.reply("Les commandes ne fonctionnent pas en messages privés, il faut les effectuer sur un serveur.\nVous pouvez m'ajouter à votre serveur grâce à la commande **/lien** qui est la seule à fonctionner en messages privés !").catch(e => e);

        //Selection thumbnail en fx des perms
        let thumb = ""
        if(args.intera.user.id == args.kyu.id) thumb = "https://cdn.discordapp.com/attachments/659758501865717790/680168774468763671/PicsArt_02-20-10.39.20.png"
        else if (args.intera.member.permissions.has(PermissionFlagsBits.Administrator)) thumb = "https://cdn.discordapp.com/attachments/659758501865717790/680168774468763671/PicsArt_02-20-10.39.20.png"
        else thumb = "https://media.discordapp.net/attachments/659758501865717790/680102643519193089/help_sparky.png"


        //Création de l'embed
        let embed = new EmbedBuilder()
            .setTitle('Aide')
            .setDescription('Voici les commandes auxquelles tu as accès ' + args.intera.user.username + ' ! ')
            .setColor([59, 229, 53])
            .setFooter({ text: "Développé par " + args.kyu.tag, iconURL: args.kyu.displayAvatarURL()})
            .setThumbnail(thumb)
            .addFields([
                { name: '__**Commandes générales**__', value: '** **' },
            ])

        //Ajout des commandes
        const commandFiles = fs.readdirSync('./modules/commands').filter(file => file.endsWith('.js'));
        let membercommands = [], adminCommands = [], devcommands = []

        for(file of commandFiles) {
            const commandData = require(`./${file}`);
            if(commandData.isDev) devcommands.push({name: "**/" + commandData.name + "**", value: commandData.description})
            else if(commandData.admin) adminCommands.push({name: "**/" + commandData.name + "**", value: commandData.description})
            else membercommands.push({name: "**/" + commandData.name + "**", value: commandData.description})
        }

        embed.addFields(membercommands);

        if(args.intera.member.permissions.has(PermissionFlagsBits.ManageChannels) || args.intera.user.id == args.kyu.id) {
            embed.addFields([{name: "** **", value: "** **"}, {name: '__**Commandes administrateur**__', value: "** **"}])
            embed.addFields(adminCommands);
        }

        if(args.intera.user.id == args.kyu.id) {
            embed.addFields([{name: "** **", value: "** **"}, {name: '__**Commandes Dev**__', value: "** **"}])
            embed.addFields(devcommands);
        }

        await args.intera.reply({embeds: [embed]})
    }
}