const Bac = require('./containers/bac');
const Bundle = require('./containers/bundle');
const Palette = require('./containers/palette');
const Shelf = require('./containers/shelf');
const shelves = require('./containers/shelves');
const containersData = require('./containers/containerData');
const ShelfManager = require('./shelfManager');


//Crée et remplis les containers et les retourne au store
class StoreManager {
    constructor(app) {
        this.app = app;
        //this.shelfManager = new ShelfManager(app)

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