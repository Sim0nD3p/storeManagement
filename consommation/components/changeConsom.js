const term = require('terminal-kit').terminal;
const Functions = require('../functions');

class ChangeConsom{
    constructor(app){
        this.app = app
        this.functions = new Functions()
    }

    modifyData = (part) => {
        let bluePrints = [
            { prop: 'mensuelleMoy', name: 'Mensuelle moyenne: ', },
            { prop: 'mensuelleMax', name: 'Mensuelle maximale: ', },
            { prop: 'anuelle', name: 'Anuelle moyenne: ', },
            { prop: 'freqReappro', name: 'Fréquence de réapprovisionnement: ', },
            { prop: 'commandeType', name: 'Commande type: ', },
        ]
        let selector = term.singleColumnMenu(
            bluePrints.map(p => p.name + part.consommation[p.prop]),
            {leftPadding:'', y: 15, cancelable: true, keyBindings: { CTRL_Z: 'escape', ENTER: 'submit', UP:'previous', DOWN:'next'}}
        ).promise
        selector.then((res) => {
            if(!res.canceled){
                let input = term.inputField({ x: bluePrints[res.selectedIndex].name.length, y: 15 + res.selectedIndex, maxLength: 5, cancelable: true, keyBindings: { ENTER: 'submit', BACKSPACE: 'backDelete', CTRL_Z: 'cancel'}}).promise
                input.then((data) => {
                    term.moveTo(bluePrints[res.selectedIndex].name.length, 15+res.selectedIndex); term.red(data);
                    this.app.store.getItemFromPFEP(part.code).consommation[bluePrints[res.selectedIndex].prop] = Number(data)
                    //console.log(part.consommation[bluePrints[res.selectedIndex].prop])
                    let SS = this.functions.safetyStock(part.supplier[0].leadTime, part.supplier[0].leadTimeMax, part.consommation.mensuelleMoy, part.consommation.mensuelleMax)
                    let qte = this.functions.maxQty(part.consommation.freqReappro, part.consommation.mensuelleMoy, SS)
                    this.app.store.getItemFromPFEP(part.code).qteMax = Number(qte)
                    this.app.store.getItemFromPFEP(part.code).stockSecurite = Number(SS)
                    term.moveTo(2*term.width/3, 5); term(`Stock de sécurité mis à jour: ${SS}`)
                    term.moveTo(2*term.width/3, 6); term(`Quantité maximale mise à jour: ${qte}`)
                    term.moveTo(2*term.width/3, 7); term(`Ancien nombre de contenants: ${part.storage.length}`)
                    let containers = this.app.store.storeManager.getNewStorage(part, part.qteMax);
                    term.moveTo(2*term.width/3, 8); term(`Nouveau nombre de contenants: ${containers.length}`)

                    console.log(containers.length)
                    this.modifyData(part)

                })

            }
        }).catch((e) => console.log(e))

    }

    menu(part){
        let str = `Modification des données de consommation`
        term.moveTo(term.width/2-str.length/2, 2); term.bold.underline(str)

        const menuItems = ['Entrer manuelle des données', 'Calcul automatique selon historique de commandes'];
        let menu = term.singleColumnMenu(menuItems, { cancelable: true, keyBindings: { CTRL_Z: 'escape', ENTER: 'submit', DOWN: 'next', UP: 'previous' } }).promise

        menu.then((res) => {
            if(!res.canceled){
                if(res.selectedIndex == 0){
                    this.modifyData(part)

                    
                    

                }
                else if(res.selectedIndex == 1){

                }
            }
        })
    }
}

module.exports = ChangeConsom;