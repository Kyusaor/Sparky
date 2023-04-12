export abstract class Utils {

    static logErrors(err:any, crash:boolean) {
        console.error(err);
        if(crash)
            process.exit(1);
    };
}