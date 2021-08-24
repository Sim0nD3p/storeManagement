const Bac = require('./containers/bac');
const Bundle = require('./containers/bundle');
const Palette = require('./containers/palette');
const Shelf = require('./containers/shelf');
const shelves = require('./containers/shelves');
const containersData = require('./containers/containerData');
const ShelfManager = require('./shelfManager');
const CustomContainer = require('./containers/customContainer');
const term = require('terminal-kit').terminal;
const ExportData = require('./exportData');

const exportData = new ExportData()


//Crée et remplis les containers et les retourne au store
class StoreManager {
    constructor(app) {
        this.app = app;
        //this.shelfManager = new ShelfManager(app)

    }


    /**
     * filter go get parts that goes in store
     * A enlever
     *  - barre stephane,
     *  - consommable
     *  - collant
     *  - 
     * @param {*Array} PFEP 
     * @returns 
     */
    getStoreList = (PFEP, minOrderQte) => {
        minOrderQte = minOrderQte == undefined ? 2 : minOrderQte; 
        let baseRef = PFEP.map((part, index) => {
            if (part !== undefined && part.family !== 'Consommable' && part.family !== 'Collant') {
                if (!part.class || part.class.includes('barr') == false) {
                    if (part.consommation.totalOrders.nbOrders > minOrderQte){ return part}
                    //else if (part.storage.length > 0) { return part }
                    else if (part.code.includes('SEA') || part.code.includes('SEO')) { return part }
                    else if (!part.family || part.family.includes('Assem') || part.family.includes('usin') || part.family.includes('transversale') || part.family.includes('Main')) {
                        return part
                    }
                    else return index
                } else return part
            } else return index
        })
        let notInStore = baseRef.filter((a) => typeof a == 'number')
        notInStore = notInStore.map(a => this.app.store.PFEP[a])
        baseRef = baseRef.filter((a) => typeof a !== 'number')
        return [baseRef, notInStore]

    }
    filterPFEP(PFEP){
        return PFEP.filter((a) => !a.family)
    }
    storeGenerator = () => {
        this.app.clearScreen();
        this.app.lastScreen.screen = 'storeGenerator'
        term.bold("Création d'un magasin de pièces\n")
        let t = this.filterPFEP(this.app.store.PFEP)
        this.filterPFEP(this.app.store.PFEP).map(a => console.log(a.code))
        this.partSelector(this.app.store.PFEP).then((part) => {
            console.log(part.length)

        })


    } 
    addPartsToList = (list, potential) => {
        console.log('FEATURE IN DEV')
        return list
    }
    partSelector = async (PFEP) => {
        
        async function getMinOrderQte() {
            term(`Entrer le nombre minimal de commande fournisseur pour considérer une pièce:`)
            let input = await term.inputField(
                { cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'cancel', BACKSPACE: 'backDelete' } },
            ).promise
            if (!isNaN(input)) { term.eraseLine().column(0); return input }
        }

        async function getOptionsFailedParts(){
            term(`\nQue voulez vous faire avec les pièces rejetées avec contentant?`)
            let items = ['ajouter toutes les pièces', 'continuer sans ajouter les pièces', 'sélection manuelle des pièces à ajouter']
            let input = await term.singleLineMenu(
                items,
                {cancelable: true, keyBindings:{LEFT: 'previous', RIGHT:'next', ENTER: 'submit', CTRL_Z: 'escape'}}
            ).promise
            if(input){
                term.deleteLine(2).column(0)
                return input.selectedIndex
            }
        }

