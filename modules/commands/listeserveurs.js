const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const { interaReply, errorSendReply } = require("../utils");

module.exports = {

    name: 'listeserveurs',
    description: 'Envoie la liste des serveurs où le bot est présent',
    isDev: true,

    data: new SlashCommandBuilder()
        .setName('listeserveurs')
        .setDescription('Envoie la liste des serveurs où le bot est présent')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addStringOption(str => 
            str.setName('type')
                .setDescription('La façon de classer les serveurs')
                .setRequired(true)
                .addChoices(
                    {name: 'Membres', value: 'members' },
                    {name: 'Nom', value: 'name' },
                    {name: 'Aucune', value: 'none' },
                )
        ),

    run: async function (args) {

        args.intera.deferReply()

        //Classement des serveurs
        let membres = 0, servliste = [];
        for(serv of args.bot.guilds.cache){
            membres += serv[1].memberCount
            servliste.push({id: serv[0], name: serv[1].name, owner: serv[1].ownerId, membersCount: serv[1].memberCount})
        }
        
        let filtre;
        switch(args.intera.options.getString('type')) {

            case 'members':
                servliste.sort((a, b) => b.membersCount - a.membersCount);
                filtre = "membres";
                break;

            case 'name':
                servliste.sort((a, b) => a.name - b.name)
                filtre = "nom"
                break;

            default:
                filtre = "aucun"
                break;
        }

        //Création de l'embed
        let embed = new EmbedBuilder()
            .setTitle("__**Liste des serveurs du bot**__")
            .setDescription("*filtre: " + filtre + "*")
            .setColor([59, 229, 53])
            .setFooter({ text: "Page [1/" + Math.ceil(servliste.length / 25) + "] | " + membres + " utilisateurs théoriques"})

        for(let i = 0; i < 25 && servliste[i]; i++) {
            let owner = await args.bot.users.fetch(servliste[i].owner);
            if(!owner?.id || !owner?.tag) owner = { tag: "Introuvable", id: "Indisponible" }
            embed.addFields({ name: (i + 1) + ". **" + servliste[i].name + "**", value: "__id__: " + servliste[i].id + "\n__Owner__: " + owner.tag + " (" + owner.id + ")\n__Membres__: " + servliste[i].membersCount })
        }

        //Création des boutons
        let boutons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(args.intera.options.getString('type') + '-previous')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('◀️')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId(args.intera.options.getString('type') + '-next')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('▶️')
            )
        
        
        //Enregistrement du classement
        let filelist = JSON.parse(fs.readFileSync('./data/sortedguilds.json'))
        filelist[args.intera.options.getString('type')] = servliste;
        fs.writeFileSync('./data/sortedguilds.json', JSON.stringify(filelist))
        await interaReply({ embeds: [embed], components: [boutons]}, args.intera)
    },

    async defile(intera, bot){

        //Récupération de la liste de serveurs triée
        let type, nextpage, filtre;
        if(intera.customId.startsWith('members')) {type = "members"; filtre = "membres"}
        else if(intera.customId.startsWith('name')) {type = "name"; filtre = "noms"}
        else {type = "none"; filtre = "aucun"}

        let listefile = JSON.parse(fs.readFileSync('./data/sortedguilds.json'));
        let liste = listefile[type];

        let page = Number(intera.message.embeds[0].footer.text[6])
        if(intera.customId.endsWith('next')) nextpage = page + 1
        else nextpage = page - 1
        
        //Création de l'embed
        let embed = new EmbedBuilder()
            .setTitle("__**Liste des serveurs du bot**__")
            .setDescription("*filtre: " + filtre + "*")
            .setColor([59, 229, 53])
            .setFooter({ text: "Page [" + nextpage + "/" + Math.ceil(liste.length / 25) + "]"})

        for(let i = 25 * (nextpage - 1); i < (25 * nextpage) && liste[i]; i++) {
            let owner = await bot.users.fetch(liste[i].owner);
            if(!owner?.id || !owner?.tag) owner = { tag: "Introuvable", id: "Indisponible" }
            embed.addFields({ name: (i + 1) + ". **" + liste[i].name + "**", value: "__id__: " + liste[i].id + "\n__Owner__: " + owner.tag + " (" + owner.id + ")\n__Membres__: " + liste[i].membersCount })
        }

        //Création des boutons
        let boutons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(type + '-previous')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('◀️'),

                new ButtonBuilder()
                    .setCustomId(type + '-next')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('▶️')
            )

        if(nextpage == 1) boutons.components[0].setDisabled(true)
        else if (nextpage == Math.ceil(liste.length / 25)) boutons.components[1].setDisabled(true)

        await intera.editReply({ embeds: [embed], components: [boutons]}).catch(console.error)
    }
}