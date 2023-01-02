const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const utils = require("../utils");

module.exports = {

    name: 'calcul',
    description: 'Calculateurs divers',
    level: 1,

    data: new SlashCommandBuilder()
        .setName('calcul')
        .setDescription('Calculateurs divers')
        .setDMPermission(false)
        .addSubcommand(sub => sub
            .setName('batiments')
            .setDescription('Calcule les gemmes et ressources qu\'il vous manque pour améliorer vos batiments payants')
            .addStringOption(str =>
                str.setName('batiment')
                .setDescription('Le batiment à calculer')
                .setRequired(true)
                .addChoices(
                    {name: "Hall de bataille", value: "hall"},
                    {name: "Prison", value: "prison"},
                    {name: "Autel", value: "autel"},
                    {name: "Salle au trésor", value: "salle"},
                )
            )
            .addIntegerOption( int => int
                .setName('niveau')
                .setDescription('Le niveau actuel de votre batiment')
                .setMinValue(0)
                .setMaxValue(25)
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('speedup')
            .setDescription('Calcule votre total d\'accelérateurs dans votre sac (indisponible)')
        )
        .addSubcommand(sub => sub
            .setName('troupes')
            .setDescription('Calcule le coût en ressources et temps pour former des troupes')
            .addIntegerOption(opt => opt
                .setName('vitesse')
                .setDescription('Votre % de vitesse entraînement')
                .setMinValue(0)
                .setMaxValue(800)
                .setRequired(true)
            )
            .addIntegerOption(opt => opt
                .setName('capacité')
                .setDescription('La capacité de formation de vos casernes')
                .setRequired(true)
            )
            .addIntegerOption(opt => opt
                .setName('subventions')
                .setDescription('Le niveau de la recherche subventions')
                .setMinValue(0)
                .setMaxValue(10)
                .setRequired(true)
            )
            .addIntegerOption(opt => opt
                .setName('quantité')
                .setDescription('La quantité totale de troupes que vous voulez former')
                .setRequired(true)
            )
            .addStringOption(opt => opt
                .setName('type')
                .setDescription('Le type de troupes à former')
                .addChoices(
                    {name: 'Infanterie', value: 'inf'},
                    {name: 'Archers', value: 'snip'},
                    {name: 'Cavalerie', value: 'cav'},
                    {name: 'Engins de siège', value: 'engin'},
                )
                .setRequired(true)
            )
            .addStringOption(opt => opt
                .setName('tier')
                .setDescription('Le tier des troupes à former')
                .addChoices(
                    {name: 'T1', value: '1'},
                    {name: 'T2', value: '2'},
                    {name: 'T3', value: '3'},
                    {name: 'T4', value: '4'},
                )
                .setRequired(true)
            )
        ),
        

    async run (args) {

        let sub = args.intera.options.getSubcommand()
        let opt = args.intera.options

        if(sub == "batiments") {
            let lvl = opt.getInteger('niveau');
            let rss = utils.batiments[opt.getString('batiment')];
            let lvlImg;

            if(opt.getString('batiment') == 'salle') {
                if(lvl < 3) lvlImg = rss.images[0]
                else if(lvl < 6) lvlImg = rss.images[1]
                else if(lvl < 9) lvlImg = rss.images[2]
                else lvlImg = rss.images[3]
            }
            else {
                if(lvl < 9) lvlImg = rss.images[0]
                else if(lvl < 17) lvlImg = rss.images[1]
                else if(lvl < 25) lvlImg = rss.images[2]
                else lvlImg = rss.images[3]
            }

            let embed = new EmbedBuilder()
                .setTitle('Calculateur de batiment')
                .setThumbnail(lvlImg)
                .setDescription("*Voici les ressources qu'il vous manque pour maxer votre " + rss.name.batiment + " du __niveau " + lvl + " au niveau " + rss.ressources.ble.length + "__. Le compte des gemmes prend en compte le coût du marteau d'or pour le niveau 25*")
                .setFooter({ text: "Développé par " + args.kyu.tag, iconURL: args.kyu.displayAvatarURL()})

            
                
            let missingRss = {}
            
            if(lvl == 25 || (lvl >= 9 && opt.getString('batiment') == 'salle')) {
                missingRss = {
                    ble: "Rien",
                    pierre: "Que dalle",
                    bois: "Nada",
                    minerai: "Nothing",
                    items: "Peanuts",
                    gems: "Je crois que tu as compris l'idée à ce stade..."
                }
            }
            else {
                for(i in rss.ressources) missingRss[i] = utils.formatNumberPerHundreds(rss.ressources[i].slice(lvl).reduce((somme, num) => somme + num)).toString();
                missingRss.gems = "En fonction de par combien vous achetez les " + rss.name.item + ":"
                for(i in rss.itemCost) missingRss.gems += "\n Par " + i + ": " + utils.formatNumberPerHundreds(parseInt(missingRss.items.replace(/\s+/g, '')) / i * rss.itemCost[i] + 2000)
            }

            embed.addFields([
                {name: "Blé:", value: missingRss.ble, inline: true},
                {name: "Pierre:", value: missingRss.pierre, inline: true},
                {name: "Bois:", value: missingRss.bois, inline: true},
                {name: "Minerai:", value: missingRss.minerai, inline: true},
                {name: rss.name.item + ":", value: missingRss.items, inline: true},
                {name: "Équivalent en gemmes:", value: missingRss.gems, inline: true},
            ])

            args.intera.reply({embeds: [embed]})
        }

        else if (sub == "speedup") {
            await args.intera.reply('La commande speedup est malheureusement rendue indisponible à cause de la mise à jour discord, le temps qu\'une alternative simple à utiliser soit trouvée.')
            .catch(e => utils.errorSendReply('speedup', args))
        }

        else if (sub == "troupes") {
            let tier = args.intera.options.getString('tier');
            let type = args.intera.options.getString('type');
            let qte = args.intera.options.getInteger('quantité');
            let stat = args.intera.options.getInteger('vitesse');
            let sub = args.intera.options.getInteger('subventions');
            let capa = args.intera.options.getInteger('capacité');
            let troop = utils.troupes;


            let rssCost = function(rss, type, tier) {
                if((type == "inf" && rss == "pierre") || (type == "snip" && rss == "minerai") || (type == "cav" && rss == "bois")) return "0";
                if(rss == "or") return utils.troupes[tier].gold
                else return utils.troupes[tier].rss
            }

            let embed = new EmbedBuilder()
                .setTitle("Calculateur de troupes")
                .setDescription("*Voici le coût en ressources pour former vos troupes !\nNote: le coût en gemmes diminuant au fur et à mesure que le nombre de troupes augmente, il n'est pas affiché dans ce calculateur*")
                .setThumbnail('https://media.discordapp.net/attachments/659758501865717790/1059497225711005696/latest.png')
                .addFields([
                    {name: "__Vitesse d'entraînement:__ ", value: stat + "%", inline: true},
                    {name: "__Réduction du coût:__ ", value: troop.subv[tier][sub] + "%", inline: true},
                    {name: "__Nombre de troupe à former:__ ", value: utils.formatNumberPerHundreds(qte) + " " + troop.type[type] + " t" + tier, inline: true},
                    {name: "__Nombre de fournées nécessaires:__ ", value: Math.ceil(qte / capa).toString(), inline: true},
                    {name: "__Coût en blé:__ ", value: utils.formatNumberPerHundreds(rssCost("blé", type, tier) * qte * (100 - troop.subv[tier][sub]) / 100).toString(), inline: true},
                    {name: "__Coût en pierre:__ ", value: utils.formatNumberPerHundreds(rssCost("pierre", type, tier) * qte * (100 - troop.subv[tier][sub]) / 100).toString(), inline: true},
                    {name: "__Coût en bois:__ ", value: utils.formatNumberPerHundreds(rssCost("bois", type, tier) * qte * (100 - troop.subv[tier][sub]) / 100).toString(), inline: true},
                    {name: "__Coût en minerai:__ ", value: utils.formatNumberPerHundreds(rssCost("minerai", type, tier) * qte * (100 - troop.subv[tier][sub]) / 100).toString(), inline: true},
                    {name: "__Coût en or:__ ", value: utils.formatNumberPerHundreds(rssCost("or", type, tier) * qte * (100 - troop.subv[tier][sub]) / 100).toString(), inline: true},
                    {name: "__Durée nécessaire:__ ", value: utils.stringifyDuration(troop[tier].time * qte / 60 / ((stat + 100) / 100)), inline: true},

                ])
                .setFooter({ text: "Développé par " + args.kyu.tag, iconURL: args.kyu.displayAvatarURL()})

            args.intera.reply({embeds: [embed]})
            }
    }
}