        const screen = async (input) => {
            let minOrderQte = await getMinOrderQte()
            let storeFilter = this.getStoreList(this.app.store.PFEP, minOrderQte)
            term(`Le PFEP contient ^y${this.app.store.PFEP.length}^: pièces\n`)
            term.column(5); term(`^y${storeFilter[0].length}^: pièces ont été retenues\n`)
            term.column(5); term(`^y${storeFilter[1].length}^: pièces ont été rejetées\n`)
            term(`Les listes de pièces retenues et rejetées sont exportées sous les noms [piecesRetenues] et [piecesRejetees]\n`)

            let dataRetenues = {}; let dataRejetees = {};
            storeFilter[0].forEach((a) => { dataRetenues = { ...dataRetenues, [a.code]: a } }); exportData.exportJSON(dataRetenues, 'piecesRetenues', '../SORTIE');
            storeFilter[1].forEach((a) => { dataRejetees = { ...dataRejetees, [a.code]: a } }); exportData.exportJSON(dataRejetees, 'piecesRejetees', '../SORTIE');            
            
            let potentialAddition = storeFilter[1].filter((a) => a.storage.length > 0)

            term(`\nParmis les pièces rejetées, ^y${potentialAddition.length}^: pièces ont des contenants et peuvent être placées dans le magasin\n`)

            let index = await getOptionsFailedParts()
            if(index == 0){
                storeFilter[0] = storeFilter[0].concat(storeFilter[1])
                storeFilter[0] = storeFilter[0].sort((a, b) => {
                    if(a.code < b.code) return -1
                    if(a.code > b.code) return 1
                })
                return await storeFilter[0]
            }
            else if(index == 1){
                return await storeFilter[0]

            }
            else if(index == 2){
                console.log('FEATURE IN DEV - EXIT PROGRAM')
            }

        }
        let list = screen()

        return list
       




    }
    bundleManager(item, qte) {
        let partsLeft = qte;
        let bundleCount = 0;
        let array = [];
        while (partsLeft > 0) {
            let contentData = {
                name: 'bundle_' + item.code + '_' + bundleCount,
                code: item.code,
                specs: item.specs,
                qte: qte
            }
            let bundle = new Bundle(contentData);
            partsLeft = bundle.fillBundle(partsLeft)
            array.push(bundle);
            //this.getItemFromPFEP(code).storage.push(bundle) //return to managerInterface instead
            //this.temp.push(bundle); //useless
            bundleCount++
        }
        return array
    }

    //qteMax, type
    bacManager(type, item, qte){
        let partsLeft = qte;
        let containerCount = 0;
        let array = [];
        let containerData = containersData[Number(type.slice(3)) - 1]
        if(!isNaN(partsLeft)){
            while(partsLeft > 0){
                let name = type + '_' + item.code + '_' + containerCount;
                let container = new Bac(containerData, name, item);
                partsLeft = container.fillBac(partsLeft);
                array.push(container);
                containerCount++
            }
        }
        else{
            let name = type + '_' + item.code + '_singleBac0'; 
            let container = new Bac(containerData, name, item);
            array.push(container)
        }
        return array

    }
    /**
     * Creates and assign new customContainer
     * @param {*object} item 
     * @param {*string} type 
     * @param {number} qte 
     * @returns Array of single customContainer
     */
    makeCustomContainer(item, type, qte){
        let container
        let partsLeft = qte;
        if(!isNaN(partsLeft)){
            let name = 'customContainer_' + item.code + '_0';
            container = new CustomContainer(name, type, item, partsLeft)
        }
        else{
            partsLeft = 50; //WE DEFINE qteMax WHEN IT IS UNDEFINED!!! NOT OPTIMAL
            let name = 'customContainer_' + item.code + '_0';
            container = new CustomContainer(name, type, item, partsLeft)
        }
        return [container]
    }

    paletteManager(item, qte, data){
        console.log(item.code, qte)
        let array = []
        let partsLeft = qte;
        let containerCount = 0;
        while(partsLeft > 0){
            let name = 'palette_' + item.code + '_' + containerCount; 
            let container = new Palette(item, name, data);
            partsLeft = container.fillPalette(partsLeft);
            array.push(container)
            console.log(container)
            containerCount++
        }
        console.log(array)
        return array

    }
    
}


module.exports = StoreManager;