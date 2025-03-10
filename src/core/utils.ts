import consoleStamp from 'console-stamp';
import {
    ActivityType,
    ApplicationEmoji,
    Client,
    EmbedBuilder,
    EmbedFooterData,
    Locale,
    PermissionsBitField,
    TextChannel
} from 'discord.js';
import {createWriteStream, existsSync, mkdirSync} from 'fs';
import {bot, botCommands, chanList, Console, dev, emoteListCache, TranslationsCache} from '../main.js';
import {fetchedChannelsAtBoot, interestLevel, textLanguage} from './constants/types.js';
import {DiscordValues} from './constants/values.js';
import {Translations} from './constants/translations.js';

export abstract class Utils {

    static capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    static daySince(date: Date | number) {
        if (date instanceof Date)
            date = date.getTime();
        let mtn = Date.now();
        return Math.floor((mtn - date) / 86400000)
    }

    static displayBotLink(): string {
        return `https://discord.com/api/oauth2/authorize?client_id=${bot.user?.id}&permissions=${Utils.getBotPermissionsBigint()}&scope=bot%20applications.commands`
    }

    static displayEmoteInChat(emote: string) {
        let emoji = this.displayEmoji(emote);
        return emoji ? `<:${emoji.name}:${emoji.id}>` : `:${emote}:`
    }

    static displayEmoji(emote: string) {
        if(!emoteListCache.includes(emote)) {
            Console.info(`L'emote ${emote} n'existe pas dans le bot`)
            return DiscordValues.emoteNotFound as ApplicationEmoji;
        }
        return bot.application!.emojis.cache.find(e => e.name == emote) || DiscordValues.emoteNotFound as ApplicationEmoji;
    }

    static displayInterestLevel(interest: interestLevel) {
        let star = `⭐`;
        let noStar = this.displayEmoteInChat('blackStar');

        let str = star;
        for (let i = 0; i < 3; i++) {
            i < interest ?
                str += star :
                str += noStar
        }

        return str
    }

    static EmbedBaseBuilder(language: textLanguage): EmbedBuilder {
        let translation = TranslationsCache[language];
        let rdmNumber = Math.floor(Math.random() * translation.global.tipsFooter.length)
        let rdmFooter: EmbedFooterData = translation.global.tipsFooter[rdmNumber];
        if (rdmNumber == 1)
            rdmFooter = {
                text: Translations.displayText(rdmFooter.text, { dev_username: dev.username }),
                iconURL: Translations.displayText(rdmFooter.iconURL!, { dev_avatar_url: dev.displayAvatarURL() })
            }

        return new EmbedBuilder()
            .setColor(DiscordValues.embedDefaultColor)
            .setFooter(rdmFooter);
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

    static format3DigitsSeparation(num: number): string {
        let str = num.toString();
        let i = Math.floor(str.length / 3);
        let j = str.length % 3;
        let out = str.slice(0, j);
        str = str.slice(j)

        for (let k = 0; k <= i; k++) {
            out += " " + str.slice(0, 3)
            str = str.slice(3)
        }

        return out
    }

    static getBotPermissionsBigint(): bigint {
        let perms: bigint[] = []
        for (let cmd of botCommands) {
            cmd.neededPermissions?.forEach(p => {
                if (!perms.includes(p))
                    perms.push(p)
            })
        }
        return new PermissionsBitField(perms).bitfield;
    }

    static getCommandNameFromButtonOrMenu(id: string) {
        return id.split("-")[0];
    }

    static getLanguageFromLocale(locale: Locale): textLanguage {
        let language: any = locale
        if (language == 'en-US' || language == 'en-GB')
            language = 'en'
        if (!Object.keys(TranslationsCache).includes(language))
            language = 'en';
        return language
    }

    static async statusLoop(bot: Client): Promise<void> {
        let serversCount = bot.guilds.cache.size;
        try {
            await bot.user?.setActivity(`${serversCount} servers`, { type: ActivityType.Watching })
        } catch (err) {
            Console.error(err);
        }

        setTimeout(async () => {
            try {
                await bot.user?.setPresence({ activities: [{ name: "Type @sparky for help", type: ActivityType.Custom }] })
            } catch (err) {
                Console.error(err);
            }
        }, 10000)

        setTimeout(() => {
            this.statusLoop(bot)
        }, 20000);
    };

    static stringifyDuration(durationInSeconds: number, language: textLanguage): string {
        let times = TranslationsCache[language].global.timeNames;

        let days = Math.floor(durationInSeconds / 1440);
        let hours = Math.floor((durationInSeconds - days * 1440) / 60);
        let minutes = durationInSeconds % 60;

        let string = `${Math.floor(minutes)} ${times.minute}`
        if (hours > 0) string = `${hours} ${times.hour}, ${string}`;
        if (days > 0) string = `${days} ${times.day}, ${string}`;

        return string
    }

    static stringifyDate(date: number | Date, language: textLanguage): string {
        if (typeof date !== 'number')
            date = new Date(date).getTime();

        let daysSince = this.daySince(date).toString();

        return Translations.displayText(TranslationsCache[language].global.stringifyDate, { timestamp: Math.floor(date / 1000), daysSince })
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
        let dir = `./logs/${formatDate.year}-${formatDate.month}`
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


    logDb(input: any, path?: string) {
        console.log(`[DATA] ${input}`);
        this.logger.log(`[DATA] ${input}`);

        let payload;
        path ?
            payload = { content: input.stack || input, files: [path] } :
            payload = input.stack || input;
        chanList.LOGS_DB?.send(payload)
            .catch(e => Console.error(e))
    };

    error(input: any, crash?: boolean) {
        console.trace(`[ERROR] ${input.stack || input}`)
        this.logger.trace(`[ERROR] ${input.stack || input}`);

        chanList?.LOGS_ERRORS?.send(input.stack || input)
            .then(() => {
                if (crash)
                    process.exit(1)
            })
            .catch(e => {
                console.error(e)
                if (crash)
                    process.exit(1)
            })
    };

    info(input: any) {
        console.log(`[INFO] ${input}`);
        this.logger.log(`[INFO] ${input}`);

        chanList?.LOGS_ERRORS?.send(`[INFO] ${input}`)
            .catch(e => Console.error(e))
    };

    log(input: any) {
        console.log(`[LOGS] ${input}`);
        this.logger.log(`[LOGS] ${input}`);
    };
}