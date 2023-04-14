import consoleStamp from "console-stamp";
import { createWriteStream, existsSync, mkdirSync } from "fs";

export abstract class Utils {

    static format2DigitsNumber(num: number) {
        return num.toString().padStart(2, '0');
    }

}


export class ConsoleLogger {
    logger: Console;

    constructor () {

        let formatDate = {
            day: Utils.format2DigitsNumber(new Date().getDate()),
            month: Utils.format2DigitsNumber(new Date().getMonth()),
            year: Utils.format2DigitsNumber(new Date().getFullYear())
        };

        //Check if directory exists and create it if not
        let dir = `./logs/${formatDate.month}-${formatDate.year}`
        if(!existsSync(dir)) {
            mkdirSync(dir)
        }

        //Log into file
        let logDir =  dir + `/logs-${formatDate.day}-${formatDate.month}-${formatDate.year}.log`
        const output = createWriteStream(logDir, { flags: 'a' }) as any;
        const errorOutput = createWriteStream(logDir, { flags: 'a' }) as any;
        this.logger = new console.Console(output, errorOutput);

        consoleStamp(this.logger, {
            format: ":date(dd/mm/yyyy - HH:MM:ss)",
            stderr: errorOutput,
            stdout: output
        });
        consoleStamp(console, {
            format: ":date(dd/mm/yyyy - HH:MM:ss)",
        });

        this.logger.info("Console paramétrée avec succès")
    };

    error(input:any, crash:boolean) {
        console.error(input);
        this.logger.error(input);
        if(crash)
            process.exit(1);
    };

    log(input:any) {
        console.log(input);
        this.logger.log(input);
    };
}