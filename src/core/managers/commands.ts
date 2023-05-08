export abstract class CommandManager {

    static async fetchCommand(name:string):Promise<any> {
        let command = await import(`../commands/${name}.js`);
        return command
    }

}