const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");

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

        //Classement des serveurs
        let servliste = [];
        for(serv of args.bot.guilds.cache){
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
            .setFooter({ text: "Page [1/" + Math.ceil(servliste.length / 25) + "]"})

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
                    .setEmoji('◀️'),

                new ButtonBuilder()
                    .setCustomId(args.intera.options.getString('type') + '-next')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('▶️')
            )
        
        
        //Enregistrement du classement
        let filelist = JSON.parse(fs.readFileSync('./data/sortedguilds.json'))
        filelist[args.intera.options.getString('type')] = servliste;
        fs.writeFileSync('./data/sortedguilds.json', JSON.stringify(filelist))
        await args.intera.reply({ embeds: [embed], components: [boutons]})
    },

    defile(args){

    }
}