const term = require('terminal-kit').terminal;
const ExportData = require('./exportData');
const containerData = require('./containers/containerData');

const exportData = new ExportData()

function formatDimensions(dimensionsArray){
    let string = '';
    for(let i = 0; i < dimensionsArray.length; i++){
        if(dimensionsArray[i] < 10){ string = `${string}  ${dimensionsArray[i].toString()}`}
        else if(dimensionsArray[i] < 100){ string = `${string} ${dimensionsArray[i].toString()}`}
        else{ string = `${string}${dimensionsArray[i].toString()}`}
        if(i < dimensionsArray.length - 1){string = `${string} x `}
    }
    return string

}

const formatNbPieceBac = (array) => {
    let string= '';
    if(!isNaN(array[0]) && !isNaN(array[array.length - 1]) && array[0] > 0){
        if(array[0] !== array[array.length - 1]){
            string = `${array[0]}, ..., ${array[array.length - 1]}`
        }
        else string = array[0].toString()
        
    }
    return string
}

class DispayStore {
    constructor(app) {
        this.app = app;

    }

    totalBundleArea(){
        let area = 0;
        this.app.store.containers.map((container, index) => {
            //console.log(container);
            if(container.type == 'bundle' && !isNaN(container.width) && !isNaN(container.length)){
                area += container.width * container.length

            }
        })
        term(`La surface utilisée par les bundles est ${area/1000000} m2\n`)
    }
    displayContainers() {
        let partsArray = [];
        let nb = 0; let nbC = 0; let nbBac1 = 0; let nbBac2 = 0;
        let batard = []
        //0  1   2   3   4
        let spacing = [0, 15, 35, 45, 50, 65]
        term('Code');
        term.column(spacing[1]); term('Famille');
        term.column(spacing[2]); term('Contenant');
        term.column(spacing[3]); term('Nb');
        term.column(spacing[4]); term('DimUnit');
        term.column(spacing[5]); term('Bacs')
        term('\n')
        this.app.store.PFEP.map((part, index) => {
            let pertinent = true;
            let nbPiecesArray = []
            let weightArray = [];
            if(part.class && part.class.includes('barr')){ pertinent = false }
            if(part.qteMax == 'PAS ASSEZ DE DONNÉES'){ pertinent = false }
            if (part.family !== 'Consommable' && part.family !== 'Collant' &&pertinent == true) {
                nb++;


                let containersObject = {};
                if (part.storage.length > 0) {
                    containersObject = {
                        isTrue: false,
                        nb: part.storage.length,

                    };
                } else {
                    batard = {
                        ...batard,
                        [part.code]: part
                    }
                }

                part.storage.map((container, index) => {
                    if (partsArray.indexOf(container.itemCode) == -1) {
                        partsArray.push(container.itemCode)
                    }
                    nbPiecesArray.push(container.count);
                    weightArray.push(Math.ceil(container.weight))

                    if (!containersObject.isTrue) {
                        if(container.type == 'bac1'){ nbBac1++ }
                        if(container.type == 'bac2'){ nbBac2++ }
                        nbC++;
                        containersObject = {
                            ...containersObject,
                            isTrue: true,
                            type: container.type,
                            weight: container.weight,
                            length: container.length,
                            height: container.height,
                            width: container.width,
                        }
                    }
                })  //end of container MAP


                if (part.class) {
                    if (part.class == 'A') { term.green() }
                    else if (part.class == 'B') { term.brightYellow() }
                    else if (part.class.includes('C')) { term.brightRed() };
                }
                if(part.specs){
                    if(part.specs.width){ formatDimensions(part.specs.width)}
                }

                term(part.code);
                term.column(spacing[1]); term(part.family ? part.family.substring(0, 12) : '');     //famille
                term.column(spacing[2]); term(containersObject.type);                               //type contenant
                term.column(spacing[3]); term(containersObject.nb);                                 //nombre par contenant
                term.column(spacing[4]); term(formatNbPieceBac(nbPiecesArray))
                if (containersObject.isTrue) {                                                      //dimensions contentant
                    term.column(spacing[5]); term(`${containersObject.length ? Math.ceil(containersObject.length) : 'N/A'} x ${containersObject.width ? Math.ceil(containersObject.width) : 'N/A'} x ${containersObject.height ? Math.ceil(containersObject.height) : 'N/A'}`);
                }
                term('\n');
                term.column(spacing[4]); term(formatNbPieceBac(weightArray));
                term.column(spacing[5]); term(formatDimensions([Math.ceil(part.specs.length), Math.ceil(part.specs.width), Math.ceil(part.specs.height)]))
                

                term.styleReset();
                term('\n---------------------------------------------------------------------\n')
            }
        })

        term(`${nb} pieces doivent etre place dans des bac\n`)
        term(`${nbC} pieces sont placees dans des bacs\n`)
        term(`${nbBac1} bac1 et ${nbBac2} bac2\n`)
        term(`Surface utilisée par les bac de type 1: ${nbBac1 * (containerData[0].outside.length * containerData[0].outside.width)/1000000} m2\n`)
        term(`Surface utilisée par les bac de type 2: ${nbBac2 * (containerData[1].outside.length * containerData[1].outside.width)/1000000} m2\n`)
        this.totalBundleArea();
    



        term(`Le magasin contient ${this.app.store.containers.length} contenants\n`)
        term(`Les contenants comprennent ${partsArray.length} pièces\n`)
        exportData.exportJSON(batard, 'missingContainers')

    }

    displayShelf(){
        term.bold('Sélectionner étagère\n');
        let menuItems = [];
        this.app.store.shelves.map((shelf, index) => {menuItems.push(shelf.name) })
        term.singleColumnMenu(
            menuItems,
            {cancelable: true, keyBindings:{ ENTER: 'submit', CTRL_Z: 'escape', UP: 'previous', DOWN: 'next'}},
            (error, response) => {
                if(response){
                    let shelf = this.app.store.rackManager.shelfManager.getShelf(response.selectedText)
                    shelf.getShelf();
                    term.moveTo(0, term.height); term('\n\n\n')
                    console.log(shelf.content)
                    console.log('\n\n')
                    console.log(`Shelf priority index is ${shelf.priority}`)


                }
            }
        )
    }
    displayShelfContent(){
        term.bold('Contenu des étagères\n')
        for(let i = 0; i < this.app.store.shelves.length; i++){
            console.log(this.app.store.shelves[i].name)
            console.log(this.app.store.shelves[i].content)
            console.log('--------------------\n')
        }

        let totalParts = 0;
        for(let i = 0; i < this.app.store.shelves.length; i++){
            let array = [];
            for(let j = 0; j < this.app.store.shelves[i].content.length; j++){
                if(array.indexOf(this.app.store.shelves[i].content[j].name.split('_')[1]) == -1){

                    array.push(this.app.store.shelves[i].content[j].name.split('_')[1])
                }
            }
            totalParts += array.length

        }
        console.log(`${totalParts} parts placed on shelves`)
    }

}


module.exports = DispayStore;