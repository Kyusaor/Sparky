import { ColorResolvable, PermissionsBitField } from "discord.js";

export abstract class DiscordValues {

    static readonly MAIN_GUILD = "632957557375500299";
    static readonly DEV_DISCORD_ID = "370293090407153665";

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
    };
    static readonly emptyEmbedField = { name: "** **", value: "** **" };
    static readonly emptyEmbedFieldValue = "** **";
    static readonly embedThumbnails = {
        trainCalculator: 'https://media.discordapp.net/attachments/659758501865717790/1059497225711005696/latest.png',
        credits: 'https://cdn.discordapp.com/emojis/751774895024898188.webp?size=96&quality=lossless',
        hellBoard: 'https://media.discordapp.net/attachments/659758501865717790/1007676744330903602/infernaux.png'
    }

    static readonly emotes = {
        watcher: {
            name: "veilleur",
            id: "607194832271573024"
        },
        dragon: {
            name: "dragon",
            id: "607194934759391242"
        },
        redOrb: {
            name: "redorb",
            id: "802962307897884723"
        },
        yellowOrb: {
            name: "yellorb",
            id: "802962218764337173"
        },
        research: {
            name: "academie",
            id: "607196986948452377"
        },
        troop: {
            name: "fantassin",
            id: "607554773851570181"
        },
        building: {
            name: "batiment",
            id: "607559564535267348"
        },
        merge: {
            name: "pacte",
            id: "607554115416883200"
        },
        tycoon: {
            name: "royaume_pouvoir",
            id: "607559484486844436"
        },
        labyrinth: {
            name: "labyrinthe",
            id: "607561368421400576"
        },
        hunt: {
            name: "chasse",
            id: "614816781420199937"
        }
    }

    static readonly defaultEmotes = {
        numbers: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]
    }

    static readonly permissions = {
        hellEvents: {
            denyEveryone: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AddReactions],
            allowBot: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ViewChannel]
        }
    }
}

export abstract class Constants {

    static readonly defaultLanguage = 'en';

    static readonly buildings = {
        altar: {
            ressources: {
                food: [594, 891, 1336, 2004, 3007, 4510, 6766, 10149, 15223, 22835, 34253, 51379, 77069, 115603, 173405, 260108, 390163, 585245, 877867, 1316801, 1975202, 2962803, 4444205, 6666308, 13332616],
                stone: [810, 1215, 1822, 2733, 4100, 6150, 9226, 13839, 20759, 31139, 46709, 70063, 105094, 157641, 236462, 354694, 532041, 798061, 1197092, 1795638, 2693457, 4040186, 6060280, 9090420, 18180841],
                wood: [810, 1215, 1822, 2733, 4100, 6150, 9226, 13839, 20759, 31139, 46709, 70063, 105094, 157641, 236462, 354694, 532041, 798061, 1197092, 1795638, 2693457, 4040186, 6060280, 9090420, 18180841],
                ore: [486, 729, 1093, 1640, 2460, 3690, 5535, 8303, 12455, 18683, 28025, 42037, 63056, 94585, 141877, 212816, 319224, 478836, 718255, 1077383, 1616074, 2424112, 3636168, 5454252, 10908504],
                items: [1, 2, 5, 12, 20, 30, 45, 60, 85, 100, 120, 150, 180, 250, 340, 500, 700, 900, 1200, 1500, 1800, 2100, 2400, 3000, 4500],
            },
            images: ['https://media.discordapp.net/attachments/659758501865717790/1050450719599251518/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1050450748326019082/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1050450770614554714/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1050450802520637581/latest.png'],
            itemCost: {1: 15, 10: 120, 100: 1100, 1000: 10000}
        },
        trove: {
            ressources: {
                food: [0, 375000, 562500, 843750, 1262625, 1898437, 2847656, 4271484, 6407226],
                stone: [0, 375000, 562500, 843750, 1262625, 1898437, 2847656, 4271484, 6407226],
                wood: [0, 375000, 562500, 843750, 1262625, 1898437, 2847656, 4271484, 6407226],
                ore: [0, 375000, 562500, 843750, 1262625, 1898437, 2847656, 4271484, 6407226],
                items: [0, 5, 25, 55, 75, 145, 295, 900, 3500],    
            },
            images: ['https://media.discordapp.net/attachments/659758501865717790/1053310152192839710/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053310152725499914/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053310153144946768/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053310153606303804/latest.png'],
            itemCost: {1: 20, 10: 160, 100: 1500, 1000: 14000}
        },
        prison: {
            ressources: {
                food: [375, 562, 843, 1265, 1898, 2847, 4271, 6407, 9610, 14416, 21624, 32436, 48654, 72982, 109473, 164210, 246315, 369472, 554209, 831314, 1246971, 1870456, 2805685, 4208528, 8417056],
                stone: [375, 562, 843, 1265, 1898, 2847, 4271, 6407, 9610, 14416, 21624, 32436, 48654, 72982, 109473, 164210, 246315, 369472, 554209, 831314, 1246971, 1870456, 2805685, 4208528, 8417056],
                wood: [375, 562, 843, 1265, 1898, 2847, 4271, 6407, 9610, 14416, 21624, 32436, 48654, 72982, 109473, 164210, 246315, 369472, 554209, 831314, 1246971, 1870456, 2805685, 4208528, 8417056],
                ore: [375, 562, 843, 1265, 1898, 2847, 4271, 6407, 9610, 14416, 21624, 32436, 48654, 72982, 109473, 164210, 246315, 369472, 554209, 831314, 1246971, 1870456, 2805685, 4208528, 8417056],
                items: [1, 2, 5, 12, 20, 30, 45, 60, 85, 100, 120, 150, 180, 250, 340, 500, 700, 900, 1200, 1500, 1800, 2100, 2400, 3000, 4500],    
            },
            images: ['https://media.discordapp.net/attachments/659758501865717790/1053311615107350629/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053311615719723018/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053311616160120963/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053311616525017169/latest.png'],
            itemCost: {1: 15, 10: 120, 100: 1100, 1000: 10000}
        },
        hall: {
            ressources: {
                food: [140, 210, 315, 472, 708, 1063, 1594, 2392, 3588, 5382, 8073, 12109, 18164, 27246, 40870, 61305, 91957, 137936, 206904, 310357, 465535, 698303, 1047455, 1571183, 3142367],
                stone: [140, 210, 315, 472, 708, 1063, 1594, 2392, 3588, 5382, 8073, 12109, 18164, 27246, 40870, 61305, 91957, 137936, 206904, 310357, 465535, 698303, 1047455, 1571183, 3142367],
                wood: [140, 210, 315, 472, 708, 1063, 1594, 2392, 3588, 5382, 8073, 12109, 18164, 27246, 40870, 61305, 91957, 137936, 206904, 310357, 465535, 698303, 1047455, 1571183, 3142367],
                ore: [140, 210, 315, 472, 708, 1063, 1594, 2392, 3588, 5382, 8073, 12109, 18164, 27246, 40870, 61305, 91957, 137936, 206904, 310357, 465535, 698303, 1047455, 1571183, 3142367],
                items: [1, 2, 5, 12, 20, 30, 45, 60, 85, 100, 120, 150, 180, 250, 340, 500, 700, 900, 1200, 1500, 1800, 2100, 2400, 3000, 4500],
            },
            images: ['https://media.discordapp.net/attachments/659758501865717790/1053314872869392445/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053314873234292827/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053314873628561408/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053314873980895242/latest.png'],
            itemCost: {1: 15, 10: 120, 100: 1100, 1000: 10000}
        },
    }

