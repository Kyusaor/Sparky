const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const utils = require("../utils");

module.exports = {

    name: 'getserverinfo',
    description: 'Donne les infos d\'un serveur à partir de son id',
    isDev: true,

    data: new SlashCommandBuilder()
        .setName('getserverinfo')
        .setDescription('Donne les infos d\'un serveur à partir de son id')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addStringOption(str =>
            str.setName('id')
            .setDescription('L\'id du serveur')
            .setRequired(true)
        ),

    async run(args) {

        let id = args.intera.options.getString('id');
        let serv = await args.bot.guilds.fetch(id);
        if(!serv) return args.intera.reply('Serveur introuvable');

        let owner = await args.bot.users.fetch(serv.ownerId);
        if(!owner) {owner = { id: 'Introuvable', tag: 'Introuvable'}}

        let embed = new EmbedBuilder()
            .setTitle("__**" + serv.name + "**__")
            .setDescription(serv.description)
            .setColor([59, 229, 53])
            .setThumbnail(serv.iconURL())
            .addFields([
                { name: "__id__:", value: serv.id.toString() },
                { name: "__Propriétaire__:", value: owner.tag + " (" + owner.id + ")" },
                { name: "__Nombre de membres__:", value: serv.memberCount.toString() },
                { name: "__Création__:", value: utils.stringifyDate(serv.createdAt) },
                { name: "__Rejoint le__:", value: utils.stringifyDate(serv.joinedAt) },
            ])

        await args.intera.reply({embeds: [embed]})
    }
}