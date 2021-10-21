const term = require('terminal-kit').terminal

const phone = (number) => {
    if(typeof number !== 'string'){ number = number.toString() }
    return number.substring(0, 3) + '-' + number.substring(3, 6) + '-' + number.substring(6, 10)
    
}

class DisplaySuppliers{
    constructor(app){
        this.app = app
    }

    mainList = () => {
        this.app.clearScreen()
        this.app.lastScreen.screen = 'home'
        const createPad = (str, length) => {
            if(str){
                if(typeof str !== 'string'){ str = str.toString() }
                if (str.length > length) { str = str.substring(0, length) }
                else str = str.padEnd(length)
                return str
            } else return 'ND'
        }
        const leftMargin = 5;
        let str = 'Fournisseurs'
        term.moveTo(term.width/2-str.length/2, 2); term.bold.underline(str);
        let callback = term.singleColumnMenu([' '], { y: 1, selectedStyle: term, cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z:'escape' }}).promise
        callback.then((e) => {
            if(!e.canceled){ this.searchSupplier() }
        })
        term.moveTo(leftMargin, 3); term('Appuyer sur ENTER')
        term.moveTo(leftMargin, 4);
        term.bold.underline(createPad('Nom', 15) + '\t' + createPad('Téléphone', 15), '\n') + createPad('Leadtime', 10) + '\t' + createPad('Leadtime max', 15)
        this.app.industry.suppliers.map((supp, i) => {
            const filler = 'ND'
            term.column(leftMargin)
            let str = createPad(supp.name ? supp.name : filler, 15) + '\t' + createPad(phone(supp.phone) ? phone(supp.phone) : filler, 15) + '\t' + createPad(supp.leadTime ? supp.leadTime : filler, 10) + '\t' + createPad(supp.leadTimeMax ? supp.leadTimeMax : filler, 15)
            term(str); term('\n')

        })

    }
    searchSupplier = () => {
        this.app.clearScreen();
        this.app.lastScreen.screen = 'displaySuppliers';
        let str = 'Entrer nom du fournisseur'
        term.moveTo(term.width/2-str.length/2, 3); term.bold.underline(str);
        const autoComplete = this.app.industry.suppliers.map(s => s.name)
        let search = term.inputField(
            {
                y: 4,
                x: term.width/2-10,
                cancelable:true,
                autoCompleteHint:true,
                autoCompleteMenu:true,
                autoComplete:autoComplete,
                keyBindings: {
                    CTRL_Z: 'cancel',
                    ENTER: 'submit',
                    BACKSPACE: 'backDelete',
                    TAB: 'autoComplete',
                }
            }
        ).promise
        search.then((res) => {
            if(res !== undefined && typeof res == 'string'){
                this.displaySupplier(this.app.industry.getSupplierName(res))
            } else console.error('Invalid input @displaySuppliers.js at searchSupplier')            
        }).catch((e) => console.log(e))
    

    }
    displaySupplier = (supplier) => {
        this.app.clearScreen();
        //modifier fiche fournisseur, complique quand meme voir modifierFichePiece
        //this.app.lastScreen.screen = 'searchSupplier'

    }
}
module.exports = DisplaySuppliers;

/*
this.clearScreen();
        term.bold(`Fournisseurs: : ${this.industry.suppliers.length} fournisseurs trouvés\n`);
        let array = [];
        let source = this.industry.suppliers;
        source.sort()
        let headers = ['Fournisseur'];
        term.bold(); term(`Fournisseur`);
        term.column(35); term('# téléphone');
        term.column(50); term(`fax`);
        term.column(65); term('Qte fournie');
        term.column(75); term(`leadTime`);
        term.column(90); term('Adresse\n')
        for (let i = 0; i < source.length; i++) {

            let supplier = source[i];
            let absolute = false;
            if (supplier.piecesFournies.length !== 0 || absolute === true) {
                term(`${supplier.name}`);
                term.column(35); term(`${this.afficherTel(supplier.phone)}`);
                term.column(50); term(`${this.afficherTel(supplier.fax)}`);
                term.column(65); term(`${supplier.piecesFournies.length}`);
                term.column(75); term(`${supplier.leadTime}`)
                term.column(90);
                if (supplier.adresse) {
                    term(`${supplier.adresse.ville ? supplier.adresse.ville + ', ' : ''} ${supplier.adresse.etat ? supplier.adresse.etat + ', ' : ''}, ${supplier.adresse.pays ? supplier.adresse.pays : ''}\n`);
                }

            }

        }
        */