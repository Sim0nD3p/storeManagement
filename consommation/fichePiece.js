const term = require('terminal-kit').terminal;
const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'décembre'];
const containerData = require('./containers/containerData');

class FichePiece{
    constructor(app){
        this.app = app;
        this.PFEP = app.store.PFEP;
        this.dataAnalyser = this.app.dataAnalyser;
        this.industry = this.app.industry;
    }

    clearScreen(){
        process.stdout.write('\u001b[3J\u001b[1J');
        term.clear();
        console.clear();
    }


    displayMonthlyAve(item){
        let total = 0; let length = 0;
        for(const month in item.consommation.mensuelleMoy){
            total += item.consommation.mensuelleMoy[month];
            length++;
        }
        return Math.floor(total/length)
    }
    afficherHistoriqueAchats(item){
        this.app.lastScreen = {
            screen: 'afficherPiece',
            content: item,
        }
        this.clearScreen();
        let orderCount = 0;
        for(const year in item.history){
            term.right(5); term.bold(`${year}:\n`);
            for(const month in item.history[year]){
                term.right(10); term.bold(`${months[month - 1]}: `);
                for(const day in item.history[year][month]){
                    orderCount++;
                    term(`^+${day}^:: ${item.history[year][month][day]}\n`)

                }
            }
        }
        term(`\n${orderCount} commande faites pour la pièce ${item.code} chez ${item.supplier.name}`)

    }
    calculConsom(item){
        this.app.lastScreen = {
            screen: 'afficherPiece',
            content: item,
        }
        this.clearScreen();
        let menuItems = [
            'Calculer tous les champs selon les paramètres par défault (voir section infos)',       //0
            'Calculer consommation anuelle moyenne',    //1
            'Calculer consommation mensuelle moyenne',  //2
            'Calculer consommation mensuelle maximale', //3
            'Calculer fréquence de réapprovisionnement',//4
            'Calculer commande type',                   //5
        ]
        term.bold(`Calcul des consommation pour la pièce ${item.code}`);
        term.singleColumnMenu(menuItems, {cancelable:true, keyBindings: {ENTER: 'submit', UP:'previous', DOWN:'next', CTRL_Z: 'escape'}}, (error, response) => {
            let lastScreenObject = { screen: 'calculConsom', content: item };
            if(response.selectedIndex === 0){
                this.app.lastScreen = lastScreenObject;
                term("Entrer l'année de début:")
                term.inputField({cancelable: true, keyBindings: {ENTER: 'submit', CTRL_Z:'cancel'}}, (error, input) => {
                    if(isNaN(Number(input)) === false && input.length === 4){
                        item.setConsom(Number(input));
                        console.log(item);
                        //this.afficherPiece(item);
                        //this.afficherPieceAfterCleanup(item);
                    }
                })
            }
            else if(response.selectedIndex === 1){
                this.app.lastScreen = lastScreenObject;
                term("Entrer l'année de début:")
                term.inputField({cancelable: true, keyBindings: {ENTER: 'submit', CTRL_Z:'cancel', BACKSPACE: 'backDelete' }}, (error, input) => {
                    if(isNaN(Number(input)) === false && input.length === 4){
                        item.consommation.annuelle = this.dataAnalyser.annualAve(item, Number(input));
                        this.clearScreen();
                        this.app.goBack();
                        //this.afficherPieceAfterCleanup(item);
                    }
                })
            }
            else if(response.selectedIndex === 2){
                this.app.lastScreen = lastScreenObject;
                term("Entrer la date de début au format MM-AAAA:")
                term.inputField({cancelable: true, keyBindings: {ENTER: 'submit', CTRL_Z:'cancel', BACKSPACE: 'backDelete' }}, (error, input) => {
                    if(input !== undefined){
                        if(isNaN(Number(input.slice(0, 2))) === false && isNaN(Number(input.slice(3))) === false && input.length === 7){
                            let startDate = {
                                year: Number(input.slice(3)),
                                month: Number(input.slice(0, 2))
                            }
                            term('\nEntrer le nombre de mois sur lequel baser la moyenne ou entrer "auto" pour baser la moyenne sur la fréquence de réapprovisionnement: ')
                            term.inputField({cancelable: true, keyBindings: {ENTER: 'submit', CTRL_Z:'cancel'}}, (error, input) => {
                                if(isNaN(Number(input)) === false || input == 'auto'){
                                    if(isNaN(Number(input)) === false){ input = Number(input) }
                                    item.consommation.mensuelleMoy = this.dataAnalyser.monthlyAve(item, startDate, input, true);
                                    this.clearScreen();
                                    this.afficherPieceAfterCleanup(item);
                                }
                            })
                        }
                    }
                })

            }
            else if(response.selectedIndex === 3){
                console.log('in DEV');

            }
            else if(response.selectedIndex === 4){
                console.log('in DEV')

            }
            else if(response.selectedIndex === 5){
                console.log('in DEV')

            }


        })

    }
    addSupplier(item){
        this.clearScreen();
        term(`Ajouter un fournisseur pour la pièce ${item.code}\n`);
        term(`Pour ajouter un nouveau fournisseur, utiliser l'opion créer nouveau fournisseur dans le menu principal\n`);
        let autoComplete = [];
        this.industry.suppliers.map((supplier, index) => { autoComplete.push(supplier.name) });
        term.inputField({ cancelable:true, autoComplete: autoComplete, autoCompleteMenu: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'cancel', TAB: 'autoComplete', BACKSPACE: 'backDelete' }},
            (error, input) => {
                if(input !== undefined){
                    let targetSupplierPhone;
                    for(let i = 0; i < this.industry.suppliers.length; i++){
                        if(input == this.industry.suppliers[i].name){
                            targetSupplierPhone = this.industry.suppliers[i].phone
                        }
                    }
                    this.app.store.getItemFromPFEP(item.code).supplier.push(this.industry.getSupplier(targetSupplierPhone));
                    this.industry.getSupplier(targetSupplierPhone).checkForParts(this.app.store.PFEP);
                    this.modifierDetails(item);
                }

            })
    }
