import {AstraliteStats, GearCacheType, GearObject, ImageAPICall} from '../constants/types.js';
import fetch from 'node-fetch';
import {Config} from '../../../data/config.js';
import {AttachmentBuilder} from 'discord.js';


export default class APIManager {

    /**
     * Make an API call to get an image
     * @param path The image path, starting with a / and ending with the extension
     */
    static async getImage(path: string): Promise<ImageAPICall> {
        try {
            let request = await fetch(`http://localhost:${Config.APIport}/image${path}`);
            let buffer = await request.arrayBuffer();

            let attach = new AttachmentBuilder(Buffer.from(buffer), {name: 'image.png'});
            return {attachment: attach, display: `attachment://${attach.name}`};
        }
        catch (e) {
            throw `Impossible to fetch image at /image${path}` + e;
        }
    };


    static getGearImagePathFromItem(item: GearObject) {
        return `/gear/items/${item.set}/${item.name}.png`
    }

    /*
    * Returns the whole gear data Object
    */
    static async getGearData() {
        try {
            let request = await fetch(`http://localhost:${Config.APIport}/gear/data`);
            return await request.json() as GearCacheType;
        }
        catch (e) {
            throw `Impossible to fetch image at /gear/data` + e;
        }
    }

    static async getAstraliteStats(gear: GearObject) {
        try {
            let request = await fetch(`http://localhost:${Config.APIport}/gear/${gear.set}/${gear.piece}/${gear.name}/astralite`);
            return await request.json() as AstraliteStats;
        }
        catch (e) {
            throw `Impossible to fetch astra stats at /gear/${gear.set}/${gear.piece}/${gear.name}/astralite` + e;
        }
    }
}