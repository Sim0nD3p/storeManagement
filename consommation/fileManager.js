const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const Store = require(`./store`);
const DataAnalyser = require('./dataAnalyser');
const term = require('terminal-kit').terminal;
const Item = require('./item');



class FileManager{
    constructor(app){
        this.currentOrderDate;
        this.store = app.store;
        this.industry = app.industry;
        this.dataAnalyser = app.dataAnalyser;
        this.app = app

    }
    clearScreen(){
        process.stdout.write('\u001b[3J\u001b[1J');
        term.clear();
        console.clear();
    }
    selectPFEP() {
        this.clearScreen()
        term.bold("Sélection du ficher PFEP source utilisé pour bâtir la base de donnée\n");
        term('*Appuyer sur [TAB] pour faire apparître les options et sur les flèches pour naviguer\n');
        //term("La liste des pièces du PFEP est necéssaire pour ne prendre en compte que ces éléments lors du calcul des consommation mensuelles et anuelles\n")
        term('Choix du fichier: ');
        term.fileInput(
            { baseDir: '../', cancelable: true, keyBindings: { CTRL_Z: 'cancel', ENTER: 'submit', BACKSPACE:'backDelete', TAB:'autoComplete'}},
            (error, input) => {
                if (error) { term.red.bold("\nErreur: " + error + "\n") }
                else {
                    term.green("\nFichier choisi '%s'\n", input);
                    this.importCSV(input, 'PFEP');
                    this.selectSuppliers();
                }
            }
        );
    }
    selectOrders() {
        this.clearScreen();
        term.bold("Sélection du fichier utilisé pour construire l'historique des achats\n");
        term('*Appuyer sur [TAB] pour faire apparître les options et sur les flèches pour naviguer\n');
        term('Choix du fichier: ');
        term.fileInput(
            { baseDir: '../', cancelable: true, keyBindings: { CTRL_Z: 'cancel', ENTER: 'submit', BACKSPACE:'backDelete', TAB:'autoComplete'}},
            (error, input) => {
                if (error) { term.red.bold('\n Erreur \n') }
                else {
                    term.green("\nFichier choisi '%s'\n", input);
                    this.importCSV(input, 'orders');
                }
            }
        )
    }

    selectSuppliers() {
        this.clearScreen();
        term("Sélection du fichier source des fournisseurs\n");
        term("Fichier necéssaire pour associer les fournisseurs aux pièces\n");
        term('*Appuyer sur [TAB] pour faire apparître les options et sur les flèches pour naviguer\n');
        term('Choix du fichier: ');
        term.fileInput(
            { baseDir: '../', cancelable: true, keyBindings: { CTRL_Z: 'cancel', ENTER: 'submit', BACKSPACE:'backDelete', TAB:'autoComplete'}},
            (error, input) => {
                if (error) { term.red.bold('\n Erreur \n') }
                else {
                    term.green("\nFichier choisi '%s'\n", input);
                    this.importCSV(input, 'fournisseurs');
                    this.selectOrders()
                }
            }
        )
    }

    createDate(dateStr){
        let object = {
            year: parseInt(dateStr.slice(0, 4)),
            month: parseInt(dateStr.slice(5, 7)),
            day: parseInt(dateStr.slice(8, 10)),
        }
        return object
    }

    /**
     * 
     * @param {*} data 
     * @returns only real part order with the date else returns null
     */
    formatOrderData = (data) => {
        if(data.date){ this.currentOrderDate = data.date };
        if(data.fournisseur){ this.currentOrderFournisseur = data.fournisseur };
        if(data.piece && data.nombre){
            if(!data.date){ data.date = this.currentOrderDate }
            if(!data.fournisseur){ data.fournisseur = this.currentOrderFournisseur }
            if(data.piece.length == 10 && data.piece.charAt(4) == '-' && data.piece.charAt(7) == '-' && data.piece.charAt(6) == 9){
                data.piece = 'SEP-' + data.piece.slice(0, 4)
            }
            let object = {
                piece: data.piece,
                nombre: data.nombre,
                date: this.createDate(data.date),
                fournisseur: data.fournisseur,
            }
            return object
        } else { return null}
    }
    //verification purpose only
    checkForDouble(){
        if(this.store.inventory.length == this.store.partList.length){
            console.log(`total of ${this.store.partList.length} pieces`);
        }
        this.store.inventory.map((piece, index) => {
        })
        /* let array = [];
        for(let i = 0; i < this.store.inventory.length; i++){
            let object = this.store.inventory[i];
            let currentN = 0;
            for(let j = 0; j < this.store.inventory.length; j++){
                if(object.code == this.store.inventory[j].code){
                    currentN++;
                }
            }
            array[i] = currentN;
        } */
        //console.dir(array, {maxArrayLength: null});
    }
    formatSupplierData(data) {
        if (data.phone) {
            let string = '';
            for (let n = 0; n < data.phone.length; n++) {
                let c = data.phone.charAt(n);
                if (isNaN(Number(c)) === false && c !== ' ') {
                    string += c
                }
            }

            data.phone = string
        }
        if (data.fax) {
            let string = '';
            for (let n = 0; n < data.fax.length; n++) {
                let c = data.fax.charAt(n);
                if (isNaN(Number(c)) === false && c !== ' ') {
                    string += c
                }
            }

            data.fax = string

        }
        return data

    }

    importCSV = (file, type) => {
        let rowN = 0;
        let array = [];
        fs.createReadStream(file)
        .pipe(csv({
            separator: ';',
        }))
        .on('data', (data) => {
            rowN++;
            let object;
            if(type == 'orders'){ object = this.formatOrderData(data) }
            else if(type == 'PFEP'){ object = data }
            else if(type == 'fournisseurs'){ object = this.formatSupplierData(data) }

            if(object){
                array.push(object)
            }
        })
        .on('end', () => {
            //      (this.store.getItem('SEP3947G').history);
            if(type == 'orders'){
                //term("\n Achats importés! \n");
                this.store.addOrderToStore(array);
                this.industry.addPartsToSupplier(array);
                
                //console.dir(array, {maxArrayLength:null})
                

            }
            else if(type == 'PFEP'){
                array.map((piece, index) => {
                    this.store.PFEP_partList.push(piece.code);
                })
                console.log('should gen PFEP');
                this.store.generatePFEP(array)
                
            }
            else if(type == 'fournisseurs'){
                //console.log(array);
                this.industry.createSupplierList(array)
                //this.app.home()
                
            }


            //console.dir(this.store.partList, {maxArrayLength: null});
        })

    }
    


}


module.exports = FileManager;