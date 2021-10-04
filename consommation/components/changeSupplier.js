const term = require('terminal-kit').terminal

class ChangeSupplier{
    constructor(app, part){
        this.app = app;
    }
    test = () => {
        console.log('test!')
    }
    managePartSupplier = (part) => {
        this.app.clearScreen(); const leftMargin = 5;
        //this.app.lastScreen = { screen: 'managePartSupplier', content: part }
        let str = 'Modification des données fournisseur'
        term.moveTo(term.width/2 - str.length/2, 2); term.bold.underline(str)
        term.moveTo(leftMargin, 3); term.bold.underline(`Fournisseurs actuels`)
        
        function createPad(val, length){
            if(val == undefined){ val = 'ND' }
            else if (typeof val !== 'string') { val = val.toString() }

            if (val.length > length) { val = val.substring(0, length) }
            else val = val.padEnd(length)
            return val
        }
        let header = createPad('Fournisseur', 20) +  ' | ' + createPad('Téléphone', 12) + ' | ' + createPad('Lead time moyen', 15) + ' | ' + createPad('Lead time max', 15)
        term.moveTo(leftMargin, 4); term.underline(header)
        part.supplier.forEach((s, i) => {
            term.moveTo(leftMargin, 5 + i);
            let string = createPad(s.name, 20) + ' | ' + createPad(s.phone, 12) + ' | ' + createPad(s.leadTime, 15) + ' | ' + createPad(s.leadTimeMax, 15)
            term(string)
        })

        let menuOptions = [
            'Changer fournisseur principal',
            'POSS AJOUT OPTIONS IN DEV'
        ]
        let options = term.singleColumnMenu(menuOptions, { y: 5, leftPadding: '\t\t\t\t\t\t\t\t\t\t', cancelable: true, keyBindings: { CTRL_Z: 'escape', ENTER: 'submit', UP:'previous', DOWN:'next'}}).promise
        options.then((res) => {
            console.log(res)
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