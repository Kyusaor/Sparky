import consoleStamp from "console-stamp";
import { ActivityType, Client, EmbedBuilder, EmbedFooterData, TextChannel } from "discord.js";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { bot, chanList, Console, dev, TranslationsCache } from "../main.js";
import { fetchedChannelsAtBoot, textLanguage } from "./constants/types.js";
import { DiscordValues } from "./constants/values.js";
import { Translations } from "./constants/translations.js";

export abstract class Utils {

    static daySince(date: Date | number) {
        if(date instanceof Date)
            date = date.getTime();
        let mtn = Date.now();
        let ecart = Math.floor((mtn - date) / 86400000);
        return ecart    
    }

    static displayBotLink():string {
        return `https://discord.com/api/oauth2/authorize?client_id=${bot.user?.id}&permissions=${DiscordValues.BOT_PERMISSIONS_BITFIELD}&scope=bot%20applications.commands`
    }

    static EmbedBaseBuilder(language: textLanguage):EmbedBuilder {
        let translation = TranslationsCache[language];
        let rdmNumber = Math.floor(Math.random() * translation.global.tipsFooter.length)
        let rdmFooter:EmbedFooterData = translation.global.tipsFooter[rdmNumber];
        if(rdmNumber == 1)
            rdmFooter = {
                text: Translations.displayText(rdmFooter.text, { dev_username: dev.username }),
                iconURL: Translations.displayText(rdmFooter.iconURL!, { dev_avatar_url: dev.displayAvatarURL() })
            }

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

    static format2DigitsNumber(num: number): string {
        return num.toString().padStart(2, '0');
    };

    static format3DigitsSeparation(num: number):string {
        let str = num.toString();
        let i = Math.floor(str.length / 3);
        let j = str.length % 3;
        let out = str.slice(0, j);
        str = str.slice(j)

        for(let k = 0; k <= i; k++) {
            out += " " + str.slice(0, 3)
            str = str.slice(3)
        }
        
        return out    
    }

    static statusLoop(bot: Client): void {
        let serversCount = bot.guilds.cache.size;
        try {
            bot.user?.setActivity(`${serversCount} servers`, { type: ActivityType.Watching })
        } catch (err) {
            Console.error(err);
        }

        setTimeout(() => {
            try {
                bot.user?.setPresence({ activities: [{ name: "Type @sparky for help", type: ActivityType.Custom }] })
            } catch (err) {
                Console.error(err);
            }
        }, 10000)

        setTimeout(() => {
            this.statusLoop(bot)
        }, 20000);
    };

    static stringifyDuration(durationInSeconds: number, language: textLanguage):string {
        let times = TranslationsCache[language].global.timeNames;

        let days = Math.floor(durationInSeconds / 1440);
        let hours = Math.floor((durationInSeconds - days * 1440) / 60);
        let minutes = durationInSeconds % 60;

        let string = `${Math.floor(minutes)} ${times.minute}`
        if(hours > 0) string = `${hours} ${times.hour}, ${string}`;
        if(days > 0) string = `${days} ${times.day}, ${string}`;
        
        return string    
    }

    static stringifyDate(date:number | Date, language: textLanguage):string {
        if(typeof date !== 'number')
            date = new Date(date).getTime();

        let daysSince = this.daySince(date).toString();
    
        return Translations.displayText(TranslationsCache[language].global.stringifyDate, { timestamp: Math.floor(date/1000), daysSince })
    }

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
        console.trace(`[ERROR] ${input.stack || input}`)
        this.logger.trace(`[ERROR] ${input.stack || input}`);
        chanList?.LOGS_ERRORS?.send(input.stack || input)
            .then(() => {
                if (crash)
                    process.exit(1);
            })
            .catch(() => {
                if (crash)
                    process.exit(1);
            })
    };

    info(input: any) {
        console.log(`[INFO] ${input}`);
        this.logger.log(`[INFO] ${input}`);
        chanList?.LOGS_ERRORS?.send(`[INFO] ${input}`)
    };

    log(input: any) {
        console.log(`[LOGS] ${input}`);
        this.logger.log(`[LOGS] ${input}`);
    };
}