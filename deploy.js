const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { kyu } = require('./data/config.js');
const { token } = require('./data/private.js');
const fs = require('fs');



//listage des commmandes

let commands = []
const commandFiles = fs.readdirSync('./modules/commands').filter(file => file.endsWith('.js'));


for(file of commandFiles) {
    const commandData = require(`./modules/commands/${file}`);
    commands.push(commandData.data)
}

commands.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationCommands('746783550866456716'), { body: commands })
    .then(() => console.log("Commandes déployées avec succès"))
    .catch(console.error)