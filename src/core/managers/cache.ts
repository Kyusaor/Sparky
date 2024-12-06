import {GearCacheType} from '../constants/types.js';
import APIManager from './apicalls.js';

export class CacheManager {

    private Gear: GearCacheType;

    constructor() {
        this.Gear = undefined;
    }

    async initCache() {
        await this.fetchGearCacheData();
        
    }


    async fetchGearCacheData() {
        try {
            let cache = await APIManager.getGearData();
            if(!cache)
                throw '';
            this.Gear = cache as GearCacheType;
        }
        catch {
            setTimeout(async () => {
                return await this.fetchGearCacheData();
            }, 6000);
        }
    }

    getGear() {
        return this.Gear;
    }
}