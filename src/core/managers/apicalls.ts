import {AstraliteStats, GearCacheType, GearObject, ImageAPICall} from '../constants/types.js';
import fetch, {Response} from 'node-fetch';
import {Config} from '../../../data/config.js';
import {AttachmentBuilder} from 'discord.js';
import {Console} from '../../main.js';

class HTTPResponseError extends Error {
    private response: Response;

    constructor(response: Response) {
        super(`HTTP Error ${response.status}: ${response.statusText}\n`);
        this.response = response;
    }
}

export default class APIManager {

    /**
     * Make an API call
     */
    static async APIcall(path: string) {
        let request;
        try {
            request = await fetch(path);
            return this.checkResponse(request);
        }

        catch (e) {
            throw new HTTPResponseError(new Response({}, {status: 500, statusText: 'An error has occured'}));
        }
    }

    static checkResponse(res: Response) {
        if (res.ok) {
            return res;
        } else {
            throw new HTTPResponseError(res);
        }

    }

    /**
     * Make an API call to get an image
     * @param path The image path, starting with a / and ending with the extension
     */
    static async getImage(path: string): Promise<ImageAPICall> {
        let request: Response;
        try {
            request = await this.APIcall(`http://localhost:${Config.APIport}/image${path}`);
            let buffer = await request.arrayBuffer();

            let attach = new AttachmentBuilder(Buffer.from(buffer), {name: 'image.png'});
            return {attachment: attach, display: `attachment://${attach.name}`};
        }
        catch (e) {
            throw (e as Error) + `Impossible to fetch image at /image${path}`;
        }
    };


    static getGearImagePathFromItem(item: GearObject) {
        return `/gear/items/${item.set}/${item.name}.png`;
    }

    /*
    * Returns the whole gear data Object at boot
    */
    static async getGearData() {
        let request: Response;
        try {
            request = await this.APIcall(`http://localhost:${Config.APIport}/gear/data`);
            Console.log('Données de stuff chargées avec succès');
            return await request.json() as GearCacheType;
        }
        catch (e) {
            Console.error((e as Error) + `Impossible to fetch image at /gear/data`);
        }
    }

    static async getAstraliteStats(gear: GearObject) {
        let request: Response;
        try {
            request = await this.APIcall(`http://localhost:${Config.APIport}/gear/${gear.set}/${gear.piece}/${gear.name}/astralite`);
            return await request.json() as AstraliteStats;
        }
        catch (e) {
            throw (e as Error) + `Impossible to fetch astra stats at /gear/${gear.set}/${gear.piece}/${gear.name}/astralite`;
        }
    }
}