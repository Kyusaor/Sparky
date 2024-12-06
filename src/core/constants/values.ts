import {ColorResolvable, PermissionsBitField} from 'discord.js';
import {
    CraftingItemSource,
    familiarData,
    GearItemName,
    GearObject,
    RarityWithMythic,
    RarityWithTempered,
    StatType
} from './types';
import {TranslationsCache} from '../../main';

export abstract class DiscordValues {

    static readonly MAIN_GUILD = '632957557375500299';
    static readonly DEV_DISCORD_ID = '370293090407153665';

    static readonly BOT_EMAIL_CONTACT = 'sparky.botfr@gmail.com';

    static readonly MAIN_GUILD_INVITE = 'https://discord.gg/6Dtrzax';

    static readonly channels = {
        LOGS_CONNEXIONS: '656141877770321960',
        LOGS_SERVERS: '656141779116097536',
        LOGS_DM: '750464720204726333',
        LOGS_ERRORS: '1015306460672045259',
        LOGS_USERS: '656141824590872576',
        LOGS_DB: '784919405896400916',
        LOGS_HELL_EVENTS: '1013478125004398683',
        HELL_EVENTS_BOARD: '647042988358238208' /* "633437214201741330"*/ // test channel
    };

    static readonly embedDefaultColor: ColorResolvable = [59, 229, 53];
    static readonly embedColors: Record<RarityWithTempered, ColorResolvable> = {
        common: [175, 175, 175],
        uncommon: [8, 142, 44],
        rare: [51, 73, 132],
        epic: [118, 47, 132],
        legendary: [166, 131, 15],
        mythic: [226, 96, 24],
        tempered: [226, 96, 24]
    };
    static readonly botIcon = {
        base: 'https://media.discordapp.net/attachments/659758501865717790/1070365617997221940/sparky.png',
        help: 'https://media.discordapp.net/attachments/659758501865717790/680102643519193089/help_sparky.png',
        helpAdmin: 'https://media.discordapp.net/attachments/659758501865717790/680168774468763671/PicsArt_02-20-10.39.20.png'
    };
    static readonly emptyEmbedField = {name: '** **', value: '** **'};
    static readonly emptyEmbedFieldValue = '** **';
    static readonly embedThumbnails = {
        trainCalculator: 'https://media.discordapp.net/attachments/659758501865717790/1059497225711005696/latest.png',
        credits: 'https://cdn.discordapp.com/emojis/751774895024898188.webp?size=96&quality=lossless',
        hellBoard: 'https://media.discordapp.net/attachments/659758501865717790/1007676744330903602/infernaux.png',
        randomGF: 'https://media.discordapp.net/attachments/659758501865717790/1059831455695507506/image.png',
        pact: 'https://media.discordapp.net/attachments/659758501865717790/1221474459274182676/pacte.png?ex=6612b5bc&is=660040bc&hm=fc2a34f6e7ee991d3c6fd24c362a5550a622346714b3b7e953e4823d6a293ef4&=&format=webp&quality=lossless'
    };

    static readonly emoteNotFound = {name: 'nope', id: '698945285094637688'};

    static readonly defaultEmotes = {
        numbers: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
    };

    static readonly permissions = {
        hellEvents: {
            denyEveryone: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AddReactions],
            allowBot: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ViewChannel]
        }
    };
}

export abstract class Constants {

    static readonly defaultLanguage = 'en';

    static readonly buildings = {
        altar: {
            resources: {
                food: [594, 891, 1336, 2004, 3007, 4510, 6766, 10149, 15223, 22835, 34253, 51379, 77069, 115603, 173405, 260108, 390163, 585245, 877867, 1316801, 1975202, 2962803, 4444205, 6666308, 13332616],
                stone: [810, 1215, 1822, 2733, 4100, 6150, 9226, 13839, 20759, 31139, 46709, 70063, 105094, 157641, 236462, 354694, 532041, 798061, 1197092, 1795638, 2693457, 4040186, 6060280, 9090420, 18180841],
                wood: [810, 1215, 1822, 2733, 4100, 6150, 9226, 13839, 20759, 31139, 46709, 70063, 105094, 157641, 236462, 354694, 532041, 798061, 1197092, 1795638, 2693457, 4040186, 6060280, 9090420, 18180841],
                ore: [486, 729, 1093, 1640, 2460, 3690, 5535, 8303, 12455, 18683, 28025, 42037, 63056, 94585, 141877, 212816, 319224, 478836, 718255, 1077383, 1616074, 2424112, 3636168, 5454252, 10908504],
                items: [1, 2, 5, 12, 20, 30, 45, 60, 85, 100, 120, 150, 180, 250, 340, 500, 700, 900, 1200, 1500, 1800, 2100, 2400, 3000, 4500]
            },
            images: ['https://media.discordapp.net/attachments/659758501865717790/1050450719599251518/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1050450748326019082/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1050450770614554714/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1050450802520637581/latest.png'],
            itemCost: {1: 15, 10: 120, 100: 1100, 1000: 10000}
        },
        trove: {
            resources: {
                food: [0, 375000, 562500, 843750, 1262625, 1898437, 2847656, 4271484, 6407226],
                stone: [0, 375000, 562500, 843750, 1262625, 1898437, 2847656, 4271484, 6407226],
                wood: [0, 375000, 562500, 843750, 1262625, 1898437, 2847656, 4271484, 6407226],
                ore: [0, 375000, 562500, 843750, 1262625, 1898437, 2847656, 4271484, 6407226],
                items: [0, 5, 25, 55, 75, 145, 295, 900, 3500]
            },
            images: ['https://media.discordapp.net/attachments/659758501865717790/1053310152192839710/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053310152725499914/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053310153144946768/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053310153606303804/latest.png'],
            itemCost: {1: 20, 10: 160, 100: 1500, 1000: 14000}
        },
        prison: {
            resources: {
                food: [375, 562, 843, 1265, 1898, 2847, 4271, 6407, 9610, 14416, 21624, 32436, 48654, 72982, 109473, 164210, 246315, 369472, 554209, 831314, 1246971, 1870456, 2805685, 4208528, 8417056],
                stone: [375, 562, 843, 1265, 1898, 2847, 4271, 6407, 9610, 14416, 21624, 32436, 48654, 72982, 109473, 164210, 246315, 369472, 554209, 831314, 1246971, 1870456, 2805685, 4208528, 8417056],
                wood: [375, 562, 843, 1265, 1898, 2847, 4271, 6407, 9610, 14416, 21624, 32436, 48654, 72982, 109473, 164210, 246315, 369472, 554209, 831314, 1246971, 1870456, 2805685, 4208528, 8417056],
                ore: [375, 562, 843, 1265, 1898, 2847, 4271, 6407, 9610, 14416, 21624, 32436, 48654, 72982, 109473, 164210, 246315, 369472, 554209, 831314, 1246971, 1870456, 2805685, 4208528, 8417056],
                items: [1, 2, 5, 12, 20, 30, 45, 60, 85, 100, 120, 150, 180, 250, 340, 500, 700, 900, 1200, 1500, 1800, 2100, 2400, 3000, 4500]
            },
            images: ['https://media.discordapp.net/attachments/659758501865717790/1053311615107350629/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053311615719723018/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053311616160120963/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053311616525017169/latest.png'],
            itemCost: {1: 15, 10: 120, 100: 1100, 1000: 10000}
        },
        hall: {
            resources: {
                food: [140, 210, 315, 472, 708, 1063, 1594, 2392, 3588, 5382, 8073, 12109, 18164, 27246, 40870, 61305, 91957, 137936, 206904, 310357, 465535, 698303, 1047455, 1571183, 3142367],
                stone: [140, 210, 315, 472, 708, 1063, 1594, 2392, 3588, 5382, 8073, 12109, 18164, 27246, 40870, 61305, 91957, 137936, 206904, 310357, 465535, 698303, 1047455, 1571183, 3142367],
                wood: [140, 210, 315, 472, 708, 1063, 1594, 2392, 3588, 5382, 8073, 12109, 18164, 27246, 40870, 61305, 91957, 137936, 206904, 310357, 465535, 698303, 1047455, 1571183, 3142367],
                ore: [140, 210, 315, 472, 708, 1063, 1594, 2392, 3588, 5382, 8073, 12109, 18164, 27246, 40870, 61305, 91957, 137936, 206904, 310357, 465535, 698303, 1047455, 1571183, 3142367],
                items: [1, 2, 5, 12, 20, 30, 45, 60, 85, 100, 120, 150, 180, 250, 340, 500, 700, 900, 1200, 1500, 1800, 2100, 2400, 3000, 4500]
            },
            images: ['https://media.discordapp.net/attachments/659758501865717790/1053314872869392445/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053314873234292827/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053314873628561408/latest.png', 'https://media.discordapp.net/attachments/659758501865717790/1053314873980895242/latest.png'],
            itemCost: {1: 15, 10: 120, 100: 1100, 1000: 10000}
        }
    };

