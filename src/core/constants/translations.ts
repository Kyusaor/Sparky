import {Console, db, TranslationsCache} from '../../main.js';
import {
    CommandName,
    CommandTranslation,
    ReplacerList,
    SingleLanguageCommandTranslation,
    textLanguage,
    TranslationCacheType,
    TranslationObject
} from './types.js';
import {readFileSync} from 'fs';
import {Constants, DiscordValues} from './values.js';


export class Translations {

    static async generateTranslationsCache(): Promise<TranslationCacheType> {
        const frJSON = JSON.parse(readFileSync(`./ressources/text/fr.json`, 'utf-8'));
        const enJSON = JSON.parse(readFileSync(`./ressources/text/en.json`, 'utf-8'));

        await this.checkMissingTranslation(frJSON, enJSON);

        Console.log("Traductions chargées avec succès");

        return { fr: frJSON, en: enJSON }
    }

    static async getServerLanguage(serverId: string | null):Promise<textLanguage> {
        return await db.returnServerLanguage(serverId || DiscordValues.MAIN_GUILD);
    }

    static getCommandText(command: CommandName): CommandTranslation {
        let fr = TranslationsCache.fr.commands[command as keyof typeof TranslationsCache.fr.commands] as SingleLanguageCommandTranslation;
        let en = TranslationsCache.en.commands[command as keyof typeof TranslationsCache.en.commands] as SingleLanguageCommandTranslation;

        return { fr, en }
    }

    static displayText(text: string, replacer: ReplacerList): string {
        if(!text)
            return TranslationsCache[Constants.defaultLanguage].global.translation404;
        if (!text.includes('{')) return text;

        for (let replacerElem of Object.keys(replacer)) {
            let split = text.split(`{${replacerElem}}`);
            let replacement = replacer[replacerElem as keyof ReplacerList];
            text = split.join(replacement?.toString());
        }

        return text;
    }

    static async getTranslationDeepKeys(text: Object): Promise<string[]> {
        let keys: string[] = [];
        for (const key of Object.keys(text)) {
            keys.push(key);
            if (typeof text[key as keyof Object] == 'object') {
                const subKeys = await this.getTranslationDeepKeys(text[key as keyof Object] as Object)
                keys = keys.concat(subKeys.map(function (subKeys) {
                    return `${key}.${subKeys}`;
                }));
            }
        }
        return keys;
    }

    static async checkMissingTranslation(fr: TranslationObject, en: TranslationObject) {
        let frKeys = await this.getTranslationDeepKeys(fr);
        let enKeys = await this.getTranslationDeepKeys(en);

        const enDiff = frKeys.filter(key => enKeys.indexOf(key) === -1);
        const frDiff = enKeys.filter(key => frKeys.indexOf(key) === -1);
        
        for (const diff of enDiff) {
			Console.log(`"${diff}" n'est pas présent dans la traduction anglaise`);
		}
		for (const diff of frDiff) {
			Console.log(`"${diff}" n'est pas présent dans la traduction française`);
		}

        if(frDiff.length == 0 && enDiff.length == 0)
            return Console.log("Traductions entières");

        throw "Traductions manquantes, arrêt du bot"
    }
}