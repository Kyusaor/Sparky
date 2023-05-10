import { ColorResolvable } from "discord.js";

export abstract class DiscordValues {

    static readonly MAIN_GUILD = "632957557375500299";
    static readonly DEV_DISCORD_ID = "370293090407153665";

    static readonly BOT_PERMISSIONS_BITFIELD = "268748881";
    static readonly BOT_EMAIL_CONTACT = "sparky.botfr@gmail.com";

    static readonly MAIN_GUILD_INVITE = "https://discord.gg/6Dtrzax";

    static readonly channels = {
        LOGS_CONNEXIONS: "656141877770321960",
        LOGS_SERVERS: "656141779116097536",
        LOGS_DM: "750464720204726333",
        LOGS_ERRORS: "1015306460672045259",
        LOGS_USERS: "656141824590872576",
        LOGS_DB: "784919405896400916",
        LOGS_HELL_EVENTS: "1013478125004398683",
        HELL_EVENTS_BOARD: "647042988358238208"
    };

    static readonly embedColor:ColorResolvable = [59, 229, 53];
    static readonly botIcon = {
        base: 'https://media.discordapp.net/attachments/659758501865717790/1070365617997221940/sparky.png',
        help: 'https://media.discordapp.net/attachments/659758501865717790/680102643519193089/help_sparky.png',
        helpAdmin: 'https://media.discordapp.net/attachments/659758501865717790/680168774468763671/PicsArt_02-20-10.39.20.png'
    }
}