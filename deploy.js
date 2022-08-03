const { SlashCommandBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { kyu } = require('./data/config.js');
const { token } = require('./data/private.js');
const fs = require('fs');
const rest = new REST({ version: '10' }).setToken(token);

/*
//Suppression des / commandes globales
rest.get(Routes.applicationCommands('746783550866456716'))
    .then(data => {
        const promises = [];
        for (const command of data) {
            const deleteUrl = `${Routes.applicationCommands('746783550866456716')}/${command.id}`;
            promises.push(rest.delete(deleteUrl));
        }
        return Promise.all(promises);
    }
);

//Suppression des / commandes dev
rest.get(Routes.applicationGuildCommands('746783550866456716', '632957557375500299'))
    .then(data => {
        const promises = [];
        for (const command of data) {
            const deleteUrl = `${Routes.applicationGuildCommands('746783550866456716', '632957557375500299')}/${command.id}`;
            promises.push(rest.delete(deleteUrl));
        }
        return Promise.all(promises);
    }
);
*/

//listage des commmandes
let commands = []
let devCommands = []

const commandFiles = fs.readdirSync('./modules/commands').filter(file => file.endsWith('.js'));

for(file of commandFiles) {
    const commandData = require(`./modules/commands/${file}`);
    if(commandData.isDev) devCommands.push(commandData.data)
    else commands.push(commandData.data)
}

commands.map(commands => commands.toJSON());
devCommands.map(command => command.toJSON());

//Déploiement des / commandes
rest.put(Routes.applicationCommands('746783550866456716'), { body: commands })
    .then(() => console.log("Commandes déployées avec succès"))
    .catch(console.error)

rest.put(Routes.applicationGuildCommands('746783550866456716', '632957557375500299'), { body: devCommands })
    .then(() => console.log("Commandes dev déployées avec succès"))
    .catch(console.error)