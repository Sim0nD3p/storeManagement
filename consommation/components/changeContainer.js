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
        let string = 'Sélection de contenant';
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
                    case 1: this.createBundle(part); break;
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

    createBundle = (part) => {
        this.app.clearScreen();
        this.app.lastScreen = {
            screen: 'containerSelector',
            content: part
        }
        let string = `Configuration du contenant BUNDLE pour pièce ${part.code}`
        term.moveTo(term.width/2 - string.length/2, 2); term.bold.underline(string);
        const displayPartsSpecs = (part) => {
            term.eraseArea(2*term.width/3-20, 4, 20, 20);
            term.moveTo(2*term.width/3, 4); term(`length: ${part.specs.length}`);
            term.moveTo(2*term.width/3, 5); term(`width: ${part.specs.width}`);
            term.moveTo(2*term.width/3, 6); term(`height: ${part.specs.height}`);
            term.moveTo(2*term.width/3, 7); term(`weight: ${part.specs.weight}`);
        }
        displayPartsSpecs(part)
        //input length
        term.moveTo(5, 4); term(`Entrer la longueur d'un bundle (en mm): `);
        let lengthInput = term.inputField({ cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'cancel', BACKSPACE: 'backDelete' }}).promise
        lengthInput.then((length) => {
            length = Number(length)
            if(!isNaN(length)){
                displayPartsSpecs(part)
                //input width
                term.moveTo(5, 6); term(`Entrer la largeur d'un bundle (mm): `);
                let widthInput = term.inputField({ cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'cancel', BACKSPACE: 'backDelete' }}).promise;
                widthInput.then((width) => {
                    width = Number(width)
                    if(!isNaN(width)){
                        displayPartsSpecs(part);
                        //input height
                        term.moveTo(5, 8); term(`Entrer la hauteur d'un bundle (mm): `);
                        let heightInput = term.inputField({ cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'cancel', BACKSPACE: 'backDelete' }}).promise;
                        heightInput.then((height) => {
                            height = Number(height);
                            if(!isNaN(height)){
                                console.log(length, width, height)

                            } else term(`Veuillez entrer un nombre`)
                        }).catch((e) => console.log(e))
                    } else term(`Veuillez entrer un nombre`)
                }).catch((e) => console.log(e))
            } else term(`Veuillez entrer un nombre`)
        }).catch((e) => console.log(e))


    }
    createBUs = () => {

    }
    createCus = () => {

    }


}
module.exports = ChangeContainer