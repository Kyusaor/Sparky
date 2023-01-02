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
    }
}