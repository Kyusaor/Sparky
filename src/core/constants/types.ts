import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder, TextChannel } from "discord.js";
import { Constants, DiscordValues } from "./values.js";
import frTranslationJSON from '../../../ressources/text/fr.json';


//Global
export type fetchedChannelsAtBoot = {
    [Value in keyof typeof DiscordValues.channels]: TextChannel | undefined;
}

export type queryArgs = string | number | boolean | null | queryArgs[] | undefined;


//Translations
export type textLanguage = "fr" | "en";

export interface TranslationCacheType {
    fr: TranslationObject;
    en: TranslationObject;
}

export type SingleLanguageCommandTranslation = { 
    name: string, 
    description: string, 
    options?:Record<string, CommandOptionData>, 
    subcommand?: Record<string, { name: string, description: string, options?: Record<string, CommandOptionData> }>, 
    text?: Record<any, string[] | string | string[][]> ,
    choices?: Record<string, Record<string, string>>
};

export type CommandOptionData = { name: string, description: string }

export type CommandTranslation = { fr: SingleLanguageCommandTranslation, en: SingleLanguageCommandTranslation };

export type TranslationObject = typeof frTranslationJSON;

export type ReplacerList = { 
    username?: string, 
    avatar?: string, 
    dev_username?: string, 
    dev_avatar_url?: string,
    support_email?: string,
    support_server_invite?: string,
    daysSince?: string,
    timestamp?: number,
    date?: string,
    name?: string,
    id?: string,
    text?: string,
    text2?: string,
    text3?: string
}

export type FamiliarTranslation = {
        name: string,
        ability1Name: string,
        ability1Description: string,
        ability2Name?: string,
        ability2Description?: string,
        ability3Name?: string,
        ability3Description?: string,
        activableAbilityName?: string,
        activableAbilityDescription?: string,
        warTalentName?: string,
        warTalentDesctiption?: string
}

//Commands
export type CommandArgs = { intera: ChatInputCommandInteraction, language: textLanguage, commandText: Record<string, string> };

export interface CommandInterface {
    permissionLevel: 1 | 2 | 3;
    neededPermissions?: bigint[];
    cacheLockScope: cacheLockScope;
    commandStructure: SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder| SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    run: ({ intera, language, commandText }: CommandArgs) => unknown
};

export type perksType = "member" | "admin" | "dev";

export type cacheLockScope = "guild" | "user" | "none"

export type CommandName = keyof typeof frTranslationJSON.commands

export type embedPageData = {
    current: number,
    target: -1 | 1,
    total: number,
    filter?: unknown,
    language: textLanguage
};

export type hellEventTask =  "research" | "building" | "merge" | "troop" | "labyrinth" | "tycoon" | "hunt" | "challengeResearch" | "challengeTroops";

export type hellEventData = {
    hellOrChallenge: "challenge" | "hell";
    type: hellEventTask[];
    reward: keyof typeof Constants.WatcherMentionsTemplates;
}

export type familiarData = {
    image: string;
    pactTier: typeof pactList[number];
    tier: 1 | 2 | 3 | 4 | 5;
    ability1: passiveAbilityType
    ability2?: passiveAbilityType
    ability3?: passiveAbilityType
    activableAbility?: ActiveAbilityType
    warSkill?: {
        mixInterest: interestLevel,
        blastInterest: interestLevel,
        defenseInterest: interestLevel,
    };
}

export type familiarName = keyof typeof frTranslationJSON.others.familiars;
export type passiveAbilityType = { type: "war" | "production" | "development", interestLevel: interestLevel };
export type ActiveAbilityType = { type: "war" | "production" | "development", requireStone: boolean, unlock: "adult" | "elder", cooldown:string, interestLevel: interestLevel };

export const pactList = ["1A", "1B", "2A", "2B", "3", "4", "5"] as const;

export type interestLevel = 0 | 1 | 2 | 3;

export type RarityNoMythic = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type RarityWithMythic = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
export type GearSet = "champion" | "steampath" | "hunter" | "emperor" | "emperor-dominion" | "baron" | "none" | "gladiator" | "flipper" | "necrosis" | "gawrilla" | "cottageroar" | "hootclaw" | "hardrox" | "shaman" | "tidal" | "bonappeti" | "queen" | "trojan" | "blackwing" | "saberfang" | "noceros" | "reaper" | "drider" | "maggot" | "gargantua" | "terrorthorn" | "wyrm" | "beast" | "gryphon" | "frostwing";
export type GearPiece = "helmet" | "armor" | "legs" | "main-hand" | "off-hand" | "accessory";
export type StatType = "inf-atk" | "inf-def" | "inf-hp" | "snip-atk" | "snip-def" | "snip-hp" | "cav-atk" | "cav-def" | "cav-hp" | "siege-atk" | "siege-def" | "siege-hp" | "army-atk" | "army-def" | "army-hp" | "reaserch" | "building" | "forging-speed" | "gathering-speed" | "food-prod" | "gold-prod" | "stone-prod" | "timber-prod" | "ore-prod" | "player-exp" | "train-speed" | "upkeep" | "wall-def" | "craft-capacity" | "craft-speed" | "trap-def" | "trap-atk" | "trap-hp" | "army-capacity" | "debuff-hp" | "debuff-def" | "inf-atk-wonder" | "inf-def-wonder" | "snip-atk-wonder" | "snip-def-wonder" | "cav-atk-wonder" | "cav-def-wonder" | "travelSpeed-wonder" | "travelSpeed" | "energy-saver" | "energy-max" | "hunt-dmg" | "hunt-mp" | "hunt-speed" | "merge-speed-pact" | "merge-speed-skill" | "familiar-xp-train" | "familiar-xp-skill"

export type GearObject = {
    id: number,
    image: string,
    set: GearSet,
    piece: GearPiece,
    requiredLevel: number,
    craft:Record<keyof typeof Constants.craftingItemData, number>,
    ember?: {amount: number, rarity: RarityNoMythic}
    stats: Record<StatType, [number, number, number, number, number, number]>
    temperedStats?: Record<StatType, [number, number, number, number, number, number, number, number, number, number, number, number]>
}

//Database related
export type RolesData = {
    watcher: string,
    dragon: string,
    dragonResearch: string,
    watcherResearch: string,
    redOrb: string,
    yellowOrb: string,
    challengeResearch: string,
    challengeTroops: string,
}

export type ChanData = {
    board: string,
    ping: string
}

export type fullServer = {
    id: string, 
    name: string, 
    active: 0 | 1, 
    language: textLanguage,
    roles: RolesData | undefined,
    chans: ChanData | undefined
}

export type Server = { 
    id: string, 
    name: string, 
    active: 0 | 1, 
    hellEvent: string,
    language: textLanguage 
};

export type PartialServer = { 
    id?: string, 
    name?: string, 
    active?: 0 | 1, 
    hellEvent?: string,
    language?: textLanguage 
};

export type UserData = {
    id: string;
    preferredLanguage:textLanguage;
}