    static readonly links = {
        paypal: 'https://paypal.me/SparkyBot',
        resources: {
            chest: 'https://lordsmobile.igg.com/project/probability/?game_id=1051029902',
            igg: '-__Android__: help.lordsmobile.android@igg.com\n-__iOS__: ihelp.lordsmobile@igg.com',
            reedemCode: 'https://lordsmobile.igg.com/gifts/'
        }
    };

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
        }
    };

    static readonly hellMenu = ['watcher', 'dragon', 'watcherResearch', 'dragonResearch', 'redOrb', 'yellowOrb', 'challengeResearch', 'challengeTroops' ];

    static readonly oldHellMenu = {
        IV: 'watcher',
        IVR: 'watcherResearch',
        ID: 'dragon',
        IDR: 'dragonResearch',
        CDR: 'challengeResearch',
        CDT: 'challengeTroops',
        OR: 'redOrb',
        OJ: 'yellowOrb'
    };

    static readonly WatcherMentionsTemplates = {
        watcher: ['research', 'building', 'merge', 'labyrinth', 'tycoon', 'hunt', 'artifact'],
        dragon: ['research', 'building', 'merge', 'labyrinth', 'tycoon', 'hunt', 'artifact', 'challengeResearch', 'challengeTroops'],
        redOrb: [
            ['artifact'],
            ['merge', 'troop'],
            ['merge', 'building'],
            ['merge', 'research'],
            ['merge', 'troop', 'building'],
            ['merge', 'research', 'building'],
            ['research', 'troop', 'building'],
            ['merge', 'research', 'troop', 'building']
        ],
        yellowOrb: [
            ['artifact'],
            ['merge', 'research'],
            ['merge', 'troop', 'building'],
            ['merge', 'troop', 'research']
        ]
    };

    static readonly cycleEvents = {
        labyrinth: {
            origin: 1698987600,
            events: ['frostwing', 'hellDrider', 'frostwing', 'jadeWyrm', 'frostwing', 'terrorthorn', 'frostwing', 'gargantua'],
            duration: 604800
        },
        tycoon: {
            origin: 1698296400,
            events: ['voodooShaman', 'queenBee', 'bonAppeti', 'tidalTitan'],
            duration: 604800
        },
        monster: {
            origin: 1698296400,
            events: ["terrorthorn+tidalTitan", "frostwing+blackwing", "serpentGladiator+cottageroar", "gargantua+hardrox", "jadeWyrm+grimReaper", "hellDrider+snowBeast", "arcticFlipper+hootclaw", "queenBee+megaMaggot", "mechaTrojan+voodooShaman", "gryphon+saberfang", "necrosis+gawrilla", "noceros+bonAppeti"],
            duration: 86400
        }
    };

    static readonly randomGF = {
        data: {
            125: {
                quest: {
                    help: 60,
                    boat: 12,
                    admin: 120,
                    guild: 120,
                    stage: 15,
                    hell: 1,
                    rss: '20m',
                    hitMob: 45,
                    mightRech: '1m2',
                    mightTotal: '1m2',
                    tycoonBoss: 2,
                    pack: 2,
                    box: 20,
                    gems: '15k',
                    pdg: '400k',
                    stars: '12k'
                },
                color: [156, 110, 214] as ColorResolvable,
                duration: 1
            },
            150: {
                quest: {
                    help: 75,
                    boat: 16,
                    admin: 150,
                    guild: 150,
                    stage: 30,
                    hell: 2,
                    rss: '25m',
                    hitMob: 65,
                    mightRech: '1m5',
                    mightTotal: '1m5',
                    tycoonBoss: 4,
                    pack: 3,
                    box: 25,
                    topHell: 1,
                    topSolo: 1,
                    gems: '25k',
                    pdg: '600k',
                    stars: '25k',
                    token: 45
                },
                color: [156, 110, 214] as ColorResolvable,
                duration: 2
            },
            175: {
                quest: {
                    help: 90,
                    boat: 20,
                    admin: 200,
                    guild: 200,
                    stage: 60,
                    hell: 3,
                    rss: '30m',
                    hitMob: 80,
                    mightRech: '2m',
                    mightTotal: '2m',
                    tycoonBoss: 6,
                    pack: 7,
                    box: 35,
                    topHell: 2,
                    topSolo: 2,
                    gems: '50k',
                    pdg: '900k',
                    stars: '35k'
                },
                color: [156, 110, 214] as ColorResolvable,
                duration: 3
            },
            200: {
                quest: {
                    help: 140,
                    boat: 32,
                    admin: 250,
                    guild: 250,
                    stage: 100,
                    hell: 5,
                    rss: '45m',
                    hitMob: 130,
                    mightRech: '3m',
                    mightTotal: '3m',
                    tycoonBoss: 8,
                    pack: 10,
                    box: 45,
                    topHell: 4,
                    topSolo: 3,
                    gems: '100k',
                    pdg: '1m2',
                    stars: '50k',
                    token: 90
                },
                color: [156, 110, 214] as ColorResolvable,
                duration: 4
            },
            145: {
                quest: {
                    boat: 12,
                    admin: 135,
                    guild: 135,
                    stage: 75,
                    hell: 2,
                    rss: '25m',
                    hitMob: 60,
                    mightRech: '1m2',
                    mightTotal: '1m',
                    tycoonBoss: 3,
                    pack: 4,
                    box: 20,
                    topHell: 2,
                    topSolo: 1,
                    gems: '30k',
                    pdg: '800k',
                    stars: '25k',
                    bossLabyElite: 1,
                    loseTroops: '45k',
                    merge: 30,
                    mobLeg: 1,
                    mergeSpeed: '2',
                    frag: 60
                },
                color: [241, 196, 15] as ColorResolvable,
                duration: 1
            },
            185: {
                quest: {
                    boat: 16,
                    admin: 185,
                    guild: 185,
                    stage: 100,
                    hell: 3,
                    rss: '35m',
                    hitMob: 90,
                    mightRech: '1m5',
                    mightTotal: '2m',
                    tycoonBoss: 6,
                    pack: 6,
                    box: 30,
                    topHell: 2,
                    topSolo: 2,
                    gems: '50k',
                    pdg: '1m2',
                    stars: '40k',
                    bossLabyElite: 1,
                    loseTroops: '75k',
                    merge: 70,
                    mobLeg: 1,
                    mergeSpeed: '6',
                    frag: 120
                },
                color: [241, 196, 15] as ColorResolvable,
                duration: 2
            },
            225: {
                quest: {
                    boat: 28,
                    admin: 280,
                    guild: 280,
                    stage: 150,
                    hell: 5,
                    rss: '50m',
                    hitMob: 140,
                    mightRech: '2m',
                    mightTotal: '3m',
                    tycoonBoss: 9,
                    pack: 12,
                    box: 40,
                    topHell: 3,
                    topSolo: 3,
                    gems: '100k',
                    pdg: '1m8',
                    stars: '60k',
                    bossLabyElite: 2,
                    loseTroops: '200k',
                    merge: 130,
                    mobLeg: 2,
                    mergeSpeed: '18',
                    frag: 800
                },
                color: [241, 196, 15] as ColorResolvable,
                duration: 3
            },
            265: {
                quest: {
                    boat: 40,
                    admin: 365,
                    guild: 365,
                    stage: 230,
                    hell: 7,
                    rss: '65m',
                    hitMob: 190,
                    mightRech: '3m',
                    mightTotal: '4m',
                    tycoonBoss: 12,
                    pack: 16,
                    box: 50,
                    topHell: 5,
                    topSolo: 4,
                    gems: '150k',
                    pdg: '2m4',
                    stars: '90k',
                    token: 120,
                    bossLabyElite: 2,
                    loseTroops: '325k',
                    merge: 200,
                    mobLeg: 3,
                    mergeSpeed: '25',
                    frag: 1200
                },
                color: [241, 196, 15] as ColorResolvable,
                duration: 4
            }
        },
        difficulty: {
            easy: ['help', 'admin', 'guild', 'stage', 'hell'],
            medium: ['boat', 'rss', 'hitMob', 'mightRech', 'mightTotal', 'tycoonBoss', 'box', 'pdg', 'merge', 'mobLeg', 'frag'],
            hard: ['pack', 'topHell', 'topSolo', 'gems', 'stars', 'token', 'bossLabyElite', 'loseTroops', 'mergeSpeed']
        }
    };

    static readonly bonusGF = {
        box: '135',
        token: '400',
        stars: '250k',
        pdg: '3m6',
        mightRech: '12m',
        mightTotal: '25m',
        troopMight: '24m',
        rss: '150m',
        artifactQuest: '4',
        challenge: '3',
        darknest: '6',
        latsDay: '6',
        firstDay: '6',
        ptsQuest: '6',
        hellQuest: '5',
        farmQuest: '5',
        labTycoonQuest: '5',
        labBossQuest: '5',
        huntQuest: '5',
        bundleQuest: '4',
        shipQuest: '3',
        randomQuest: '3'
    };

    static readonly talentCost: Record<number, { type: 'redOrb' | 'yellowOrb', cost: number[] }> = {
        1: {
            type: 'redOrb',
            cost: [20, 9, 10, 12, 14, 16, 19, 24, 31, 45]
        },
        2: {
            type: 'redOrb',
            cost: [40, 18, 21, 24, 28, 32, 37, 48, 62, 90]
        },
        3: {
            type: 'redOrb',
            cost: [80, 36, 43, 50, 57, 64, 72, 94, 123, 181]
        },
        4: {
            type: 'yellowOrb',
            cost: [64, 29, 34, 39, 45, 51, 58, 76, 99, 145]
        },
        5: {
            type: 'yellowOrb',
            cost: [160, 72, 86, 100, 114, 129, 144, 188, 246, 361]
        }
    };

    static readonly PactCost: Record<number, {
        hatchling: { runes: number, maxExp: number },
        adult: { runes: number, maxExp: number },
        elder: { runes: number, maxExp: number }
    }> = {
        1: {
            hatchling: {
                runes: 1,
                maxExp: 5583
            },
            adult: {
                runes: 5,
                maxExp: 56992
            },
            elder: {
                runes: 40,
                maxExp: 45455
            }
        },
        2: {
            hatchling: {
                runes: 1,
                maxExp: 8367
            },
            adult: {
                runes: 10,
                maxExp: 85484
            },
            elder: {
                runes: 80,
                maxExp: 68178
            }
        },
        3: {
            hatchling: {
                runes: 1,
                maxExp: 16113
            },
            adult: {
                runes: 15,
                maxExp: 164703
            },
            elder: {
                runes: 120,
                maxExp: 197212
            }
        },
        4: {
            hatchling: {
                runes: 1,
                maxExp: 25754
            },
            adult: {
                runes: 20,
                maxExp: 264688
            },
            elder: {
                runes: 160,
                maxExp: 316948
            }
        },
        5: {
            hatchling: {
                runes: 1,
                maxExp: 46025
            },
            adult: {
                runes: 25,
                maxExp: 470547
            },
            elder: {
                runes: 200,
                maxExp: 563459
            }
        }
    };

    static readonly familiarsData: Record<keyof typeof TranslationsCache.fr.others.familiars, familiarData> = {
        jaziek: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123632181415997/56.png?ex=66116f01&is=65fefa01&hm=d81e95891504e6da6a71148b80fcd021a9d5aa8d3d266032dfad82bc8a0beca4&=&format=webp&quality=lossless',
            pactTier: '1A',
            tier: 1,
            ability1: {
                type: 'development',
                interestLevel: 0
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 1,
                defenseInterest: 2
            }
        },
        engineer: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123632466755594/56.png?ex=66116f01&is=65fefa01&hm=5d34c700329082360b349fa9aec33c28ff9d33f46dd5b13a74ee4ec83e911e37&=&format=webp&quality=lossless',
            pactTier: '1A',
            tier: 1,
            ability1: {
                type: 'production',
                interestLevel: 0
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 1,
                defenseInterest: 1
            }
        },
        oakroot: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123632756035614/56.png?ex=66116f01&is=65fefa01&hm=1fd8e23d62d179461561f2728b2b5014536ce67abedf20b5e6fbbe21490e18db&=&format=webp&quality=lossless',
            pactTier: '1A',
            tier: 1,
            ability1: {
                type: 'production',
                interestLevel: 0
            },
            warSkill: {
                mixInterest: 0,
                blastInterest: 0,
                defenseInterest: 0
            }
        },
        magmalord: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123632982659183/56.png?ex=66116f01&is=65fefa01&hm=e6c2107192a6d7361f1deab934ef94f81dfc4d175eff28dd150e7cc0c06cee8e&=&format=webp&quality=lossless',
            pactTier: '1A',
            tier: 1,
            ability1: {
                type: 'production',
                interestLevel: 0
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 1,
                defenseInterest: 2
            }
        },
        territe: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123633355948222/56.png?ex=66116f01&is=65fefa01&hm=bffb396df8bb5fa0ba8b899004817d7ab6a7e70e1ced7663b7ea35fb1c2ca187&=&format=webp&quality=lossless',
            pactTier: '1A',
            tier: 2,
            ability1: {
                type: 'development',
                interestLevel: 2
            },
            activableAbility: {
                type: 'development',
                requireStone: false,
                unlock: 'adult',
                cooldown: '24h',
                interestLevel: 2
            },
            warSkill: {
                mixInterest: 0,
                blastInterest: 0,
                defenseInterest: 1
            }
        },
        yeti: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123510403993711/56.png?ex=66116ee4&is=65fef9e4&hm=192c1008f2bb867eae541e5679f8610ec670a7a2779cf8fbaa1a4904fa46636d&=&format=webp&quality=lossless',
            pactTier: '1B',
            tier: 1,
            ability1: {
                type: 'production',
                interestLevel: 0
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 1,
                defenseInterest: 1
            }
        },
        beastmaster: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123510697726102/56.png?ex=66116ee4&is=65fef9e4&hm=4c33c23bb5cd19f990199ea2037d0e012db5ddf3f13e94483208a1ddcb872f57&=&format=webp&quality=lossless',
            pactTier: '1B',
            tier: 1,
            ability1: {
                type: 'development',
                interestLevel: 0
            },
            warSkill: {
                mixInterest: 0,
                blastInterest: 0,
                defenseInterest: 0
            }
        },
        terraspike: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123511007842384/56.png?ex=66116ee4&is=65fef9e4&hm=6c7ae076d6f090ab0ebad03775b6520157b8693a8dce1975b192cf8db18fd731&=&format=webp&quality=lossless',
            pactTier: '1B',
            tier: 1,
            ability1: {
                type: 'production',
                interestLevel: 0
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 1,
                defenseInterest: 2
            }
        },
        gnome: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123511368683540/56.png?ex=66116ee4&is=65fef9e4&hm=92d4c92d30f3711ed1bc2cbe91d6b9922d7a3209cd14b3eb62fc8bc596d0e31f&=&format=webp&quality=lossless',
            pactTier: '1B',
            tier: 1,
            ability1: {
                type: 'production',
                interestLevel: 0
            },
            warSkill: {
                mixInterest: 0,
                blastInterest: 1,
                defenseInterest: 1
            }
        },
        aquiris: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123511691776010/56.png?ex=66116ee4&is=65fef9e4&hm=31b49661217e6ef1c3378c9837c8557417f8b7e63064870b0d313d984fb2a5ba&=&format=webp&quality=lossless',
            pactTier: '1B',
            tier: 2,
            ability1: {
                type: 'production',
                interestLevel: 1
            },
            activableAbility: {
                type: 'development',
                requireStone: false,
                unlock: 'adult',
                cooldown: '12h',
                interestLevel: 2
            },
            warSkill: {
                mixInterest: 2,
                blastInterest: 2,
                defenseInterest: 2
            }
        },
        sorcerer: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123280908320778/56.png?ex=66116ead&is=65fef9ad&hm=4bdec692ec9d07749ac66c94c6c0f6360b543e4f5eb730d1371b6e7639a8f89c&=&format=webp&quality=lossless',
            pactTier: '2A',
            tier: 2,
            ability1: {
                type: 'development',
                interestLevel: 1
            },
            activableAbility: {
                type: 'development',
                requireStone: false,
                unlock: 'adult',
                cooldown: '24h',
                interestLevel: 1
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 1,
                defenseInterest: 1
            }
        },
        strix: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123281105588324/56.png?ex=66116ead&is=65fef9ad&hm=21fb72366d5d342375e14ea4c02c69740568322eacc2e7404c83208f35432fcb&=&format=webp&quality=lossless',
            pactTier: '2A',
            tier: 2,
            ability1: {
                type: 'development',
                interestLevel: 0
            },
            ability2: {
                type: 'development',
                interestLevel: 0
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 1,
                defenseInterest: 1
            }
        },
        evilWeevil: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123281382277130/56.png?ex=66116ead&is=65fef9ad&hm=f6a2929bd942a2d3d889dfbda830fcb065ab056019ce1ce81aa3dbda85607b0b&=&format=webp&quality=lossless',
            pactTier: '2A',
            tier: 2,
            ability1: {
                type: 'development',
                interestLevel: 0
            },
            activableAbility: {
                type: 'production',
                requireStone: false,
                unlock: 'adult',
                cooldown: '24h',
                interestLevel: 3
            },
            warSkill: {
                mixInterest: 2,
                blastInterest: 1,
                defenseInterest: 3
            }
        },
        totempest: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123281667752008/56.png?ex=66116ead&is=65fef9ad&hm=442826602110855fe8e97b5eb360aac870c2584c5cf3c61b4d08bf7422e17166&=&format=webp&quality=lossless',
            pactTier: '2A',
            tier: 2,
            ability1: {
                type: 'production',
                interestLevel: 0
            },
            activableAbility: {
                type: 'development',
                requireStone: false,
                unlock: 'adult',
                cooldown: '24h',
                interestLevel: 2
            },
            warSkill: {
                mixInterest: 0,
                blastInterest: 0,
                defenseInterest: 0
            }
        },
        tempestite: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123281923342396/56.png?ex=66116ead&is=65fef9ad&hm=2fc6643c3589575d1b665c3ad6eb7600465d3f28e154d9343f87f1955bf45829&=&format=webp&quality=lossless',
            pactTier: '2A',
            tier: 3,
            ability1: {
                type: 'war',
                interestLevel: 0
            },
            ability2: {
                type: 'development',
                interestLevel: 1
            },
            activableAbility: {
                type: 'war',
                requireStone: false,
                unlock: 'elder',
                cooldown: '3d',
                interestLevel: 1
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 1,
                defenseInterest: 2
            }
        },
        harpy: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123133738582046/56.png?ex=66116e8a&is=65fef98a&hm=8cf9ca440c4b17c13c8a1ef60fd499b845d7c60a3a20acfd80219bc2e1767983&=&format=webp&quality=lossless',
            pactTier: '2B',
            tier: 2,
            ability1: {
                type: 'war',
                interestLevel: 2
            },
            activableAbility: {
                type: 'development',
                requireStone: false,
                unlock: 'adult',
                cooldown: '24h',
                interestLevel: 3
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 1,
                defenseInterest: 1
            }
        },
        bonehead: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123133461762048/56.png?ex=66116e8a&is=65fef98a&hm=9fe69904ac279e19aefb0c2eb74bc0573b2e2e2d0881b5f90ae8de9132048930&=&format=webp&quality=lossless',
            pactTier: '2B',
            tier: 2,
            ability1: {
                type: 'development',
                interestLevel: 0
            },
            activableAbility: {
                type: 'development',
                requireStone: false,
                unlock: 'adult',
                cooldown: '24h',
                interestLevel: 3
            },
            warSkill: {
                mixInterest: 0,
                blastInterest: 0,
                defenseInterest: 0
            }
        },
        krabby: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123133222682764/56.png?ex=66116e8a&is=65fef98a&hm=4fba43d8900ea8958b8f80a331571ba5a1de5378fba73a4a58e9cb934c194d0a&=&format=webp&quality=lossless',
            pactTier: '2B',
            tier: 2,
            ability1: {
                type: 'production',
                interestLevel: 0
            },
            ability2: {
                type: 'development',
                interestLevel: 1
            },
            warSkill: {
                mixInterest: 0,
                blastInterest: 0,
                defenseInterest: 0
            }
        },
        bouldur: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123132983611452/56.png?ex=66116e8a&is=65fef98a&hm=56f959c7c25a1665e9c13ebf56d073d7d9e252d81eb7d523b0408484345ba18c&=&format=webp&quality=lossless',
            pactTier: '2B',
            tier: 2,
            ability1: {
                type: 'production',
                interestLevel: 0
            },
            activableAbility: {
                type: 'development',
                requireStone: false,
                unlock: 'adult',
                cooldown: '24h',
                interestLevel: 0
            },
            warSkill: {
                mixInterest: 0,
                blastInterest: 0,
                defenseInterest: 0
            }
        },
        pyris: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221123132790931477/56.png?ex=66116e8a&is=65fef98a&hm=63510d467b451da6256ecf8d51196686bb22fd7d10b03d584fdf4483d8486f5c&=&format=webp&quality=lossless',
            pactTier: '2B',
            tier: 3,
            ability1: {
                type: 'war',
                interestLevel: 2
            },
            ability2: {
                type: 'development',
                interestLevel: 1
            },
            activableAbility: {
                type: 'war',
                requireStone: true,
                unlock: 'elder',
                cooldown: '30m',
                interestLevel: 1
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 1,
                defenseInterest: 2
            }
        },
        moleShaman: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122967740612708/56.png?ex=66116e62&is=65fef962&hm=ad50155a482eb3072a5f9bf5be1f4903673ea907bb8c0696872d08bbe8f1474e&=&format=webp&quality=lossless',
            pactTier: '3',
            tier: 3,
            ability1: {
                type: 'development',
                interestLevel: 2
            },
            ability2: {
                type: 'war',
                interestLevel: 2
            },
            activableAbility: {
                type: 'war',
                requireStone: false,
                unlock: 'elder',
                cooldown: '24h',
                interestLevel: 2
            },
            warSkill: {
                mixInterest: 2,
                blastInterest: 1,
                defenseInterest: 3
            }
        },
        magus: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122967522512896/56.png?ex=66116e62&is=65fef962&hm=f873bd29dccd1dbfef889c7581d97e21a33f49f755b0a2c25fa4c00260e29d57&=&format=webp&quality=lossless',
            pactTier: '3',
            tier: 3,
            ability1: {
                type: 'development',
                interestLevel: 1
            },
            ability2: {
                type: 'war',
                interestLevel: 1
            },
            activableAbility: {
                type: 'development',
                requireStone: false,
                unlock: 'elder',
                cooldown: '24h',
                interestLevel: 0
            },
            warSkill: {
                mixInterest: 2,
                blastInterest: 1,
                defenseInterest: 3
            }
        },
        goblin: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122967216590968/56.png?ex=66116e62&is=65fef962&hm=cd7bd7c5b5b82ec9b667aaec6d6c524bf079e409832d9a710526769c414125a6&=&format=webp&quality=lossless',
            pactTier: '3',
            tier: 3,
            ability1: {
                type: 'production',
                interestLevel: 0
            },
            ability2: {
                type: 'production',
                interestLevel: 1
            },
            activableAbility: {
                type: 'production',
                requireStone: false,
                unlock: 'elder',
                cooldown: '24h',
                interestLevel: 3
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 3,
                defenseInterest: 0
            }
        },
        gemmingGremlin: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122967010807940/56.png?ex=66116e62&is=65fef962&hm=778ee3e668f879beafa3b1fd06b8852b00f5efa3bdf0167e1f316a1a361fe7e8&=&format=webp&quality=lossless',
            pactTier: '3',
            tier: 3,
            ability1: {
                type: 'development',
                interestLevel: 1
            },
            ability2: {
                type: 'production',
                interestLevel: 0
            },
            activableAbility: {
                type: 'development',
                requireStone: false,
                unlock: 'elder',
                cooldown: '2d',
                interestLevel: 3
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 3,
                defenseInterest: 0
            }
        },
        trickstar: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122966293577818/56.png?ex=66116e62&is=65fef962&hm=592dbc628445557fac691387aa06c03496a5c7c7cbdbc56d29d644181ec09768&=&format=webp&quality=lossless',
            pactTier: '3',
            tier: 3,
            ability1: {
                type: 'development',
                interestLevel: 1
            },
            ability2: {
                type: 'war',
                interestLevel: 2
            },
            activableAbility: {
                type: 'development',
                requireStone: false,
                unlock: 'elder',
                cooldown: '2d',
                interestLevel: 3
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 3,
                defenseInterest: 0
            }
        },
        noceros: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122965974814790/56.png?ex=66116e62&is=65fef962&hm=6c37a050b807effb5023d8d12fd27deb50699375ecfb3239709de46381953a92&=&format=webp&quality=lossless',
            pactTier: '3',
            tier: 3,
            ability1: {
                type: 'production',
                interestLevel: 0
            },
            ability2: {
                type: 'war',
                interestLevel: 2
            },
            activableAbility: {
                type: 'production',
                requireStone: false,
                unlock: 'elder',
                cooldown: '24h',
                interestLevel: 1
            },
            warSkill: {
                mixInterest: 2,
                blastInterest: 1,
                defenseInterest: 2
            }
        },
        gryphon: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122965765361785/56.png?ex=66116e62&is=65fef962&hm=04c73b81135c2009c055196c1f09ed3f8d7126c3cce46fa6b32cd66cd0ac5335&=&format=webp&quality=lossless',
            pactTier: '3',
            tier: 4,
            ability1: {
                type: 'war',
                interestLevel: 1
            },
            ability2: {
                type: 'development',
                interestLevel: 1
            },
            activableAbility: {
                type: 'development',
                requireStone: true,
                unlock: 'elder',
                cooldown: '30m',
                interestLevel: 2
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 3,
                defenseInterest: 1
            }
        },
        snowBeast: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122779605372959/56.png?ex=66116e36&is=65fef936&hm=c717f62f6b7291a5f56d0e0ceed64c52f026df78bcc1d2bc9511d6241d698c7b&=&format=webp&quality=lossless',
            pactTier: '4',
            tier: 4,
            ability1: {
                type: 'development',
                interestLevel: 0
            },
            ability2: {
                type: 'war',
                interestLevel: 1
            },
            activableAbility: {
                type: 'production',
                requireStone: false,
                unlock: 'elder',
                cooldown: '8h',
                interestLevel: 1
            },
            warSkill: {
                mixInterest: 3,
                blastInterest: 2,
                defenseInterest: 3
            }
        },
        megaMaggot: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122778313261207/56.png?ex=66116e35&is=65fef935&hm=3910551b053b9fdbc44ce9f973295e695334e137cc797e2a8b1cf74276e8a9d0&=&format=webp&quality=lossless',
            pactTier: '4',
            tier: 4,
            ability1: {
                type: 'development',
                interestLevel: 1
            },
            ability2: {
                type: 'war',
                interestLevel: 1
            },
            activableAbility: {
                type: 'war',
                requireStone: true,
                unlock: 'elder',
                cooldown: '30m',
                interestLevel: 0
            },
            warSkill: {
                mixInterest: 2,
                blastInterest: 2,
                defenseInterest: 1
            }
        },
        saberfang: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122777856217128/56.png?ex=66116e35&is=65fef935&hm=6b645ccdbd847cf4d4d190ec6ee44c691c4383d4bcee2183baa5792debe88d7d&=&format=webp&quality=lossless',
            pactTier: '4',
            tier: 4,
            ability1: {
                type: 'development',
                interestLevel: 1
            },
            ability2: {
                type: 'war',
                interestLevel: 1
            },
            activableAbility: {
                type: 'development',
                requireStone: false,
                unlock: 'elder',
                cooldown: '24h',
                interestLevel: 3
            },
            warSkill: {
                mixInterest: 3,
                blastInterest: 2,
                defenseInterest: 2
            }
        },
        hoarder: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122777432723587/56.png?ex=66116e35&is=65fef935&hm=c83002c306f9fe431eefdef691052b0717ecd813888ddb02fb174ad289f8f22a&=&format=webp&quality=lossless',
            pactTier: '4',
            tier: 4,
            ability1: {
                type: 'development',
                interestLevel: 3
            },
            ability2: {
                type: 'development',
                interestLevel: 1
            },
            activableAbility: {
                type: 'development',
                requireStone: false,
                unlock: 'elder',
                cooldown: '3d',
                interestLevel: 3
            },
            warSkill: {
                mixInterest: 3,
                blastInterest: 2,
                defenseInterest: 3
            }
        },
        mechaTrojan: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122776933335151/56.png?ex=66116e35&is=65fef935&hm=71c42cae0e05d9c271fb2b0ad168a74743ca6809e3b164d1f263acc4996e120f&=&format=webp&quality=lossless',
            pactTier: '4',
            tier: 5,
            ability1: {
                type: 'war',
                interestLevel: 2
            },
            ability2: {
                type: 'war',
                interestLevel: 1
            },
            activableAbility: {
                type: 'war',
                requireStone: true,
                unlock: 'elder',
                cooldown: '4h',
                interestLevel: 1
            }
        },
        tidalTitan: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122776451125369/56.png?ex=66116e35&is=65fef935&hm=ca8f9a9f0256a79b87041d6b0dd06c8d80552dfd160eb06bcc34da6aea548e80&=&format=webp&quality=lossless',
            pactTier: '4',
            tier: 5,
            ability1: {
                type: 'war',
                interestLevel: 2
            },
            ability2: {
                type: 'war',
                interestLevel: 2
            },
            activableAbility: {
                type: 'war',
                requireStone: true,
                unlock: 'elder',
                cooldown: '12h',
                interestLevel: 0
            }
        },
        hellDrider: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122776082157568/56.png?ex=66116e35&is=65fef935&hm=e0dd94fb810a2a9945e439188e6d0f8eb17223654957aaff656bad0472eb98d8&=&format=webp&quality=lossless',
            pactTier: '4',
            tier: 5,
            ability1: {
                type: 'war',
                interestLevel: 2
            },
            ability2: {
                type: 'war',
                interestLevel: 3
            },
            activableAbility: {
                type: 'war',
                requireStone: false,
                unlock: 'elder',
                cooldown: '3d',
                interestLevel: 3
            },
            warSkill: {
                mixInterest: 3,
                blastInterest: 3,
                defenseInterest: 2
            }
        },
        grimReaper: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122775716987011/56.png?ex=66116e35&is=65fef935&hm=9cafac5f8f05700be2fb84ef61382711649aab4beea46c4072115d316b1c4fe9&=&format=webp&quality=lossless',
            pactTier: '4',
            tier: 5,
            ability1: {
                type: 'development',
                interestLevel: 1
            },
            ability2: {
                type: 'war',
                interestLevel: 2
            },
            activableAbility: {
                type: 'war',
                requireStone: true,
                unlock: 'elder',
                cooldown: '30m',
                interestLevel: 1
            }
        },
        hueyHops: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122502332514394/56.png?ex=66116df3&is=65fef8f3&hm=af56e9ad6f1394912d3d644edfadefffe351e2d1e0280749101511d4521d9860&=&format=webp&quality=lossless',
            pactTier: '5',
            tier: 5,
            ability1: {
                type: 'war',
                interestLevel: 1
            },
            ability2: {
                type: 'war',
                interestLevel: 2
            },
            activableAbility: {
                type: 'war',
                requireStone: true,
                unlock: 'elder',
                cooldown: '24h',
                interestLevel: 3
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 3,
                defenseInterest: 1
            }
        },
        bonAppeti: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122502105763880/56.png?ex=66116df3&is=65fef8f3&hm=bb4a23f57c81c307c6484327a026184a934440625ba158ab276b32332c6c4753&=&format=webp&quality=lossless',
            pactTier: '5',
            tier: 5,
            ability1: {
                type: 'war',
                interestLevel: 2
            },
            ability2: {
                type: 'war',
                interestLevel: 2
            },
            activableAbility: {
                type: 'war',
                requireStone: true,
                unlock: 'elder',
                cooldown: '30m',
                interestLevel: 1
            },
            warSkill: {
                mixInterest: 2,
                blastInterest: 3,
                defenseInterest: 2
            }
        },
        gargantua: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122501875208212/56.png?ex=66116df3&is=65fef8f3&hm=6c2ab908fc13092b90ff3230aa67057fe5f1c7c4a6446f76e569e33920bace76&=&format=webp&quality=lossless',
            pactTier: '5',
            tier: 5,
            ability1: {
                type: 'war',
                interestLevel: 1
            },
            ability2: {
                type: 'war',
                interestLevel: 2
            },
            activableAbility: {
                type: 'development',
                requireStone: true,
                unlock: 'elder',
                cooldown: '2d',
                interestLevel: 1
            },
            warSkill: {
                mixInterest: 2,
                blastInterest: 3,
                defenseInterest: 2
            }
        },
        frostwing: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122501656969306/56.png?ex=66116df3&is=65fef8f3&hm=6ae2265e7719ddfda428702169ea8f9ede1540e267ef9c85bc274bbf417a5ed4&=&format=webp&quality=lossless',
            pactTier: '5',
            tier: 5,
            ability1: {
                type: 'war',
                interestLevel: 1
            },
            ability2: {
                type: 'war',
                interestLevel: 2
            },
            activableAbility: {
                type: 'war',
                requireStone: true,
                unlock: 'elder',
                cooldown: '8h',
                interestLevel: 1
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 3,
                defenseInterest: 1
            }
        },
        queenBee: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122501447258253/56.png?ex=66116df3&is=65fef8f3&hm=64d99090a60e1c2b5829f2078f7a249b6e3335889c9314130b2f37837eda69a1&=&format=webp&quality=lossless',
            pactTier: '5',
            tier: 5,
            ability1: {
                type: 'war',
                interestLevel: 2
            },
            ability2: {
                type: 'war',
                interestLevel: 2
            },
            activableAbility: {
                type: 'war',
                requireStone: true,
                unlock: 'elder',
                cooldown: '30m',
                interestLevel: 1
            },
            warSkill: {
                mixInterest: 1,
                blastInterest: 3,
                defenseInterest: 1
            }
        },
        blackwing: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122501204119632/56.png?ex=66116df3&is=65fef8f3&hm=06929fe26545c8881f6856b6e01044c4e974f53e4594ecf8b20446f7c8fddafc&=&format=webp&quality=lossless',
            pactTier: '5',
            tier: 5,
            ability1: {
                type: 'war',
                interestLevel: 2
            },
            ability2: {
                type: 'war',
                interestLevel: 2
            },
            activableAbility: {
                type: 'war',
                requireStone: true,
                unlock: 'elder',
                cooldown: '1h',
                interestLevel: 2
            },
            warSkill: {
                mixInterest: 2,
                blastInterest: 3,
                defenseInterest: 2
            }
        },
        jadeWyrm: {
            image: 'https://media.discordapp.net/attachments/659758501865717790/1221122501015240754/56.png?ex=66116df3&is=65fef8f3&hm=aad41c6ff1ad391e7fd761d2b5fc7d696792b54b998e91c8f6b8d4659eaae67a&=&format=webp&quality=lossless',
            pactTier: '5',
            tier: 5,
            ability1: {
                type: 'war',
                interestLevel: 3
            },
            ability2: {
                type: 'war',
                interestLevel: 3
            },
            ability3: {
                type: 'war',
                interestLevel: 3
            },
            warSkill: {
                mixInterest: 3,
                blastInterest: 3,
                defenseInterest: 3
            }
        }
    };

    static readonly craftingItemSources: Record<keyof typeof TranslationsCache.fr.others.gear.craftingItems, CraftingItemSource[]> = {
        adamant_plate: ['champion'],
        aged_dragonglass: ['hardrox'],
        aged_leather: ['hunt'],
        amber: ['rocks'],
        ambergris_crystal: ['arcticFlipper'],
        ancient_bark: ['woods'],
        ancient_blueprints: ['mechaTrojan', 'labyrith'],
        angelic_plume: ['bonAppeti'],
        armor_fragment: ['necrosis'],
        aurichalcum: ['champion'],
        beast_antlers: ['snowBeast'],
        beast_blood: ['snowBeast'],
        beast_paw: ['snowBeast'],
        bee_chrysalis: ['queenBee'],
        black_oil: ['steampath'],
        blade_tip: ['serpentGladiator'],
        blazing_ember: ['ember_chest', 'tycoon'],
        blood_sucker: ['saberfang', 'labyrith'],
        blubber_oil: ['arcticFlipper'],
        brass_ring: ['gawrilla'],
        brass_spike: ['gawrilla'],
        buzzing_husk: ['queenBee'],
        chipped_horn: ['noceros'],
        coal: ['veins'],
        copper_coil: ['rocks'],
        corrosive_toxin: ['megaMaggot', 'labyrith'],
        corrupted_soul: ['grimReaper'],
        crackling_hide: ['noceros'],
        crimson_mane: ['champion'],
        crusty_horn: ['blackwing'],
        crystal_silk: ['champion'],
        cursed_skull: ['grimReaper', 'labyrith'],
        cursed_slab: ['cottageroar'],
        decaying_bones: ['necrosis'],
        devil_horn: ['hellDrider'],
        drowned_echo: ['tidalTitan'],
        dune_core: ['serpentGladiator'],
        electric_horn: ['noceros'],
        feather: ['woods'],
        festive_bell: ['snowBeast', 'labyrith'],
        forbidden_tome: ['cottageroar'],
        fossilized_egg: ['blackwing'],
        fright_fabric: ['cottageroar'],
        frostwing_claw: ['frostwing'],
        frostwing_heart: ['frostwing', 'labyrith'],
        frostwing_horn: ['frostwing'],
        frostwing_scale: ['frostwing'],
        frozen_conch: ['arcticFlipper'],
        fur_pelt: ['field'],
        gargantuan_eye: ['gargantua', 'labyrith'],
        gargantuan_fang: ['gargantua'],
        gargantuan_locks: ['gargantua'],
        gawrillas_rage: ['gawrilla'],
        ghostly_shroud: ['grimReaper'],
        glistening_pearl: ['tidalTitan', 'tycoon'],
        glowing_eye: ['blackwing', 'labyrith'],
        glowing_halo: ['bonAppeti', 'tycoon'],
        golden_tooth: ['hardrox'],
        gryphon_core: ['gryphon', 'labyrith'],
        gryphon_egg: ['gryphon'],
        gryphon_quill: ['gryphon'],
        heat_ore: ['hunt'],
        heat_pipe: ['steampath'],
        holy_silk: ['bonAppeti'],
        honey_jar: ['queenBee'],
        hunters_flame: ['hunt'],
        iron_bolts: ['gargantua'],
        jade_orb: ['jadeWyrm', 'labyrith'],
        keystone: ['hardrox'],
        lava_mud: ['rocks'],
        lightning_vial: ['noceros', 'labyrith'],
        linen: ['field'],
        logs: ['woods'],
        lunar_crest: ['hootclaw'],
        lustrous_crystal: ['arcticFlipper'],
        lux_bracers: ['bonAppeti'],
        maggot_tail: ['megaMaggot'],
        maggot_teeth: ['megaMaggot'],
        mark_of_fury: ['gawrilla'],
        mega_barb: ['megaMaggot'],
        mega_eggsac: ['megaMaggot'],
        metal: ['veins'],
        metal_scraps: ['hellDrider'],
        minerals: ['veins'],
        mutant_fungi: ['necrosis'],
        mutated_brain: ['hellDrider', 'labyrith'],
        ocean_breeze: ['tidalTitan'],
        oily_spring: ['mechaTrojan'],
        platinium: ['rocks'],
        power_core: ['steampath'],
        prehistoric_hide: ['saberfang'],
        queen_venom: ['queenBee', 'tycoon', 'labyrith'],
        refined_gunpowder: ['mechaTrojan'],
        ritual_mask: ['voodooShaman'],
        rotten_blood: ['necrosis'],
        royal_stinger: ['queenBee'],
        rusted_chain: ['hunt'],
        rusty_horseshoe: ['mechaTrojan'],
        saber_tooth: ['saberfang'],
        sacred_gem: ['voodooShaman'],
        savage_claw: ['saberfang'],
        scarlet_feather: ['hootclaw'],
        slimy_scale: ['blackwing'],
        smoldering_core: ['hellDrider'],
        soul_candle: ['cottageroar'],
        stuffed_doll: ['voodooShaman', 'tycoon'],
        submerged_alloy: ['tidalTitan'],
        tattooed_skin: ['gargantua'],
        terrorthorn_seed: ['terrorthorn', 'labyrith'],
        terrorvine: ['terrorthorn'],
        terrorwing: ['terrorthorn'],
        terror_pollen: ['terrorthorn'],
        terrorteeth: ['terrorthorn'],
        tough_scales: ['serpentGladiator'],
        toxic_fang: ['serpentGladiator'],
        tribal_drum: ['voodooShaman'],
        veronicas_veil: ['champion'],
        vines: ['field'],
        weeping_wood: ['hootclaw'],
        wild_fruit: ['hootclaw'],
        wyrm_gut: ['jadeWyrm'],
        wyrm_horn: ['jadeWyrm'],
        wyrm_scales: ['jadeWyrm'],
        wyrm_spine: ['jadeWyrm']
    };

    static readonly defaultGearObjectData: GearObject = {
        'name': '<default_item>' as GearItemName,
        'set': 'none',
        'piece': 'armor',
        'requiredLevel': 0,
        'craft': {},
        'ember': {
            'amount': 0,
            'rarity': 'common'
        },
        'stats': {},
        astraliteCost: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    static readonly rarityList: (RarityWithMythic | 'tempered')[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'tempered'];

    static readonly emperorSets = ['emperor', 'exalted'];

    static readonly statSuffix: Record<StatType, string> = {
        'inf-atk': '%',
        'inf-def': '%',
        'inf-hp': '%',
        'range-atk': '%',
        'range-def': '%',
        'range-hp': '%',
        'cav-atk': '%',
        'cav-def': '%',
        'cav-hp': '%',
        'siege-atk': '%',
        'siege-def': '%',
        'siege-hp': '%',
        'army-atk': '%',
        'army-def': '%',
        'army-hp': '%',
        research: '%',
        building: '%',
        'forging-speed': '%',
        'gathering-speed': '%',
        'food-prod': '%',
        'gold-prod': '%',
        'stone-prod': '%',
        'timber-prod': '%',
        'ore-prod': '%',
        'player-exp': '%',
        'train-speed': '%',
        upkeep: '%',
        'wall-def': '%',
        'craft-capacity': '',
        'craft-speed': '%',
        'trap-def': '%',
        'trap-atk': '%',
        'trap-hp': '%',
        'army-capacity': '%',
        'debuff-hp': '%',
        'debuff-def': '%',
        'inf-atk-wonder': '%',
        'inf-def-wonder': '%',
        'range-atk-wonder': '%',
        'range-def-wonder': '%',
        'cav-atk-wonder': '%',
        'cav-def-wonder': '%',
        'travel-speed-wonder': '%',
        'travel-speed': '%',
        'energy-saver': '%',
        'energy-max': '',
        'hunt-dmg': '%',
        'hunt-mp': '%',
        'hunt-speed': '%',
        'merge-speed-pact': '%',
        'merge-speed-skill': '%',
        'familiar-xp-train': '%',
        'familiar-xp-skill': '%'
    };
}