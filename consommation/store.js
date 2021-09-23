const Item = require('./item');
const convertSEP = require('./convertToSEP');
const fs = require('fs');
const Fournisseur = require('./supplier');
const term = require('terminal-kit').terminal;
const containerData = require('./containers/containerData');
const Container = require('./containers/bac');
const Bundle = require('./containers/bundle');
const StoreManager = require('./storeManager');
const Palette = require('./containers/palette');
const RackManager = require('./rackManager');
const { METHODS } = require('http');


const MINIMUM_BUNDLE_LENGTH = 950;

class Store{
    constructor(app){
        this.inventory = [];    //intenvory wich contains all the info we need
        this.partList = [];     //part list for reference (improves performance) useless?
        this.PFEP_partList = [];    //useless?
        this.PFEP = [];
        this.app = app
        //this.containersSample = this.buyContainers();
        this.shelves = [];  //etageres contenant les contenants
        this.containers = []    //contenants
        this.racking = []; //racking contenant les etageres
        this.storeManager = new StoreManager(app)
        this.rackManager = new RackManager(app)

    }


    getShelfFromRacking = (shelf_name) => {
        for(let i = 0; i < this.racking.length; i++){
            for(let j = 0; j < this.racking[i].shelves.length; j++){
                if(this.racking[i].shelves[j].name == shelf_name){
                    return this.racking[i].shelves[j]
                }
            }
        }
    }

    getPartsLocation = (part) => {
        let rack, shelf, place;
        for(let Irack = 0; Irack < this.racking.length; Irack++){
            for(let Ishelf = 0; Ishelf < this.racking[Irack].shelves.length; Ishelf++){
                for(let Ipart = 0; Ipart < this.racking[Irack].shelves[Ishelf].content.length; Ipart++){
                    if(this.racking[Irack].shelves[Ishelf].content[Ipart].name.split('_')[1] == part.code){
                        rack = this.racking[Irack].address;
                        shelf = this.racking[Irack].shelves[Ishelf].address
                    }
                }
            }
        }
        return {
            rack: rack,
            shelf: shelf
        }
    }


    //useless?
    buyContainers(){
        let array = [];
        for(let i = 0; i < containerData.length; i++){
            array.push(new Container(containerData[i]))
        }
        return array
    }

    getShelf

    //useless?
    getContainer(type){
        for(let i = 0; i < this.containersSample.length; i++){
            if(type == this.containersSample[i].type){ return this.containersSample[i] }
        }
    }

    /*

    data should be data = {
        length:
        width:
        height:
    }
    */

    /*
    on veut mettre les items sur les shelf
    les shelf doivent aller sur les racking
    les shelf de meme longueur doivent aller sur les memes racking
    racking
        ont une hauteur max
        ont une largeur
        ont une importance (consom mensuelle totale)

    rackManager
        trouver rack
        envoie la piece au shelfManager pour qu'il decide
        creer rack
        racks sont dans store et rackManager!!!!! ATTENTION!!!!
            TOUJOURS UPDATE RACKMANAGER ET RETOURNER RACKS
            
            OU
        rack peuvent habiter dans store


    */






    /**
     * Fills containers
     * @param {string} type - container type
     * @param {*object} part - part object from PFEP
     * @param {*number} qte - qte to place
     * @param {*} data 
     * @returns 
     */
    storeManagerDesk(type, part, qte, data) {
        let containers = []
        switch(type){
            case 'bundle': {
                containers = this.storeManager.bundleManager(part, qte)
                break;
            }
            case 'bac1': {
                containers = this.storeManager.bacManager('bac1', part, qte);
                break;             
            }
            case 'bac2': {
                containers = this.storeManager.bacManager('bac2', part, qte)
                break;
            }
            case 'palette': {
                containers = this.storeManager.paletteManager(part, qte, data);
                break;
            }
            case 'cus': {
                let customType;
                if(part.family == 'Main'){ customType = 'bac' }
                if(part.family && part.family.includes('usin')){ customType = 'bUs'}
                else { customType = 'bac' }
                //customType should be either bac, bUs, bundle, palette
                containers = this.storeManager.makeCustomContainer(part, part.family, qte);
                //containers = containers.filter((a) => a.length !== null && a.width !== null && a.height !== null)
                if(containers){
                    console.log(containers)
                }
                break;
            }
            case 'bUs': {
                containers = this.storeManager.makeBUs(part, type, qte);

                break;
            }
        }
        containers = containers.filter(a => a !== undefined && a !== null)
        this.containers = this.containers.concat(containers);

        if(containers.length > 0){
            this.getItemFromPFEP(part.code).storage = containers;
        }
        return containers
    }

    genStore(){
        let racking = this.rackManager.initRacking(this.PFEP)
    }



    
   
