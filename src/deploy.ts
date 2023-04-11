import { REST, RestOrArray, Routes, SlashCommandBuilder } from "discord.js";
import { readdirSync } from "fs";
import yesno from "yesno";
import { Config } from "../data/config.js";
import { DiscordValues } from "./core/constants/values";
import { bot } from "./main.js";

let commands = [];
let commandsFiles = readdirSync('./src/core/commands/')

for(const file of commandsFiles){
    const command = await import(`./core/commands/${file.slice(0, -3)}.js`);
    commands.push(command.CommandBuilder.toJSON())
}

const rest = new REST({version: '10'}).setToken(Config.CURRENT_TOKEN);

const todo = await yesno({
    question: "Voulez-vous deployer (y) ou supprimer (n) les commandes?",
})

//Deploy
if(todo) {

    try {
		console.log(`Recharge ${commands.length} /commandes`);

		const dataGuild = await rest.put(
			Routes.applicationGuildCommands(bot.user?.id as string, DiscordValues.MAIN_GUILD),
			{ body: commands },
		) as RestOrArray<SlashCommandBuilder>;

		console.log(`${dataGuild.length} commandes serveur rechargées avec succès`);


        const dataGlobal = await rest.put(
			Routes.applicationCommands(bot.user?.id as string),
			{ body: commands },
		) as RestOrArray<SlashCommandBuilder>;

		console.log(`${dataGlobal.length} commandes globales rechargées avec succès`);

    } 
    catch (e) {
        console.error("erreur de déploiement:\n" + e)
    }
}

//Delete
else {
    try {
        const promises:Promise<unknown>[] = [];

        rest.get(Routes.applicationGuildCommands(bot.user?.id as string, DiscordValues.MAIN_GUILD))
        .then(async data => {
            for (const command of data as any) {
                const deleteUrl = `/${Routes.applicationGuildCommands(bot.user?.id as string, DiscordValues.MAIN_GUILD)}/${command.id}`;
                promises.push(rest.delete(deleteUrl as `/${string}`));
            }
        });


        rest.get(Routes.applicationCommands(bot.user?.id as string))
        .then(async data => {
            for (const command of data as any) {
                const deleteUrl = `/${Routes.applicationCommands(bot.user?.id as string)}/${command.id}`;
                promises.push(rest.delete(deleteUrl as `/${string}`));
            }
        });
        await Promise.all(promises);
        console.log(`${promises.length} commandes supprimées avec succès`);
    }
    catch (e) {
        console.error("erreur de déploiement:\n" + e)
    }
}