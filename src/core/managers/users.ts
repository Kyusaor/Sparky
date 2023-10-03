import { Console, db } from "../../main.js";
import { UserData, textLanguage } from "../constants/types.js";

export class UserManager {

    id: string;

    constructor(id: string) {
        this.id = id;
    }

    async editData(data: Partial<UserData>) {
        let isDefined = true;
        let oldData = await db.fetchUserData(this.id);
        if (!oldData) {
            isDefined = false;
            oldData = this.getDefaultUserData();
        }

        let defData: UserData = {
            id: this.id,
            preferredLanguage: data.preferredLanguage || oldData.preferredLanguage,
        }
        isDefined ?
            await db.editUserDatabase(defData) :
            await db.createUser(defData);

        for (let dataName of Object.keys(data)) {
            Console.log(`${dataName}: ${oldData[dataName as keyof UserData]} => ${data[dataName as keyof UserData]}`)
        }

    }

    getDefaultUserData(): UserData {
        return {
            id: this.id,
            preferredLanguage: 'en'
        }
    }

    async getOldLanguage(): Promise<textLanguage> {
        let data = await db.fetchUserData(this.id)
        return data.preferredLanguage;
    }
}