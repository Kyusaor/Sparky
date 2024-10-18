import {GearCacheType} from '../constants/types.js';
import fetch from 'node-fetch';
import {Config} from '../../../data/config.js';
import {AttachmentBuilder} from 'discord.js';


export default class APIManager {

    /**
     * Make an API call to get an image
     * @param path The image path, starting with a / and ending with the extension
     */
    static async getImage(path: string) {
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
}