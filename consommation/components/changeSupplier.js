const term = require('terminal-kit').terminal
const Part = require('../Part');
const Functions = require('../functions')

class ChangeSupplier{
    constructor(app, part){
        this.app = app;
        this.functions = new Functions()
    }
    test = () => {
        console.log('test!')
    }
    managePartSupplier = (part) => {
        this.app.clearScreen(); const leftMargin = 5;
        //this.app.lastScreen = { screen: 'managePartSupplier', content: part }
        let str = 'Modification des données fournisseur'
        term.moveTo(term.width/2 - str.length/2, 2); term.bold.underline(str)
        term.moveTo(term.width/2+10, 3); term.bold.underline(`Fournisseurs potentiels actuels`)
        
        function createPad(val, length){
            if(val == undefined){ val = 'ND' }
            else if (typeof val !== 'string') { val = val.toString() }

            if (val.length > length) { val = val.substring(0, length) }
            else val = val.padEnd(length)
            return val
        }
        let header = createPad('Fournisseur', 20) +  ' | ' + createPad('Téléphone', 12) + ' | ' + createPad('Lead time moyen', 15) + ' | ' + createPad('Lead time max', 15)
        term.moveTo(term.width - header.length, 4); term.underline(header)
        part.supplier.forEach((s, i) => {
            let string = createPad(s.name, 20) + ' | ' + createPad(s.phone, 12) + ' | ' + createPad(s.leadTime, 15) + ' | ' + createPad(s.leadTimeMax, 15)
            term.moveTo(term.width-string.length, 5 + i);
            term(string)
        })

        let menuOptions = [
            'Changer fournisseur principal',
            'POSS AJOUT OPTIONS IN DEV'
        ]
        let options = term.singleColumnMenu(menuOptions, { y: 5, leftPadding: '\t', cancelable: true, keyBindings: { CTRL_Z: 'escape', ENTER: 'submit', UP:'previous', DOWN:'next'}}).promise
        options.then((res) => {
            term.moveTo(leftMargin, 10); term.bold('Entrer nom fournisseur:\n')
            term.moveTo(leftMargin, 11); term(`**Utiliser la saisie automatique avec TAB\n`)
            const suppliers = this.app.industry.suppliers.map(s => s.name)
            let supplierInput = term.inputField({ x: leftMargin,  cancelable: true, autoComplete: suppliers, autoCompleteMenu: 'true', keyBindings: { ENTER: 'submit', CTRL_Z: 'cancel', BACKSPACE: 'backDelete', TAB: 'autoComplete' }}).promise
            supplierInput.then((res) => {
                if(res !== undefined){
                    if (this.app.industry.getSupplierName(res).leadTime && this.app.industry.getSupplierName(res).leadTimeMax) {
                        this.app.store.getItemFromPFEP(part.code).supplier.unshift(this.app.industry.getSupplierName(res))
                        for(let i = 0; i < 2; i++){
                            if(part.supplier[i]){
                                let SS = this.functions.safetyStock(
                                    part.supplier[i].leadTime,
                                    part.supplier[i].leadTimeMax,
                                    part.consommation.mensuelleMoy,
                                    part.consommation.mensuelleMax
                                )
                                let qte = this.functions.maxQty(
                                    part.consommation.freqReappro,
                                    part.consommation.mensuelleMoy,
                                    SS
                                )
                                let containers = this.app.store.storeManager.getNewStorage(part, qte)

                                console.log(`qte: ${qte}`)
                                console.log(containers.length)
                            }

                        }
                        
                    }
                    else {
                        console.log('error')
                    }
                }
            }).catch((e) => console.log(e))
        }).catch((e) => console.log(e))

        //selectionner fournisseur principal a partir de la liste
        //creer nouveau fournisseur
        //modifier fournisseur
    }

    getSuppliersList = () => {
        let i = this.app.industry
    }

}
module.exports = ChangeSupplier