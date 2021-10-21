const term = require('terminal-kit').terminal;
const ExportData = require('./exportData');
const containerData = require('./containers/containerData');

const exportData = new ExportData()
const containerDimensions = (container) => {
    return Math.ceil(container.length) + ' x ' + Math.ceil(container.width) + ' x ' + Math.ceil(container.height) + ' (mm)'
}

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

class DispayStore{
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
    displayContainers(){
        const displayNbParts = (part) => {
            if(part.emballage.TF && part.emballage.TF.nbPieces){
                if(!isNaN(part.emballage.TF.nbPieces)){
                    return Math.ceil(part.emballage.TF.nbPieces)
                }
                else {
                    return 'ND'
                }
            }

        }
        this.app.clearScreen();
        this.app.lastScreen.screen = 'afficherMagasin'
        const spacing = [0, 20, 40, 50, 75, 90];
        let str = new Array(term.width).join('-')

        const filler = 'ND'
        term.column(spacing[0]); term.bold.underline('Code');
        term.column(spacing[1]); term.bold.underline('Famille');
        term.column(spacing[2]); term.bold.underline('Type');
        term.column(spacing[3]); term.bold.underline('Dimensions');
        term.column(spacing[4]); term.bold.underline('Qte pièces');
        term.column(spacing[5]); term.bold.underline('Qte contenants');
        term('\n')
        this.app.store.PFEP.forEach(part => {
            term.column(spacing[0]); term(part.code ? part.code : filler);
            term.column(spacing[1]); term(part.family ? part.family : filler);
            if(part.storage.length > 0){
                term.column(spacing[2]); term(part.storage[0].type ? part.storage[0].type : filler);
                term.column(spacing[3]); term(containerDimensions(part.storage[0]) ? containerDimensions(part.storage[0]) : filler);
                term.column(spacing[4]); term(displayNbParts(part));
                term.column(spacing[5]); term(part.storage.length ? part.storage.length : filler);
            }
            term('\n')
            term(str)
            term('\n')

    
        })
        
    }
    displayContainers_old() {
        let partsArray = [];
        let nb = 0; let nbC = 0; let nbBac1 = 0; let nbBac2 = 0;
        let batard = []
        //0  1   2   3   4
        let spacing = [0, 15, 35, 35, 65, 85]
        term.column(spacing[0]); term('Code');
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


    displayShelf_new(){
        let str = 'Sélectionner étagère'
        term.moveTo(term.width/2-str.length/2, 2); term.bold.underline(str)
        let shelvesList = []
        this.app.store.racking.forEach(rack => {
            shelvesList = shelvesList.concat(rack.shelves.map(s => s.name))
        })
        term.singleColumnMenu(shelvesList, {cancelable: true, keyBindings:{ENTER: 'submit', CTRL_Z:'escape', DOWN: 'next', UP: 'previous'}}).promise


    }
    displayShelf(){
        term.bold('Sélectionner étagère\n');
        let menuItems = [];
        this.app.store.shelves.map((shelf, index) => {menuItems.push(shelf.name) })
        term.singleColumnMenu(
            menuItems,
            {cancelable: true, keyBindings:{ ENTER: 'submit', CTRL_Z: 'escape', UP: 'previous', DOWN: 'next'}},
            (error, response) => {
                if(response !== undefined){
                    this.app.clearScreen()
                    let shelf = this.app.store.rackManager.shelfManager.getShelf(response.selectedText)
                    shelf.getShelf();
                    term.moveTo(0, term.height); term('\n\n\n')
                    console.log(shelf.content)
                    console.log('\n\n')
                    console.log(`Shelf priority index is ${shelf.priority}`)
                    console.log(shelf.getAccessRatio())


                }
            }
        )
    }
    displayShelfContent(){
        term.bold('Contenu des étagères\n')
        let highlight = ['SEP3926', 'SEA240-005047', 'SEP210-004306']
        for(let i = 0; i < this.app.store.shelves.length; i++){
            term(`${this.app.store.shelves[i].name}\n`)
            for(let j = 0; j < this.app.store.shelves[i].content.length; j++){
                if(highlight.indexOf(this.app.store.shelves[i].content[j].name.split('_')[1]) !== -1){
                    term.column(5); term.green(`${this.app.store.shelves[i].content[j].name}`);
                    term.column(35); term.green(`${this.app.store.shelves[i].content[j].consommation}`)
                }
                else {
                    term.column(5); term(`${this.app.store.shelves[i].content[j].name}`);
                    term.column(35); term(`${this.app.store.shelves[i].content[j].consommation}`)

                }
                term('\n')
            }
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
        let tsParts = this.app.store.PFEP.map((part, index) => {
            if(part.utilite == 'TS'){ return part }
            else if(Array.isArray(part.utilite) && part.utilite.indexOf('TS') !== -1){ return part }
            else return null
        })
        tsParts = tsParts.filter((a) => a !== null)
        console.log(`${totalParts} parts placed on shelves`)
        console.log(`${tsParts.length} parts have the tag TS`)
    }

    displayRacking(){
        this.app.clearScreen();
        
        term('\n')
        for(let i = 0; i < this.app.store.racking.length; i++){
            term.column(0); term(`${this.app.store.racking[i].name} [${this.app.store.racking[i].contentSides[0]}, ${this.app.store.racking[i].contentSides[1]}]`)
            term.column(35); term(`length: ${this.app.store.racking[i].length}`)
            term.column(55); term(`height: ${this.app.store.racking[i].height}`)
            term.column(75); term(`tag ${this.app.store.racking[i].tag}`)
            term.column(90); term(`Priorité: ${this.app.store.racking[i].priority ? this.app.store.racking[i].priority.toString().substring(0, 5) : null}`)
            //term.column(55); term(`${this.app.store.racking[i].}\n`)
            term('\n------------------------------------------------------------------------------------------------------------------------\n')
            //term('\n')
            let spacing = [5, 20, 30, 60, 75, 90, 110]
            term.column(spacing[0]); term(`name`)
            term.column(spacing[1]); term(`type`)
            term.column(spacing[2]); term(`priority (shelf | avePart)`)
            term.column(spacing[3]); term(`baseHeight`)
            term.column(spacing[4]); term(`shelfHeight`)
            term.column(spacing[5]); term(`accessRatio`)
            term.column(spacing[6]); term(`spaceRatio`)
            term('\n')
            for(let j = 0; j < this.app.store.racking[i].shelves.length; j++){
                term.column(spacing[0]); term(`${this.app.store.racking[i].shelves[j].name}`)
                term.column(spacing[1]); term(`${this.app.store.racking[i].shelves[j].type}`)
                term.column(spacing[2]); term(`${Math.ceil(this.app.store.racking[i].shelves[j].totalConsom)} | ${Math.ceil(this.app.store.racking[i].shelves[j].priority)}`)
                term.column(spacing[3]); term(`${Math.ceil(this.app.store.racking[i].shelves[j].baseHeight)}`)
                term.column(spacing[4]); term(`${Math.ceil(this.app.store.racking[i].shelves[j].height)}`)
                term.column(spacing[5]); term(`${this.app.store.racking[i].shelves[j].getAccessRatio() ? this.app.store.racking[i].shelves[j].getAccessRatio().toString().substring(0, 5) : null}`) 
                term.column(spacing[6]); term(`${this.app.store.racking[i].shelves[j].getSpaceRatio() ? this.app.store.racking[i].shelves[j].getSpaceRatio().toString().substring(0, 5) : null}`)
                term('\n')
                
            }
            term('\n========================================================================================================================\n\n')
        }

    }

    getAllShelves(){
        this.app.clearScreen();
        let allowSwitch = true
        let index = 0;
        term.on('key', (key) => {
            if(allowSwitch == true){
                if(key === 'UP' && allowSwitch == true){
                    if(index < this.app.store.shelves.length - 1){
                        this.app.clearScreen();
                        index++
                        this.app.store.shelves[index].getShelf(0.80*term.width, 0.80*term.height)
                    }
                }
                else if(key === 'DOWN' && allowSwitch == true){
                    if(index > 0){
                        this.app.clearScreen()
                        index--
                        this.app.store.shelves[index].getShelf(0.75*term.width, 0.75*term.height);
                    }
                }
                else if(key === 'ESCAPE'){
                    allowSwitch = false
                }

            }
            term.moveTo(1, 1); term(this.app.store.shelves[index].name)
            })
        
    }

}


module.exports = DispayStore;