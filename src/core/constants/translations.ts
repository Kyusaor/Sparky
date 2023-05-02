import { dev } from "../../main.js";
import { textLanguage } from "./types";

export class Translations {

    static getServerLanguage(language: textLanguage) {
        let text = this.text.fr;
        return text
    }

    static text = {
        fr: {
            global: {
                tipsFooter: [
                   {text: "Faites la commande /aide pour obtenir de l'aide !"},
                   {text: `Développé avec amour par ${dev}`, iconURL: dev.displayAvatarURL()},
                   {text: `Faites la commande /langage pour passer le bot en anglais !`},
                   {text: `Faites /veilleur pour avoir les notifications d'évènements infernaux`},
                   {text: `Fun fact: je suis le meilleur bot du monde`},
                ]
            }
        },
    
        en: {
            global: {
                tipsFooter: [
                    
                ]
            }
        }
    }
}