const term = require('terminal-kit').terminal;

class ficheSupplier{
    constructor(app){
        this.app = app;
    }

    displayAdress(supplier){
        let string = '';
        if(supplier.adresse){
            let object = {
                ville: supplier.adresse.ville ? supplier.adresse.ville + ', ' : '',
                etat: supplier.adresse.etat ? supplier.adresse.etat + ', ' : '',
                pays: supplier.adresse.pays ? supplier.adresse.pays : '',
            }
            return object.ville + object.etat + object.pays
        }
    }

    modifierAdresse(supplier) {
        let object = {};
        let pays = (object) => {
            term(`Entrer pays:`);
            term.inputField(
                { cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', UP: 'previous', DOWN: 'next', BACKSPACE: 'backDelete' } },
                (error, input) => {
                    object = { ...object, pays: input }
                    this.app.industry.getSupplier(supplier.phone).adresse = object;
                    //console.log(object)
                    this.modifierDetails(supplier)
                }
            )
        }
        let etat = (object) => {
            term(`Entrer etat:`);
            term.inputField(
                { cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', UP: 'previous', DOWN: 'next', BACKSPACE: 'backDelete' } },
                (error, input) => {
                    object = { ...object, etat: input }
                    pays(object);
                }
            )
        }
        let ville = () => {
            term.right(1); term('Adresse: ');
            term(`Entrer ville:`);
            term.inputField(
                { cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', UP: 'previous', DOWN: 'next', BACKSPACE: 'backDelete' } },
                (error, input) => {
                    object = { ...object, ville: input }
                    etat(object)
                }
            )
        }
        ville();
    }
    afficherPieces(supplier){
        this.app.clearScreen();
        this.app.lastScreen = {
            screen: 'afficherPiece',
            content: supplier
        }
        for(let i = 0; i < supplier.piecesFournies.length; i++){
            term('allo')
            term(supplier.piecesFournies[i]);
        }
    }
    changeLeadTime(input){

    }

    modifierDetails(supplier){
        
        this.app.lastScreen = {
            screen: 'afficherSupplier',
            content: supplier,
        }
        this.app.clearScreen();
        term.bold(`Modifier fiche de fournisseur\n`);
        term.bold(`Fournisseur: ${supplier.name}`);
        let menuItems = [
            `Téléphone: ${supplier.phone}`,                     //0
            `Fax: ${supplier.fax}`,                             //1
            `Adresse: ${this.displayAdress(supplier)}`,         //2
            `Lead time: ${supplier.leadTime}`,                  //3
            `Lead time max: ${supplier.leadTimeMax}`,            //4
            `Indice de confiance: ${supplier.indiceConfiance}`, //5

        ]
        term.singleColumnMenu(menuItems, { cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', UP: 'previous', DOWN: 'next' } }, (error, response) => {
            if (response.selectedIndex !== undefined) {


                term.moveTo(1, response.selectedIndex + 3);
                term.eraseLineAfter();
                let getField = () => {
                    let string = menuItems[response.selectedIndex];
                    let index = string.indexOf(':');
                    return string.slice(0, index + 1)
                }

                if(response.selectedIndex == 2){
                    this.modifierAdresse(supplier)
                }
                else if(response.selectedIndex === 3 || response.selectedIndex === 4){
                    if(response.selectedIndex === 3){ term(`Lead time: `) }
                    else{ term(`Lead time max: `) }
                    term.inputField(
                        {cancelable: true, keyBindings:{ ENTER:'submit', BACKSPACE: 'backDelete', CTRL_Z: 'cancel'}},
                        (error, input) => {
                            if(response.selectedIndex === 3){ supplier.leadTime = Number(input) }
                            else{ supplier.leadTimeMax = Number(input)}
                            this.modifierDetails(supplier);

                        })

                }
                else{
                    term.right(1); term(getField()); term.inputField((error, input) => {
                        switch (response.selectedIndex) {
                            case 0: { supplier.phone = input; this.modifierDetails(supplier); break; }
                            case 1: { supplier.fax = input; this.modifierDetails(supplier); break; }
                            //case 2: { supplier.adresse = this.modifierAdresse(supplier); this.modifierDetails(supplier); break; }
                            case 3: { supplier.leadTime = this.changeLeadTime(input); this.modifierDetails(supplier); break; }
                            case 4: { supplier.leadTimeMax = this.changeLeadTime(input); this.modifierDetails(supplier); break; }
                            case 5: { supplier.indiceConfiance = input; this.modifierDetails(supplier); break; }
                            //case 4: { item.specs.width = input; this.modifierDetails(supplier); break; }
                            //case 5: { item.specs.height = input; this.modifierDetails(supplier); break; }
                            //case 6: { item.specs.weight = input; this.modifierDetails(supplier); break; }
                            //case 7: { item.consommation.annuelle = input; this.modifierDetails(supplier); break; }
                            //case 8: { item.consommation.mensuelleMoy = input; this.modifierDetails(supplier); break; }
                            //case 9: { item.consommation.mensuelleMax = input; this.modifierDetails(supplier); break; }
                            //case 10: { item.consommation.commandeType = input; this.modifierDetails(supplier); break; }
                            //case 11: { item.consommation.freqReappro = input; this.modifierDetails(supplier); break; }
                        }
                    })
                }
            }
        })
    }


    afficherSupplier(supplier){
        this.app.clearScreen();
        this.app.lastScreen = {
            screen: 'home',
            content: supplier
        }
        term.bold(`Fiche fournisseur ${supplier.name}\n`);
        term(`Téléphone: ${supplier.phone ? this.app.afficherTel(supplier.phone) : ''}\n`);
        term(`Fax: ${supplier.fax ? this.app.afficherTel(supplier.fax) : ''}\n`);
        term(`Adresse: ${this.displayAdress(supplier)}\n`)        
        term(`Nombre de pièces fournie: ${supplier.piecesFournies ? supplier.piecesFournies.length : ''}\n`);
        term(`Lead time moyen: ${supplier.leadTime ? supplier.leadTime : ''}\n`);
        term(`Lead time max: ${supplier.leadTimeMax ? supplier.leadTimeMax : ''}\n`);
        let menuItems = [
            'Modifier fiche fournisseur',
            'Afficher pièces fournisseur',
        ] 
            
        term.singleColumnMenu(menuItems,
            { cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', DOWN:'next', UP:'previous' }},
            (error, response) => {
                if(response !== undefined){
                    if(response.selectedIndex == 0){
                        this.modifierDetails(supplier)
                    }
                }
            })


    }
}

module.exports = ficheSupplier;