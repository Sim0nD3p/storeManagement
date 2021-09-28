const term = require('terminal-kit').terminal
const Bac = require('../containers/bac')
const Bundle = require('../containers/bundle')
const bUs = require('../containers/bUs')
const cus = require('../containers/customContainer')
const containerData = require('../containers/containerData');

const containerList = ['Bac', 'Bundle', 'Bundle usiné', 'Custom container']

class ChangeContainer{
    constructor(app){
        this.app = app;
        this.part;
    }

    containerSelector = (part) => {
        this.app.lastScreen = {
            screen: 'modifyPart',
            content: part,
            index: this.app.FichePiece.index
        }
        this.part = part;
        this.app.clearScreen();
        let string = 'Changement de contenant';
        term.moveTo(term.width/2 - string.length/2, 2); term.bold.underline(string)
        string = 'ATTENTION! UN CHANGEMENT DE CONTENANT POUR UNE PIECE EN MAGASIN BRISERA LE MAGASIN!';
        term.moveTo(term.width/2 - string.length/2, 3); term.bold.underline.red(string)
        term.moveTo(1, 3); term('\t'); term('Choix du contenant:\n')

        let selector = term.singleColumnMenu(
            containerList,
            { cancelable: true, leftPadding: '\t', keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', DOWN: 'next', UP: 'previous'}}
        ).promise

        selector.then((res) => {
            //1: bac, 2: bundle, 3: bUs, 4:cus
            if(res.canceled !== true){
                
                switch(res.selectedIndex){
                    case 0: this.createBac(part); break;
                    case 1: this.createBundle(); break;
                    case 2: this.createBUs(); break;
                    case 3: this.createCus(); break;
                }
            }
            else{
                this.app.FichePiece.modifierPiece(part)
            }
        }).catch((e) => console.log(e))

    }

    //gotta go by storeManagerDesk -> fills and returns containers

    createBac = (part) => {
        this.app.clearScreen();
        this.app.lastScreen = {
            screen: 'containerSelector',
            content: part
        }
        let string = `Configuration du contenant BAC pour pièce ${part.code}`
        term.moveTo(term.width/2 - string.length/2, 2); term.bold.underline(string)

        term.moveTo(1, 3); term('\t'); term.bold('Choix du type de bac:')

        let choixBac = term.singleColumnMenu(
            containerData.map(c => c.type),
            { cancelable: true, leftPadding: '\t', keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', UP: 'previous', DOWN: 'next'}}
        ).promise

        choixBac.then((bac) => {
            console.log(bac)
            term.bold('\tNombre de pièces maximal par bac: ');
            let nbPieces = term.inputField({ cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'cancel', BACKSPACE: 'backDelete' }}).promise
            nbPieces.then((nb) => {
                nb = Number(nb)
                if(!isNaN(nb) && nb !== undefined && nb > 0){
                    part.emballage.TF.nbPieces = nb;
                    //this.app.store.getItemFromPFEP(part.code).emballage.TF.type = bac.selectedText
                    //this.app.store.getItemFromPFEP(part.code).emballage.TF.nbPieces = nb
                    part.emballage.TF.type = bac.selectedText;
                    let containers = this.app.store.storeManagerDesk(bac.selectedText, part)
                    console.log(containers)

                }
            }).catch((e) => console.log(e))


        }).catch((e) => console.log(e))

    }

    createBundle = () => {

    }
    createBUs = () => {

    }
    createCus = () => {

    }


}
module.exports = ChangeContainer