    static readonly paypalLink = 'https://paypal.me/SparkyBot'

    static readonly troops = {
        1: {
            time: 15,
            might: 2,
            gold: 0,
            rss: 50
        },
        2: {
            time: 30,
            might: 8,
            gold: 5,
            rss: 100
        },
        3: {
            time: 60,
            might: 24,
            gold: 10,
            rss: 150
        },
        4: {
            time: 120,
            might: 36,
            gold: 500,
            rss: 1000
        },
        subv: {
            1: [0, 0.5, 1, 1.5, 2.5, 3.5, 4.5, 7, 10, 16, 40],
            2: [0, 0.5, 1, 1.5, 2.5, 3.5, 4.5, 7, 10, 16, 40],
            3: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 7, 11, 30],
            4: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 7, 11, 30]
        },
    }

    static readonly hellMenu = {
        watcher: {
            emoji: DiscordValues.emotes.watcher
        },
        dragon: {
            emoji: DiscordValues.emotes.dragon
        },
        watcherResearch: {
            emoji: DiscordValues.emotes.research
        },
        dragonResearch: {
            emoji: DiscordValues.emotes.research
        },
        redOrb: {
            emoji: DiscordValues.emotes.redOrb
        },
        yellowOrb: {
            emoji: DiscordValues.emotes.yellowOrb
        },
        challengeResearch: {
            emoji: DiscordValues.emotes.research
        },
        challengeTroops: {
            emoji: DiscordValues.emotes.troop
        }
    }

    static readonly WatcherMentionsTemplates = {
        watcher: [ "research", "building", "merge", "labyrinth", "tycoon", "hunt" ],
        dragon: [ "research", "building", "merge", "labyrinth", "tycoon", "hunt", "challengeResearch", "challengeTroops" ],
        redOrb: [
            ["merge", "troop"],
            ["merge", "building"], 
            ["merge", "research"], 
            ["merge", "troop", "building"], 
            ["merge", "research", "building"], 
            ["research", "troop", "building"], 
            ["merge", "research", "troop", "building"]
        ],
        yellowOrb: [
            ["merge", "research"], 
            ["merge","troop", "building"], 
            ["merge", "troop", "research"]
        ]
    }

    static readonly cycleEvents = {
        labyrinth: {
            origin: 1698987600,
            events: [ "agivre", "drider", "agivre", "wyrm", "agivre", "epinator", "agivre", "gargantua"],
            duration: 604800
        },
        tycoon: {
            origin: 1698901200,
            events: ["chaman", "abeille", "morfalange", "titan"],
            duration: 604800
        }
    }
}