// / keyBindings: { ENTER: 'submit', CTRL_Z:'cancel', TAB: 'autoComplete', BACKSPACE:'backDelete'}
    changeSupplier = (item, index) => {
        this.app.lastScreen = {
            screen: 'modfierDetails',
            content: item
        }
        this.clearScreen()
        term.bold('Sélection du fournisseur\n')
        term('Utiliser la touche TAB pour voir les options disponnibles\n');
        term('Pour enlever la fournisseur de la liste pour cette piece, entrer "supprimer"\n');
        let autoComplete = [];
        this.industry.suppliers.map((element, index) => { autoComplete.push(element.name) });       //autocomplete
        term.inputField(
            { autoComplete: autoComplete, autoCompleteMenu: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'cancel', TAB: 'autoComplete', BACKSPACE: 'backDelete' }},
            (error, input) => {
                if(input !== undefined){
                    
                    let oldSupplierPhone = item.supplier[index].phone;
                    let targetSupplierPhone = -1;
                    for(let i = 0; i < this.industry.suppliers.length; i++){
                        if(input == this.industry.suppliers[i].name){
                            targetSupplierPhone = this.industry.suppliers[i].phone
                        }
                    }
                    if(targetSupplierPhone !== -1 || input == 'supprimer'){
                        this.app.store.getItemFromPFEP(item.code).supplier.splice(index, 1);
                        this.app.industry.getSupplier(oldSupplierPhone).checkForParts(this.app.store.PFEP);
                        if(targetSupplierPhone !== -1){
                            this.app.store.getItemFromPFEP(item.code).supplier.push(this.app.industry.getSupplier(targetSupplierPhone));
                            this.app.industry.getSupplier(targetSupplierPhone).checkForParts(this.app.store.PFEP);
                        }
                    } else {
                        term.bold.red('Entrée invalide\n');
                        term('Appuyer sur CRTL + Z pour retourner en arrière\n');
                    }
                    this.modifierDetails(item);
                }
            }
        )

    }

    changeContainer(item){
        this.clearScreen();
        term.bold(`Choisir type de contenant pour la pièce ${item.code}\n`);
        let menuItems = [];
        containerData.map((container, index) => { menuItems.push(container.type) })
        //this.app.store.containers.map((container, index) => { menuItems.push(container.type) })
        term.singleColumnMenu(menuItems,
            {cancelable:true, keyBindings:{ ENTER:'submit', CTRL_Z:'escape', UP:'previous', DOWN:'next'}},
            (error, response) => {
                if(response !== undefined){
                    term('\n');
                    term('Choisir ce bac?');
                    term.singleRowMenu(['Oui', 'Non'], {cancelable: true, keyBindings:{CTRL_Z:'escape', ENTER: 'submit', RIGHT:'next', LEFT:'previous'}},
                    (error, response) => {
                        if(response.selectedIndex === 0){ this.modifierDetails(item)}
                        else if(response.selectedIndex === 1){ this.changeContainer(item)}
                    })
                }
            })

    }


    modifierDetails(item){
        this.app.lastScreen = {
            screen: 'afficherPiece',
            content: item,
        }
        this.clearScreen();
        term('in DEV');
        term.bold(`Modifier ficher de pièce\n`);
        term.bold(`Pièce: ${item.code}`);
        let menuItems = [
            `Description: ${item.description}`,         //0
            `Famille: ${item.family}`,                  //1
            `Tag: ${item.tag}`,                                      
            `Classe d'utilisation: ${item.class}`,      //2
            `Utilité: ${item.utilite}`,                 //3
            `Profondeur: ${item.specs.length}`,         //4
            `Largeur: ${item.specs.width}`,             //5
            `Hauteur: ${item.specs.height}`,            //6
            `Masse: ${item.specs.weight}`,              //7
            `Consommation annuelle moyenne: ${item.consommation ? item.consommation.annuelle : null}`,          //8
            `Consommation mensuelle moyenne: ${item.consommation ? item.consommation.mensuelleMoy : null}`,     //9
            `Consommation mensuelle maximale: ${item.consommation ? item.consommation.mensuelleMax : null}`,    //10
            `Commande typique: ${item.consommation ? item.consommation.commandeType : null}`,                   //11
            `Fréquence de réapprovisionnement: ${item.consommation ? item.consommation.freqReappro : null}`,    //12
            `Stock de sécrité: ${item.stockSecurite ? item.stockSecurite : null}`,                              //13
            `Quantité maximale: ${item.qteMax ? item.qteMax : ''}`,                                             //14
            `Type emballage fournisseur: ${item.emballage.fournisseur.type ? item.emballage.fournisseur.type : null}`,                      //15
            `Nombre pièces emballage fournisseur: ${item.emballage.fournisseur.nbPieces ? item.emballage.fournisseur.nbPieces : null}`,     //16
            `Type emballage Techno-Fab: ${item.emballage.TF.type ? item.emballage.TF.type.type : null}`,                                    //17
            `Nombre pièces emballage Techno-Fab: ${item.emballage.TF.nbPieces ? item.emballage.TF.nbPieces : null}`,                        //18
            //`Fournisseur: ${item.supplier ? item.supplier.name : ''}`,              //12

        ]
        item.supplier.map((supplier, index) => { menuItems.push(`Fournisseur: ${supplier ? supplier.name : ''}`) })
        menuItems.push('Ajouter fournisseur')
        term.singleColumnMenu(menuItems, { cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', UP: 'previous', DOWN: 'next' } }, (error, response) => {
            if (response.selectedIndex !== undefined) {


                term.moveTo(1, response.selectedIndex + 3);
                term.eraseLineAfter();
                let getField = () => {
                    let string = menuItems[response.selectedIndex];
                    let index = string.indexOf(':');
                    return string.slice(0, index + 1)
                }
                if(response.selectedIndex >= 20 + item.supplier.length){
                    if(response.selectedIndex == menuItems.length - 1){
                        this.addSupplier(item);
                    }
                    else {
                        term.right(1); term(getField());
                        this.changeSupplier(item, response.selectedIndex - 21)
                    }

                }
                else if(response.selectedIndex === 18){
                    this.changeContainer(item);

                }
                else{
                    term.right(1); term(getField()); term.inputField((error, input) => {
                        switch (response.selectedIndex) {
                            case 0: { item.description = input; this.modifierDetails(item); break; }
                            case 1: { item.family = input; this.modifierDetails(item); break; }
                            case 2: { item.tag = input; this.modifierDetails(item); break; }
                            case 3: { item.class = input; this.modifierDetails(item); break; }
                            case 4: { item.utilite = input; this.modifierDetails(item); break; }
                            case 5: { item.specs.length = input; this.modifierDetails(item); break; }
                            case 6: { item.specs.width = input; this.modifierDetails(item); break; }
                            case 7: { item.specs.height = input; this.modifierDetails(item); break; }
                            case 8: { item.specs.weight = input; this.modifierDetails(item); break; }
                            case 9: { item.consommation.annuelle = input; this.modifierDetails(item); break; }
                            case 10: { item.consommation.mensuelleMoy = input; this.modifierDetails(item); break; }
                            case 11: { item.consommation.mensuelleMax = input; this.modifierDetails(item); break; }
                            case 12: { item.consommation.commandeType = input; this.modifierDetails(item); break; }
                            case 13: { item.consommation.freqReappro = input; this.modifierDetails(item); break; }
                            case 14: { item.stockSecurite = input; this.modifierDetails(item); break; }
                            case 15: { item.qteMax = Number(input); this.modifierDetails(item); break; }
                            case 16: { item.emballage.fournisseur.type = input; this.modifierDetails(item); break; }
                            case 17: { item.emballage.fournisseur.nbPieces = input; this.modifierDetails(item); break; }
                            case 18: { item.emballage.TF.type = input; this.modifierDetails(item); break; }
                            case 19: { item.emballage.TF.nbPieces = input; this.modifierDetails(item); break; }
                            //case 18: { item.stockSecurite = Number(input); this.modifierDetails(item); break; }
                            }
                    })
                }
                
            }


        })
        /* if(item.supplier){
            term(`^+Infos fournisseur:\n`);
            term.right(5); term(`^+Fournisseur^:: ${item.supplier.name}\n`);
            term.right(5); term(`^+Téléphone^:: ${item.supplier.phone}\n`);
            term.right(5); term(`^+Localisation^:: ${item.supplier.adresse.ville + ', ' + item.supplier.adresse.etat + ', ' + item.supplier.adresse.pays}\n`);
            term.right(5); term(`^+Nombre de pièce fournie^:: ${item.supplier.nbPiecesFournies}\n`);
        } */
        /* term.yesOrNo((err, result) => {
            if(result == true){ item.afficherDetails()};
        }) */

    }
    modifierEntreposage(item){
        this.app.lastScreen = {
            screen: 'modifierEntreposage',
            content: item
        }
        this.clearScreen();
        term.bold(`Modifier les propriétées d'entreposage\n`);
        term(`Type de contenant:`)

        let menuItems = [
            'Bac',
            'Bundle',
            'Palette',
            'Racking',
            'Étagère',            
        ]
        term.singleColumnMenu(menuItems,
            { cancelable: true, keyBindings:{ ENTER: 'submit', CTRL_Z: 'escape', UP: 'previous', DOWN:'next'}},
            (error, response) => {
                if(response !== undefined){
                    if(response.selectedIndex === 0){
                        term(`\nChoisir type de Bac`);
                        term.singleLineMenu(
                            containerData.map(container => container.type),
                            { cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', RIGHT: 'next', LEFT: 'previous' }},
                            (error, response) => {
                                //term.eraseLineBefore();
                                //term(`Bac choisi: ${response.selectedText}\n`)
                                term('\n\nEntrer le nombre de pièces par bac\n');
                                term.inputField(
                                    { keyBindings: { ENTER: 'submit', CTRL_Z:'escape', BACKSPACE: 'backDelete' }},
                                    (error, input) => {
                                        if(!isNaN(Number(input))){
                                            if(item.specs && !isNaN(item.specs.weight) && 25 / item.specs.weight < Number(input)){
                                                term('\nLe nombre de pièce dépasse la charge maximale permise par bac de (25kg)');
                                            }
                                            item.emballage.TF.nbPieces = Number(input);
                                            item.emballage.TF.type = response.selectedText;
                                            this.app.store.storeManagerDesk(response.selectedText, item, Math.ceil(item.qteMax))
                                            this.afficherPiece(item)


                                        }
                                        else{ term.red('\nEntrée non valide, veuillez entrer un chiffre\n'); term('Appuyer sur [CTRL + Z] pour recommencer') }
                                    }
                                )
                                //TERM.INPUTFIELD POUR RENTRER LE NOMBRE DE PIECES PAR CONTENANT 
                                //console.log(response.selectedText);
                                //this.app.store.storeManager.bacManager(response.selectedText, item, Math.ceil(item.qteMax));
                                //this.afficherPiece(item)
                            })

                    }
                }
                
            }
        )
    }

    afficherPiece = (item) => {
        this.clearScreen()
        setTimeout((item) => {
            this.afficherPieceAfterCleanup(item)
        }, 10, item);
    }

    afficherPieceAfterCleanup = (item) => {
        //if (this.app.lastScreen.screen == 'rechercherItem') {
            //console.log(item);


            term.bold(`Fiche de pièce`)
            term(`\n^+Pièce^:: ${item.code}\n`);
            term(`^+Description^:: ${item.description ? item.description : 'ND'}\n`);
            term(`^+Famille^:: ${item.family ? item.family : 'ND'}\n`);
            term(`^+Tag^:: ${item.tag ? item.tag : 'ND'}\n`);
            term(`^+Classe d'utilisation^:: ${item.class ? item.class : 'ND'}\n`);
            term(`^+Utilité:^: ${item.utilite ? item.utilite : 'ND'}\n`)
            term(`^+Spécifications:\n`);
            term.right(5); term(`^+Profondeur^:: ${item.specs.length ? item.specs.length : 'ND'} mm \n`);
            term.right(5); term(`^+Largeur^:: ${item.specs.width ? item.specs.width : 'ND'} mm \n`);
            term.right(5); term(`^+Hauteur^:: ${item.specs.height ? item.specs.height : 'ND'} mm \n`);
            term.right(5); term(`^+Masse^:: ${item.specs.weight} kg \n`)
            if (!item.consommation) { item.setConsom(2017) }
            term(`^+Informations de consommation\n`);
            term.right(5); term(`^+Consommation anuelle moyenne^:: ${Math.ceil(item.consommation.annuelle)}\n`);
            term.right(5); term(`^+Consommation mensuelle moyenne^:: ${Math.ceil(item.consommation.mensuelleMoy)}\n`)
            term.right(5); term(`^+Consommation mensuelle maximale^:: ${Math.ceil(item.consommation.mensuelleMax)}\n`)
            term.right(5); term(`^+Commande typique^:: ${Math.floor(item.consommation.commandeType)}\n`)
            term.right(5); term(`^+Fréquence de réapprovisionnement^:: ${Math.ceil(item.consommation.freqReappro)}\n`)
            term.right(5); term(`^+Stock de sécurité:^: ${item.stockSecurite ? Math.ceil(item.stockSecurite) : 0}\n`);
            
            term(`^+Quantité maximale:^: ${item.qteMax ? Math.ceil(item.qteMax) : ''}\n`)
            term(`^+Emballage:\n`);
            term.right(5); term(`^+Emballage fournisseur\n`);
            term.right(10); term(`^+Type:^: ${item.emballage.fournisseur.type ? item.emballage.fournisseur.type : 'N/A'}\n`);
            term.right(10); term(`^+Nombre de pièces:^: ${item.emballage.fournisseur.nbPieces ? item.emballage.fournisseur.nbPieces : 'N/A'}\n`);

            term.right(5); term(`^+Emballage Techno-Fab\n`);
            if(item.emballage.TF.type){
                term.right(10); term(`^+Type:^: ${item.emballage.TF.type}\n`);
                //term.right(15); term(`^+Description:^: ${item.emballage.TF.type.description}\n`)
                //term.right(15); term(`^+Dimensions (mm):^: ${item.emballage.TF.type.outside.length} x ${item.emballage.TF.type.outside.width} x ${item.emballage.TF.type.outside.height}\n`)
            } else { term.right(10); term('Emballage non defini\n') }

                term.right(10); term(`^+Nombre de pièces:^: ${ item.emballage.TF.nbPieces ? item.emballage.TF.nbPieces : 'N/A' } \n`);
                
            if (item.storage.length > 0) {
                term(`^+Entreposage:\n`);
                term.right(5); term(`^+Type de bac magasin:^: ${item.storage[0].type}\n`);
                term.right(5); term(`^+Nombre de pièces par bac magasin:^: ${item.storage[0].count}\n`)
                term.right(5); term(`^+Masse de chaque bac:^: ${item.storage[0].weight}\n`)
                term.right(5); term(`^+Nombre de bac:^: ${item.storage.length}\n`)
                term.right(5); term(`^+Dimensions ext.:^: ${item.storage[0].length} x ${item.storage[0].width} x ${item.storage[0].height}\n`)
            }
            
            if (item.supplier.length > 0) {
                term(`^+Infos fournisseur:\n`);
                item.supplier.map((supplier, index) => {
                    term.right(0); term(`^+Fournisseur^:: ${supplier.name}\n`);
                    term.right(5); term(`Téléphone^:: ${supplier.phone}\n`);
                    term.right(5); term(`^+Localisation^:: ${supplier.adresse.ville + ', ' + supplier.adresse.etat + ', ' + supplier.adresse.pays}\n`);
                    term.right(5); term(`^+Nombre de pièce fournie^:: ${supplier.piecesFournies.length}\n`);

                })
            }
            let menuItems = [
                `Afficher l'historique d'achats`,
                `Modifier fiche de pièce`,
                `Modifier entreposage`,
                `Calcul des consommations`,
            ]
            term.singleColumnMenu(menuItems,
                { cancelable: true, keyBindings: { CTRL_Z: 'escape', ENTER: 'submit', UP: 'previous', DOWN: 'next' } },
                (error, response) => {

                    if (response.selectedIndex === 0) {
                        this.afficherHistoriqueAchats(item)
                    }
                    else if (response.selectedIndex === 1) {
                        this.modifierDetails(item);
                    }
                    else if(response.selectedIndex === 2){
                        this.modifierEntreposage(item);
                    }
                    else if (response.selectedIndex === 3) {
                        this.calculConsom(item)

                    }

                })
            term('\n\n\n')
       // }


    }
}


module.exports = FichePiece;