const Supplier = require('./supplier');
const fs = require('fs');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const term = require('terminal-kit').terminal;

class Industry{
    constructor(app){
        this.app = app;
        this.suppliers = []
        this.store = app.store;

    }
    addSupplier(){
        this.app.clearScreen();
        term(`Création d'une nouvelle fiche fournisseur\n`);
        term(`Enter le nom du fournisseur\n`);
        term.inputField({cancelable: true, keyBindings: { ENTER: 'submit', BACKSPACE:'backDelete', CTRL_Z: 'cancel'}},
        (error, input) => {
            //this.app.lastScreen.screen = 'addSupplier';
            if(input !== undefined){
                let data = { name: input };
                this.suppliers.push(new Supplier(data, 'basic'))
                
                this.app.ficheSupplier.modifierDetails(this.app.industry.getSupplierName(input))
            }
        })
        

    }

    getSupplierName(name){
        for(let i = 0; i < this.suppliers.length; i++){
            if(name == this.suppliers[i].name){
                return this.suppliers[i]
            }
        }
    }

    getSupplier(phone){
        for(let i = 0; i < this.suppliers.length; i++){
            if(phone == this.suppliers[i].phone){
                return this.suppliers[i]
            }
        }
        return null
    }

    checkSupplierParts(){
        for(let i = 0; i < this.suppliers.length; i++){
            this.suppliers[i].checkForParts(this.store.PFEP);
        }
    }
    createSupplierList(data){
        this.suppliers = [];
        for(let i = 0; i < data.length; i++){
            let index = -1;
            for(let j = 0; j < this.suppliers.length; j++){
                if(data[i].phone == this.suppliers[j].phone){
                    index = j
                }
            }
            if(index === -1){
                let supplier = new Supplier(data[i], 'csv');
                console.log(supplier);
                supplier.addDetailsFromList()
                this.suppliers.push(supplier)
            }
        }
    }

    addPartsToSupplier(data){
        for(let i = 0; i < data.length; i++){
            for(let j = 0; j < this.suppliers.length; j++){
                if(data[i].fournisseur == this.suppliers[j].phone){
                    if(this.suppliers[j].piecesFournies.indexOf(data[i].piece) == -1 && this.store.checkPFEP(data[i].piece) !== -1){
                        this.suppliers[j].piecesFournies.push(data[i].piece);
                    }
                }
            }
        }
    }
    checkSupplierList() {
        for(let i = 0; i < this.suppliers.length; i++){
            let problems = []
            for(let j = 0; j < this.suppliers[i].piecesFournies.length; j++){
                let item = this.store.getItemFromPFEP(this.suppliers[i].piecesFournies[j]);
                if(item.supplier.phone !== this.suppliers[i].phone){
                    problems.push(item)
                }
            }
            console.log(this.suppliers[i].name);
            console.log(problems.length)
            console.log(problems)
        }
    }


    importSuppliersJSON(){
        fs.readFile('./suppliers.json', 'utf8', (err, jsonString) => {
            if(err){ console.log("Erreur lors de la lecture du fichier PFEP.json", err); return }
            try{
                let suppliersJSON = JSON.parse(jsonString);
                suppliersJSON.map((item, index) => {
                    this.suppliers.push(new Supplier(item, 'json'));
                })
            } catch(err) {
                console.log('Error parsing JSON string', err)
            }
        })

    }
    exportSuppliersJSON(){
        const jsonString = JSON.stringify(this.suppliers)
        fs.writeFile('suppliers.json', jsonString, (err) => {
            if(err){ console.log("Erreur lors de l'écriture du fichier PFEP.json", err) }
            else{ console.log('file successfully written') };
        })
    }
}

module.exports = Industry;