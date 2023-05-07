import consoleStamp from "console-stamp";
import { ActivityType, Client, EmbedBuilder, EmbedFooterData, TextChannel } from "discord.js";
import { createWriteStream, existsSync, mkdirSync, readFileSync } from "fs";
import { bot, chanList, Console } from "../main.js";
import { fetchedChannelsAtBoot, textLanguage } from "./constants/types.js";
import { DiscordValues } from "./constants/values.js";
import { Translations } from "./constants/translations.js";

export abstract class Utils {

    static async EmbedBaseBuilder(language: textLanguage):Promise<EmbedBuilder> {
        let translation = await Translations.displayText()[language];
        let rdmFooter:EmbedFooterData = translation.global.tipsFooter[Math.floor(Math.random() * translation.global.tipsFooter.length)]

        let embed = new EmbedBuilder()
            .setColor(DiscordValues.embedColor)
            .setFooter(rdmFooter)

        return embed;
    };

    static async fetchChannelsAtBoot(): Promise<fetchedChannelsAtBoot> {
        let list: any = {};

        let i = 0;
        for (let chanName in DiscordValues.channels) {

            let id = DiscordValues.channels[chanName as keyof typeof DiscordValues.channels];
            let chan = await bot.channels.cache.get(id) as TextChannel;
            list[chanName] = chan;
            if (chan === undefined)
                Console.error(`Echec de récupération du salon ${chanName}`);

            i++;
        }

        return list;

    };

    static getLanguageTexts(language: textLanguage) {
        let text = JSON.parse(readFileSync(`./dist/core/constants/text/${language}.json`, 'utf-8'));
        if(!text)
            throw `Impossible de récupérer le fichier langue: ${language}`
        return text;
    };

    static format2DigitsNumber(num: number): string {
        return num.toString().padStart(2, '0');
    };

    static statusLoop(bot: Client): void {
        let serversCount = bot.guilds.cache.size;
        try {
            bot.user?.setActivity(`${serversCount} serveurs`, { type: ActivityType.Watching })
        } catch (err) {
            Console.error(err);
        }

        setTimeout(() => {
            try {
                bot.user?.setPresence({ activities: [{ name: "Perdu? Faites /aide !", type: ActivityType.Watching }] })
            } catch (err) {
                Console.error(err);
            }
        }, 10000)

        setTimeout(() => {
            this.statusLoop(bot)
        }, 20000);
    };

}


export class ConsoleLogger {
    logger: Console;

    constructor() {

        let formatDate = {
            day: Utils.format2DigitsNumber(new Date().getDate()),
            month: Utils.format2DigitsNumber(new Date().getMonth() + 1),
            year: Utils.format2DigitsNumber(new Date().getFullYear())
        };

        //Check if directory exists and create it if not
        let dir = `./logs/${formatDate.month}-${formatDate.year}`
        if (!existsSync(dir)) {
            mkdirSync(dir)
        }

        //Log into file
        let logDir = dir + `/logs-${formatDate.day}-${formatDate.month}-${formatDate.year}.log`
        const output = createWriteStream(logDir, { flags: 'a' }) as any;
        const errorOutput = createWriteStream(logDir, { flags: 'a' }) as any;
        this.logger = new console.Console(output, errorOutput);

        consoleStamp(this.logger, {
            format: ":date(dd/mm/yyyy - HH:MM:ss)",
            stderr: errorOutput,
            stdout: output
        });
        consoleStamp(console, {
            format: ":date(dd/mm/yyyy - HH:MM:ss)",
        });

        this.logger.info("Console paramétrée avec succès")
    };


    logDb(input: any) {
        console.log(`[DATA] ${input}`);
        this.logger.log(`[DATA] ${input}`);
    };

    error(input: any, crash?: boolean) {
        console.error(`[ERROR] ${input}`);
        console.trace()
        this.logger.error(`[ERROR] ${input}`);
        this.logger.trace();
        chanList.LOGS_ERRORS?.send(input.stack || input)
            .then(() => {
                if (crash)
                    process.exit(1);
            })
    };

    info(input: any) {
        console.log(`[INFO] ${input}`);
        this.logger.log(`[INFO] ${input}`);
    };

    log(input: any) {
        console.log(`[LOGS] ${input}`);
        this.logger.log(`[LOGS] ${input}`);
    };
}