    paletteManager(code, qte){
       this.getItemFromPFEP(code);



   }
    shelfManager(data){
        let potentialMatch = [];
        this.shelves.map((shelf, index) => {
            if(data.height <= shelf.height + 100 && data.height >= shelf.height - 100){
                potentialMatches.push(shelf);

            }
        })

    }
    importPFEPJSON(){
        fs.readFile('./PFEP.json', 'utf8', (err, jsonString) => {
            if(err){ console.log("Erreur lors de la lecture du fichier PFEP.json", err); return }
            try{
                let PFEPJSON = JSON.parse(jsonString);
                PFEPJSON.map((item, index) => {
                    this.PFEP.push(new Item(item, 'json'));
                    if(item.supplier){
                        item.supplier.map((supplier, supplierIndex) => {
                            this.PFEP[index].supplier.push(this.app.industry.getSupplier(supplier.phone))
                        })
                    }
                })
                this.app.industry.checkSupplierParts();
            } catch(err) {
                console.log('Error parsing JSON string', err)
            }
        })

    }
    exportPFEPJSON(){
        console.log(this.PFEP);
        const jsonString = JSON.stringify(this.PFEP)
        fs.writeFile('PFEP.json', jsonString, (err) => {
            if(err){ console.log("Erreur lors de l'écriture du fichier PFEP.json", err) }
            else{ console.log('file successfully written') };
        })


    }

    removeSEPDash(code){
        if(code.charAt(3)){

            if(code.charAt(3) == '-' && code.length === 8 && code.slice(0, 3) == 'SEP'){
                code = 'SEP' + code.slice(4)
            }
        }
            return code
    }

    /**
     * Check if part is in inventory
     * @param {*} code 
     * @returns bool
     */
    checkPFEP(code){
        let index = -1;
        for(let i = 0; i < this.PFEP.length; i++){
            if(this.PFEP[i].code == this.removeSEPDash(code)){
                index = i;
            }
        }

        return index;
    }


    medianMonthlyConsom = () => {
        let total = []
        let nb = 0;
        for(let i = 0; i < this.PFEP.length; i++){
            let p = this.PFEP[i]
            if(p.consommation && !isNaN(p.consommation.mensuelleMoy)){
                if(p.consommation.mensuelleMoy !== 0){
                    total.push(p.consommation.mensuelleMoy)
                }
            }
        }
        total = total.sort((a, b) => b - a)
        if(total.length % 2 == 0){ return (total[Math.floor(total.length / 2) - 1] + total[Math.floor(total.length / 2)]) / 2 }
        else { return total[Math.floor(total.length / 2)] }

    }

    getPartsShelf = (part) => {
        let targetShelf = null
        for(let i = 0; i < this.shelves.length; i++){
            if(this.shelves[i].content.findIndex((a) => a.name.split('_')[1] == part.code) !== -1){ targetShelf = this.shelves[i] }
        }
        return targetShelf
    }


    //good
    getItemFromPFEP(code){
        let index = this.checkPFEP(code);
        if(index !== -1){
            return this.PFEP[index]
        }
        else { return -1 }
    }
    //good
    addOrderToStore(array){
        for(let i = 0; i < array.length; i++){
            let index = this.checkPFEP(array[i].piece); 
            if(index !== -1){
                this.PFEP[index].addOrder(array[i].nombre, array[i].date);
                let supplierPresent = false;
                for(let j = 0; j < this.PFEP[index].supplier.length; j++){
                    if(this.PFEP[index].supplier[j]){
                        if(this.PFEP[index].supplier[j].phone == array[i].fournisseur){
                            supplierPresent = true;
                        }
                    }
                }
                /* for(let j = 0; j < this.PFEP[index].supplier.length; j++){
                    if(this.PFEP[i].supplier[j] !== undefined){
                        if(array[i].fournisseur == this.PFEP[index].supplier[j].phone){
                            supplierPresent = true;
                        }
                        
                    }
                } */
                if(supplierPresent == false){
                    console.log(array[i].fournisseur)
                    if(this.findSupplier(array[i].fournisseur)){
                        this.PFEP[index].supplier.push(this.findSupplier(array[i].fournisseur));
                        console.log(this.PFEP[index].supplier)
                    }
                }
                /* if(this.PFEP[index].supplier){
                    this.PFEP[index].supplier = this.findSupplier(array[i].fournisseur)
                } */
            }
        }
    }
    createPiece() {
        this.app.clearScreen();
        term.bold(`Création d'une nouvelle fiche de pièce\n`);
        term(`Entrer le nom de la nouvelle pièce\n`);
        term.inputField(
            { cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', BACKSPACE: 'backDelete' } },
            (error, input) => {
                if (input !== undefined) {
                    let data = { code: input };
                    let dataType = 'csv';
                    this.PFEP.push(new Item(data, dataType));
                    this.app.fichePiece.modifierDetails(this.getItemFromPFEP(input));
                }

            }
        )
    }



    /*

    modifierDetails(item){
        

    }



    */
    

    //has its use
    findSupplier(supplierPhoneNumber){
        for(let i = 0; i < this.app.industry.suppliers.length; i++){
            if(this.app.industry.suppliers[i].phone == supplierPhoneNumber){
                return this.app.industry.suppliers[i]
            }
        }

    }


    //good
    generatePFEP(dataArray, type){
        this.PFEP = [];
        dataArray.map((item, index) => {
            if(this.checkPFEP(item.code) == -1){
                let part = new Item(item, 'csv');
                this.PFEP.push(part)
            }
        })
        
    }

    

}
module.exports = Store;