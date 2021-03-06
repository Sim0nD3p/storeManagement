const Store = require('./store');
const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const term = require('terminal-kit').terminal;
const resolve = require('path').resolve;
const { exit } = require('process');
const FileManager = require('./fileManager');
const DataAnalyser = require('./dataAnalyser');
const Item = require('./item');
const Industry = require('./industry');
const infosText = require('./infosText');
const fichePiece = require('./fichePiece');
const FicheSupplier = require('./ficheSupplier');
const { autoComplete } = require('terminal-kit');
const FichePiece = require('./components/fichePiece');
const partTable = require('./partTable');
const containersData = require('./containers/containerData');
const ExportData = require('./exportData');
const nbPieces = require('./nbPieces')
const DisplayStore = require('./displayStore');
const Bundle = require('./containers/bundle');
const data2021_08_06 = require
const storageData = require('./storageData')
const bundleSize = require('./containers/bundleSize');
const Addresser = require('./addresser');
const DisplayPartList = require('./components/displayPartList')
const DisplaySuppliers = require('./components/displaySuppliers');

const List = require('./draftInput');
//const prompt = require('prompt-sync')({ sigint: true });

function checkFiles(path) {
    console.log('this is check files');
    fs.readdir(path, (err, files) => {
        console.log('in the middle');
        console.log(files);
    })
}


const exportData = new ExportData();


class App {
    constructor() {
        this.state;
        //this.store = new Store();
        this.inputPath = '../ENTRÉE';
        this.outputPath = '../SORTIE';
        this.entries = [];
        this.store = new Store(this);
        this.industry = new Industry(this)
        this.dataAnalyser = new DataAnalyser(this)
        this.fileManager = new FileManager(this);
        this.lastScreen = 'home'
        this.fichePiece = new fichePiece(this);
        this.ficheSupplier = new FicheSupplier(this)
        this.currentScreen = '';
        this.partTable = new partTable(this)
        this.displayStore = new DisplayStore(this);
        this.FichePiece = new FichePiece(this)
        this.addresser = new Addresser(this)
        this.displayPartList = new DisplayPartList(this)
        this.displaySuppliers = new DisplaySuppliers(this)
        this.log = ''
        this.enableGoBack = true;

    }

    goBack = () => {
        //console.log(this.lastScreen);
        /* let exceptions = ['manageAdress']
        if(exceptions.indexOf(this.lastScreen.screen) == -1){
        } */
        this.clearScreen();
        if (this.lastScreen.screen == 'home') {
            this.currentScreen = 'home';
            this.home(); this.lastScreen.screen = null
        }
        else if (this.lastScreen.screen == 'rechercherItem') {
            console.log('fsdfhsdfsd');
            this.rechercherItem()
        }
        else if (this.lastScreen.screen == 'infos') { this.infos(); this.lastScreen.screen = 'home' }
        else if (this.lastScreen.screen == 'afficherPiece') {
            this.fichePiece.afficherPiece(this.lastScreen.content)
            this.lastScreen.screen = 'rechercherItem'
        }
        else if (this.lastScreen.screen == 'addSupplier') { this.industry.addSupplier() }
        else if (this.lastScreen.screen == 'afficherPieces') { this.afficherPieces() }
        else if(this.lastScreen.screen == 'displayPartListMenu'){ this.displayPartList.menu() }
        else if (this.lastScreen.screen == 'afficherPiecesSelectFamille') { this.selectionnerFamille() }
        else if (this.lastScreen.screen == 'calculConsom') { this.fichePiece.calculConsom(this.lastScreen.content) }
        else if (this.lastScreen.screen == 'modfierDetails') { this.fichePiece.modifierDetails(this.lastScreen.content) }
        else if (this.lastScreen.screen == 'displaySuppliers') { this.displaySuppliers.mainList() }
        else if(this.lastScreen.screen == 'searchSupplier'){ this.displaySuppliers.searchSupplier() }
        else if (this.lastScreen.screen == 'maintenance') { this.maintenance(); this.lastScreen.screen = 'home' }
        else if (this.lastScreen.screen == 'afficherMagasin') { this.afficherMagasin() }
        else if(this.lastScreen.screen == 'modifierEntreposage'){ this.fichePiece.modifierEntreposage(this.lastScreen.content) }
        else if(this.lastScreen.screen == 'storeManagerMenu'){ this.store.storeManager.storeManagerMenu() }
        else if(this.lastScreen.screen == 'manageAdress'){ this.store.storeManager.manageAdress(this.lastScreen) }

        else if(this.lastScreen.screen == 'displayPart'){ this.FichePiece.bindCursorToKeys = false; this.FichePiece.displayPart(this.lastScreen.content)}
        else if(this.lastScreen.screen == 'modifyPart'){
            this.FichePiece.index = this.lastScreen.index;
            this.FichePiece.modifierPiece(this.lastScreen.content)
        }
        else if(this.lastScreen.screen == 'containerSelector'){ this.FichePiece.changeContainer.containerSelector(this.lastScreen.content)}
        else {
            this.home()
        }
    }

    //GUCCI
    reportMaker() {
        this.clearScreen()
        this.lastScreen.screen = `home`;
        this.currentScreen = 'reportMaker';
        term.bold("Création d'un rapport:\n");
        term("Choisir le type de rapport à l'aide des flèches du clavier:\n");
        let menuItems = [
            '----- RETOUR -----',               //0
            'consommation annuelle',            //1
            'consommation mensuelle',           //2
            'consommation mensuelle maximale',  //3
            'commande typique',                 //4
            'fréquence de réapprovisionnement', //5
            'rapport de fournisseurs',          //6
        ]
        term.gridMenu(menuItems, { keyBindings: { CTRL_Z: 'submit', UP: 'previous', DOWN: 'next', LEFT: 'previousColumn', RIGHT: 'nextColumn', ENTER: 'submit' }, }, (error, response) => {
            setTimeout(() => {
                if (this.currentScreen == 'reportMaker') {
                    if (response.selectedIndex === 0) {
                        this.home()
                    }
                    else if (response.selectedIndex === 1) {      //Consommation anuelle
                        console.clear();
                        term.bold('Rapport de consommation annuelle moyenne\n');
                        term("Entrer l'année de début pour le calcul des moyennes annuelles\n");
                        term.inputField((error, input) => {
                            this.dataAnalyser.generateReport('annualAve', input);

                        })
                        term('Appuyer sur CTRL + Z pour retourner au menu\n');


                    }
                    else if (response.selectedIndex === 2) {      //Consommation mensuelle
                        console.clear();
                        term.bold('Rapport de consommation moyenne mensuelle\n');
                        term("Entrer le mois et l'année de début pour le calcul de la moyenne mensuelle dans le format MM-AAAA: \n");
                        term.inputField((error, input) => {
                            let startDate = {
                                year: input.slice(3),
                                month: input.slice(0, 2)
                            }

                            term('\nEntrer le nombre de mois pris en compte pour faire chaque moyenne mensuelle ou entrer "auto" pour baser la moyenne sur la fréquence de réapprovisionnement\n');
                            term.inputField((error, input) => {
                                this.dataAnalyser.generateReport('monthlyAve', startDate, { timeframe: input })

                            })

                            term('Appuyer sur CTRL + Z pour retourner au menu\n');
                        })

                    }
                    else if (response.selectedIndex === 3) {      //Consommation mensuelle maximale
                        console.clear();
                        term.bold('Rapport de consommation mensuelle maximale\n')
                        term("Choisir l'année de début de prise en compte des consommation mensuelles: \n");
                        term.inputField((error, input) => {

                            if (input.length === 4 && isNaN(Number(input)) == false) {
                                this.dataAnalyser.generateReport('maxMonthlyConsom', input);
                            }
                        })
                        term('Appuyer sur CTRL + Z pour retourner au menu\n');

                    }
                    else if (response.selectedIndex === 4) {      //Commande typique
                        console.clear();
                        term.bold('Rapport de commandes typiques\n');
                        term("Entrer l'année de début:\n");
                        term.inputField((error, input) => {
                            this.dataAnalyser.generateReport('commandeType', Number(input))
                        })
                        term('Appuyer sur CTRL + Z pour retourner au menu\n');

                    }
                    else if (response.selectedIndex === 5) {      //Frequence de reapprovisionnement
                        console.clear();
                        term.bold('Rapport de fréquence de réapprovisionnement\n');
                        term("Entrer l'année de début pour le calcul de la fréquence de réapprovisionnement\n")
                        term.inputField((error, input) => {
                            this.dataAnalyser.generateReport('freqOrders', Number(input))
                        })
                        term('Appuyer sur CTRL + Z pour retourner au menu\n');
                    }
                    else if (response.selectedIndex === 6) {
                        console.clear();
                        this.dataAnalyser.generateReport('fournisseurs');
                    }

                }
            }, 50);



        })
    }

    //very useful
    clearScreen() {
        process.stdout.write('\u001b[3J\u001b[1J');
        term.clear();
        console.clear();
    }



    afficherPieces() {
        this.clearScreen();
        this.lastScreen.screen = 'home';
        term.bold(`Choisir mode d'affichage des pièces du PFEP\n`);
        let menuItems = [
            'Afficher tout',
            'Afficher selon categories',
            'Afficher données relatives au magasin',
            'Afficher données relatives aux contenants',
            'Afficher données de quantité',
        ]

        term.singleColumnMenu(menuItems,
            { cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', UP: 'previous', DOWN: 'next' } },
            (error, response) => {
                if (response.selectedIndex === 0) {
                    this.lastScreen = { screen: 'afficherPieces' }
                    this.displayPartArray(this.store.PFEP)
                }
                else if (response.selectedIndex === 1) {
                    this.lastScreen = { screen: 'afficherPieces' }
                    this.selectionnerFamille()
                }
                else if (response.selectedIndex === 2) {
                    this.lastScreen = { screen: 'afficherPieces' }
                    this.partTable.storeData();

                }
                else if (response.selectedIndex === 3) {
                    this.lastScreen.screen = 'afficherPieces'
                    this.partTable.containerData()

                }
                else if (response.selectedIndex === 4) {
                    this.lastScreen.screen = 'afficherPieces';
                    this.partTable.quantity()
                }

            })

    }

    displayPartArray(array) {
        this.clearScreen();
        term.column(20); term('Catégorie');
        term.column(40); term('description');
        term.column(80); term(`P`);
        term.column(87); term(`L`);
        term.column(94); term(`H`);
        term.column(101); term(`M`);
        term.column(111); term(`moisMax`);
        term.column(121); term(`qteMax`);
        term(`\n`);
        array.map((part, index) => {
            if (part.class) {
                if (part.class == 'A') { term.green() }
                else if (part.class == 'B') { term.yellow() }
                else if (part.class.includes('C')) { term.brightRed() }
            }
            term(part.code);
            term.column(20); term(part.family);
            term.column(40); term(part.description ? part.description.substring(0, 35) : '');
            term.column(80); term(Math.ceil(part.specs.length));
            term.column(87); term(Math.ceil(part.specs.width));
            term.column(94); term(Math.ceil(part.specs.height));
            term.column(101); term(part.specs.weight ? part.specs.weight.toString().substring(0, 6) : null);
            term.column(111); term(Math.ceil(part.consommation.mensuelleMax));
            term.column(121); term(part.qteMax ? Math.ceil(part.qteMax) : '');
            term.styleReset();
            term(`\n--------------------------------------------------------------------------------------------------------------------------------------\n`)

        })
    }


    selectionnerFamille() {
        this.clearScreen();
        this.lastScreen = { screen: 'afficherPiecesSelectFamille' }
        term.bold(`Enter la catégorie de pièce à afficher (appuyer sur TAB pour voir les options)\n`);
        let autoComplete = [];
        this.store.PFEP.map((part, index) => { if (autoComplete.indexOf(part.family) == -1 && part.family !== undefined) { autoComplete.push(part.family) } })
        console.log(autoComplete);
        term.inputField({ cancelable: true, autoCompleteMenu: true, autoComplete: autoComplete, keyBindings: { ENTER: 'submit', BACKSPACE: 'backDelete', TAB: 'autoComplete', CTRL_Z: 'cancel' } },
            (error, input) => {
                let array = [];
                this.store.PFEP.map((part, index) => { if (part.family == input) { array.push(part) } })
                this.displayPartArray(array);
            })

    }
    infos() {
        this.clearScreen()
        let str = 'Informations Store Manager 2021';
        term.moveTo(term.width/2-str.length/2, 3); term.bold.underline(str)
        str = `Pour plus d'informations, consulter la documentation`
        term.moveTo(term.width/2-str.length/2, 4); term(str)

        str = `Le projet est disponnible sur GitHub À l'addresse suivante: https://github.com/Sim0nD3p/storeManagement`
        term.moveTo(term.width/2-str.length/2, 5); term(str)

        /*let menuItems = [
            'Instructions pour importer de nouveaux fichiers source et pour mettre à jour le PFEP',
            'Médothologie utilisée pour le calcul de consommation anuelle moyenne',
            'Médothologie utilisée pour le calcul de consommation mensuelle moyenne',
            'Médothologie utilisée pour le calcul de consommation mensuelle maximale',
            'Médothologie utilisée pour le calcul de fréquence de réapprovisionnement',
            `Médothologie utilisée pour le calcul de Commande type`
        ]

        term.singleColumnMenu(menuItems, { cancelable: true, keyBindings: { CTRL_Z: 'escape', ENTER: 'submit', UP: 'previous', DOWN: 'next' } }, (error, response) => {
            if (response.selectedIndex === 0) {
                this.clearScreen();
                this.title('Instruction pour importer de nouveaux fichiers source');
                this.lastScreen.screen = 'infos'
                console.log(infosText.instructionsPart1)
                term('\nAppuyer sur CTRL + Z pour retourner en arrière\n')
            }
            else if (response.selectedIndex === 1) {
                this.clearScreen()
                this.title('Consommation anuelle moyenne - méthodologie');
                console.log(infosText.consomAnnuelleMoy);
                this.lastScreen.screen = 'infos'
                term('\nAppuyer sur CTRL + Z pour retourner en arrière\n')
            }
            else if (response.selectedIndex === 2) {
                this.clearScreen()
                this.title('Consommation mensuelle moyenne - méthodologie');
                console.log(infosText.consomMensuelleMoy);
                this.lastScreen.screen = 'infos'
                term('\nAppuyer sur CTRL + Z pour retourner en arrière\n')
            }
            else if (response.selectedIndex === 3) {
                this.clearScreen()
                this.title('Consommation mensuelle maximale - méthodologie');
                console.log(infosText.consomMensuelleMax);
                this.lastScreen.screen = 'infos'
                term('\nAppuyer sur CTRL + Z pour retourner en arrière\n')
            }
            else if (response.selectedIndex === 4) {
                this.clearScreen()
                this.title('Fréquence de réapprovisionnement - méthodologie');
                console.log(infosText.frequenceReapprovisionnement);
                this.lastScreen.screen = 'infos'
                term('\nAppuyer sur CTRL + Z pour retourner en arrière\n')
            }
            else if (response.selectedIndex === 5) {
                this.clearScreen()
                this.title('Commande typique - méthodologie');
                console.log(infosText.commandeTypique);
                this.lastScreen.screen = 'infos'
                term('\nAppuyer sur CTRL + Z pour retourner en arrière\n')
            }
        })*/

    }

    rechercherItem = (code) => {
        this.clearScreen()
        this.lastScreen.screen = 'home'
        const autoComplete = this.store.PFEP.map(part => part.code)

        let margin = 5;
        let string = 'Recherche de pièce';
        term.moveTo(term.width/2 - string.length/2, 2); term.bold.underline(string + '\n')
        string = 'Entrer code de pièce: ';
        term.moveTo(term.width/2 - string.length, 4); term.bold(string)
        let input = term.inputField(
            {
                y: 4,
                x: term.width/2,
                //echo:true,
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
        input.then((res) => {
            let part = this.store.getItemFromPFEP(res)
            if(part !== -1){
                //ERROR - throw 2 menus when invalid code then valid code
                //this.lastScreen = { screen: 'afficherPiece', content: part }
                this.FichePiece.displayPart(part)
            }
            else {
                console.log('error')
            }


        }).catch((e) => console.log(e))




    }
    rechercherItem_old(code) {
        this.clearScreen()
        console.clear();

        this.lastScreen = { screen: 'home' }

        let autoComplete = [];
        for (let i = 0; i < this.store.PFEP.length; i++) {
            autoComplete.push(this.store.PFEP[i].code)
        }

        term.bold('Recherche de pièce:\n');
        term('Appuyer sur CTRL + Z pour retourner au menu principal\n')
        term('Entrer le code de pièce à rechercher et appuyer sur [TAB] pour avoir les options\n');
        term.inputField(
            { autoComplete: autoComplete, autoCompleteMenu: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'cancel', TAB: 'autoComplete', BACKSPACE: 'backDelete' } },
            (error, input) => {

                let item = this.store.getItemFromPFEP(input);
                if (item !== -1) {
                    this.screen = '';
                    this.lastScreen = { screen: 'rechercherItem' };
                    this.nextScreen = { screen: 'item', content: item }
                    this.fichePiece.afficherPiece(item);
                    //item.afficherDetails()
                }
                else {
                    term.red('Piece introuvable dans le PFEP \n')
                }


            })
        term.eraseDisplayBelow();
    }

    fournisseurs() {
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


    }

    home = () => {
        this.clearScreen();
        this.lastScreen = { screen: 'home' }

        function createPad(str, length){
            if(str.length > length){ str = str.substring(0, length) }
            else str = str.padEnd(length)
            return str
        }
        const mainOptions = [
            'Informations',
            'Rechercher pièce',
            'Afficher magasin',
            'Afficher listes de pièces',
            'Afficher liste fournisseurs',
            'Maintenance',
            'Menu magasin',
            'Création',
            'Enregistrer',
        ]
        const header = 'StoreManagement 10/2021'

        term.moveTo(term.width/2 - header.length/2, 2); term.bold.underline(header); term('\n');
        let mainMenu = term.gridMenu(
            mainOptions.map(o => createPad(o, term.width/4)),
            { x: 20, width: term.width-20, itemMaxWidth: term.width/2 }
            ).promise
        mainMenu.then((res) => {
            switch(res.selectedIndex){
                case 0: this.infos(); break;
                case 1: this.rechercherItem(); break;
                case 2: this.afficherMagasin(); break;
                case 3: this.displayPartList.menu(); break;
                case 4: this.displaySuppliers.mainList(); break;
                case 5: this.maintenance(); break;
                case 6: this.store.storeManager.storeManagerMenu(); break;
                case 7: console.log('en d/veloppement'); break;
                case 8: {
                    this.store.exportPFEPJSON();
                    this.industry.exportSuppliersJSON();
                    break;
                }
                default: this.home(); break;
            }
        }).catch((e) => console.log(e))
    }


    home_old = () => {
        this.clearScreen()
        this.lastScreen = { screen: 'home' }
        term.bold('PFEP V1.0\n');
        term("Choisir une option a l'aide des flèches du clavier et sélectionner avec [ENTER]");
        let menuItems = [
            'Informations',             //0
            'Enregistrer',              //1
            'Rechercher pièce',         //2
            'Afficher pièces',          //3
            'Générer un rapport',       //4
            'Importer fichiers csv',    //5
            'Afficher magasin',         //6
            'Fournisseurs',             //7
            'Maintenance',              //8
            'Créer nouvelle pièce',     //9
            'Créer nouveaux fournisseur',   //10
            'Rechercher fournisseur',       //11
            'Menu magasin',

            'Test',
        ]
        term.gridMenu(menuItems, (error, response) => {
            this.lastScreen = { screen: 'home' };

            if (response.selectedIndex === 0) { this.infos() }
            else if (response.selectedIndex === 1) {
                term(`\n\n\n Entrer le mot de passe pour enregistrer les modifications au PFEP\n`);
                term.inputField(
                    { cancelable: true, echoChar: true, keyBindings: { ENTER: 'submit', BACKSPACE: 'backDelete', CTRL_Z: 'escape' } },
                    (error, input) => {
                        if (input === 'pfep') {
                            term.green('\nmot de passe accepté')
                            this.store.exportPFEPJSON();
                            this.industry.exportSuppliersJSON();
                        }
                        else {
                            term.red(`\nmot de passe incorrect`);
                            //this.home();
                        }
                    })
            }
            else if (response.selectedIndex === 2) {
                this.rechercherItem()
            }
            else if (response.selectedIndex === 3) {
                this.afficherPieces()
            }
            else if (response.selectedIndex === 4) {
                this.reportMaker()
            }
            else if (response.selectedIndex === 5) {
                this.fileManager.selectPFEP();
            }
            else if (response.selectedIndex === 6) {
                this.afficherMagasin()

            }
            else if (response.selectedIndex === 7) {
                this.fournisseurs();
            }
            else if (response.selectedIndex == 8) {
                this.maintenance();

            }
            else if (response.selectedIndex == 9) {
                this.store.createPiece();
            }
            else if (response.selectedIndex === 10) {
                this.industry.addSupplier();
            }
            else if (response.selectedIndex === 11) {
                this.rechercherFournisseur();
            }
            else if (response.selectedIndex === 12) {
                this.lastScreen.screen = 'home'
                this.store.storeManager.storeManagerMenu()
                
                //let shelf = this.store.storeManager.shelfManager.createShelf('test', 4000, 2450)
                //shelf.checkAvailability(this.store.getItemFromPFEP('SEP3411').storage)
                
            }
            else if(response.selectedIndex == 13){
                this.store.PFEP.forEach(part => {
                    if(part.utilite && part.utilite !== undefined){
                        if(Array.isArray(part.utilite) == false){
                            this.store.getItemFromPFEP(part.code).utilite = part.utilite.split(' ')
                        }
                    }
                })

            }

        })
    }
    afficherMagasin() {
        this.clearScreen();
        this.lastScreen.screen = 'home'
        term.bold(`Afficher données du magasin\n`);
        term(`Sélectionner option\n`);
        let menuItems = [
            'Afficher contenants',
            'Afficher Étagères',
            'Afficher contenu étagères',
            'Afficher racking',
            'Afficher toutes les étagères',
        ]
        term.singleColumnMenu(menuItems,
            { cancelable: true, keyBindings: { ENTER: 'submit', DOWN: 'next', UP: 'previous', CTRL_Z: 'escape' } },
            (error, response) => {
                if (response !== undefined) {
                    if (response.selectedIndex === 0) {
                        this.lastScreen.screen = 'afficherMagasin'
                        this.displayStore.displayContainers()
                    }
                    else if(response.selectedIndex === 1){
                        this.lastScreen.screen = 'afficherMagasin';
                        this.displayStore.displayShelf();
                    }
                    else if(response.selectedIndex === 2){
                        this.lastScreen.screen = 'afficherMagasin';
                        this.displayStore.displayShelfContent()
                    }
                    else if(response.selectedIndex === 3){
                        this.lastScreen.screen = 'afficherMagasin';
                        this.displayStore.displayRacking();
                    }
                    else if(response.selectedIndex === 4){
                        this.lastScreen.screen = 'afficherMagasin';
                        this.displayStore.getAllShelves()

                    }
                }
            })
    }
    rechercherFournisseur() {
        this.clearScreen();
        term.bold(`Recherche de fournisseur\n`);
        let autoComplete = [];
        this.industry.suppliers.map((supplier, index) => { autoComplete.push(supplier.name) });
        term.inputField(
            { autoCompleteMenu: true, cancelable: true, autoComplete: autoComplete, keyBindings: { ENTER: 'submit', CTRL_Z: 'cancel', TAB: 'autoComplete', BACKSPACE: 'backDelete' } },
            (error, input) => {
                if (input !== undefined) {
                    this.ficheSupplier.afficherSupplier(this.industry.getSupplierName(input))

                }
            }
        )
    }

    maintenance() {
        this.clearScreen();
        this.lastScreen.screen = 'home';
        let menuItems = [
            'mettre à jour les données de consommation du PFEP',                            
            'console.log PFEP',                         
            'Calculer stock de sécurité',                           
            'console.log(store)',                           
            'Convertir , en . pour dimensions',                         
            'Rechercher PFEP',                          
            'CONTENANTS PIECES',                           
            'console.log storage for all parts + export JSON',                          
            'Set nbPieces par emballage TF',                            
            'Vérifier entreposage des pièces',
            'getData 2021-08-06 (DEV ONLY)',
            'Fix "-LA" history',
            'test FichePiece',
            'Consommation moyenne magasin',
            'apply tags',       
        ]
        term.singleColumnMenu(menuItems, { cancelable: true, keyBindings: { CTRL_Z: 'escape', ENTER: 'submit', UP: 'previous', DOWN: 'next' } }, (error, response) => {
            if (response !== undefined) {

                if (response.selectedIndex === 0) {
                    this.lastScreen.screen = 'maintenance'
                    for (let i = 0; i < this.store.PFEP.length; i++) {
                        this.store.PFEP[i].setConsom(2017);
                    }
                    term(`Appuyer sur CTRL + Z pour retourner au menu\n`);
                }
                else if (response.selectedIndex === 1) {
                    this.lastScreen.screen = 'maintenance'
                    let PFEP = {};
                    let array = [];
                    this.store.PFEP.map((part, index) => {
                        //if(part.class == 'A'){

                        let object = {
                            ...part
                        }
                        PFEP = {
                            ...PFEP,
                            [part.code]: object
                        }
                        array.push(object)
                        //}

                        console.log(part.code);
                        console.log(part);
                        console.log('\n ----------------------------------------------------------------------\n')
                    })
                    exportData.exportJSON(PFEP, 'PFEP_Object');
                    exportData.exportJSON(array, 'PFEP');
                }
                else if (response.selectedIndex === 2) {
                    this.lastScreen.screen = 'maintenance'
                    for (let i = 0; i < this.store.PFEP.length; i++) {
                        this.store.PFEP[i].stockSecurite = this.store.PFEP[i].getSS()
                    }
                }
                else if (response.selectedIndex === 3) { console.log(this.store) }
                else if (response.selectedIndex === 4) {
                    this.lastScreen.screen = 'maintenance'
                    for (let i = 0; i < this.store.PFEP.length; i++) {
                        if (this.store.PFEP[i].specs) {
                            for (const spec in this.store.PFEP[i].specs) {
                                if (this.store.PFEP[i].specs[spec]) {
                                    console.log(spec)
                                    if(typeof this.store.PFEP[i].specs[spec] == 'string'){
                                        this.store.PFEP[i].specs[spec] = this.store.PFEP[i].specs[spec].replace(',', '.');
                                        if (isNaN(Number(this.store.PFEP[i].specs[spec])) == false) { this.store.PFEP[i].specs[spec] = Number(this.store.PFEP[i].specs[spec]) }
                                        else { this.store.PFEP[i].specs[spec] = Number(this.store.PFEP[i].specs[spec])}
                                    }
                                    console.log(this.store.PFEP[i].specs[spec]);
                                
                                }
                            }
                        }
                    }
                }
                else if (response.selectedIndex === 5) {
                    this.lastScreen.screen = 'maintenance'
                    this.clearScreen()
                    console.clear();

                    //this.lastScreen = { screen: 'home' }

                    let autoComplete = [];
                    for (let i = 0; i < this.store.PFEP.length; i++) {
                        autoComplete.push(this.store.PFEP[i].code)
                    }

                    term.bold('Recherche de pièce:\n');
                    term('Appuyer sur CTRL + Z pour retourner au menu principal\n')
                    term.inputField(
                        { autoComplete: autoComplete, autoCompleteMenu: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'cancel', TAB: 'autoComplete', BACKSPACE: 'backDelete' } },
                        (error, input) => {

                            let item = this.store.getItemFromPFEP(input);
                            if (item !== -1) {
                                this.screen = '';
                                this.lastScreen = { screen: 'rechercherItem' };
                                this.nextScreen = { screen: 'item', content: item }
                                console.log(this.store.getItemFromPFEP(input))
                                //item.afficherDetails()
                            }
                            else {
                                term.red('Piece introuvable dans le PFEP \n')
                                
                            }


                        })
                    term.eraseDisplayBelow();
                }
                else if (response.selectedIndex === 6) {
                    //this.categorizeParts()
                    console.log('CONTENANTS POUR PIECES NOW IN MENU MAGASIN')
                }
                else if (response.selectedIndex === 7) {
                    let array = [];
                    this.store.PFEP.map((part, index) => {
                        if (part.storage.length > 0) {
                            let object = {
                                code: part.code,
                                classe: part.class,
                                storage: part.storage
                            }
                            array.push(object);
                            if (part.storage[0].type == 'bac2') {
                                console.log(part.code);
                                console.log(part.family)
                                console.log(part.class);
                                console.log(`${part.storage.length} containers for ${part.qteMax} parts`)
                                console.log('--------------------------------------------------------------------')


                                // console.log(part.code);
                                // console.log(part.storage)
                                // console.log('----------------------------------------------------------------------')
                            }
                        }
                    })
                    exportData.exportJSON(array, 'storageJSON')
                }
                else if (response.selectedIndex === 8) {
                    console.log(nbPieces)
                    for (let i = 0; i < this.store.PFEP.length; i++) {
                        for (let j = 0; j < nbPieces.length; j++) {
                            if (nbPieces[j].piece == this.store.PFEP[i].code) {
                                this.store.PFEP[i].emballage.TF.nbPieces = nbPieces[j].nb;
                                this.store.PFEP[i].emballage.TF.type = nbPieces[j].bac;
                            }
                        }
                    }
                }
                else if(response.selectedIndex === 9){
                    console.log(`PFEP has ${this.store.PFEP.length} parts`)

                    let array = []
                    


                    //baseRef: target list to be placed in racking
                    let baseRef = this.store.PFEP.map((part, index) => {
                        if(part !== undefined && part.family !== 'Consommable' && part.family !== 'Collant'){
                            if(!part.class || part.class.includes('barr') == false){
                                if(part.consommation.totalOrders.nbOrders > 2){ return part }
                                else if(part.code.includes('SEA') || part.code.includes('SEO')){ return part }
                                else if(part.storage.length > 0){ return part }
                                else if(!part.family || part.family.includes('Assem') || part.family.includes('usin') || part.family.includes('transversale') || part.family.includes('Main')){
                                    return part
                                } else return index
                            } else return index  
                        } else return index
                    })

                    let totalConsom = [];
                    let nbPartConsom = 0;
                    baseRef.map((part, index) => {
                        if(part && part.consommation){
                            if(!isNaN(part.consommation.mensuelleMoy) && part.consommation.mensuelleMoy !== 0){
                                totalConsom.push(part.consommation.mensuelleMoy);
                            }
                            else { totalConsom.push(0) }
                        }
                    })
                    totalConsom = totalConsom.sort((a, b) => b - a)
                    totalConsom = totalConsom.filter((a) => a !== 0)
                    
                    console.log(totalConsom)
                    let mediane;
                    if(totalConsom % 2 == 0){
                        mediane = (totalConsom[Math.floor(totalConsom.length / 2)] + totalConsom[Math.ceil(totalConsom.length / 2)]) / 2
                    }
                    else{
                        mediane = totalConsom[Math.ceil(totalConsom.length / 2)]
                    }
                    console.log(`consommation mensuelle mediane du magasin: ${mediane}`)

                    //not in baseRef
                    let failed = baseRef.map((part, index) => {
                        if(typeof part == 'number'){ return this.store.PFEP[part] }
                        else return null
                    })
                    failed = failed.filter((a) => a !== null)
                    
                    //RENFORT == EXTRUSION USINE
                    //SEO => bac2, singleBac


                    baseRef = baseRef.filter((a) => typeof a !== 'number')

                    let baseRefObj = []; let notOnBaseRefObj = [];
                    baseRef.map(part => { baseRefObj = {...baseRefObj, [part.code]: part }}); failed.map(part => { notOnBaseRefObj = {...notOnBaseRefObj, [part.code]: part }})
                    
                    
                    let storageData = {}
                    baseRef.map((part, index) => {
                        storageData = {
                            ...storageData,
                            [part.code]: {
                                container: part.emballage.TF.type,
                                nbPiece: part.emballage.TF.nbPieces,
                                storage: part.storage[0] ? true : false
                            }
                        }
                    })
                    
                    //No storage parts
                    let noStorage = [];
                    baseRef.map((part, index) => {
                        if(part.storage.length == 0){ noStorage = { ...noStorage, [part.code]: part} }
                    });
                    let partStorage = this.store.PFEP.map((part) => {if(part.storage.length > 0){ return part } else return null }); partStorage = partStorage.filter((a) => a !== null)
                    

                    let placedInRacking = [];
                    this.store.racking.map((rack, index) => {
                        rack.shelves.map((shelf, index) => {
                            shelf.content.map((container, index) => {
                                if(placedInRacking.indexOf(container.name.split('_')[1]) == -1){
                                    placedInRacking.push(container.name.split('_')[1])
                                }
                            })
                        })
                    })
                    placedInRacking = placedInRacking.sort()

                    let placedInShelves = [];
                    this.store.shelves.map((shelf, index) => {
                        shelf.content.map((container, index) => {
                            if(placedInShelves.indexOf(container.name.split('_')[1]) == -1){
                                placedInShelves.push(container.name.split('_')[1])
                            }
                        })
                    })
                    placedInShelves = placedInShelves.sort();


                    let errorParts = []
                    for(let i = 0; i < Math.max(placedInShelves.length, placedInRacking.length); i++){
                        if(placedInRacking.indexOf(placedInShelves[i]) == -1){
                            errorParts.push(placedInShelves[i])
                        }
                        if(placedInShelves.indexOf(placedInRacking[i]) == -1){
                            errorParts.push(placedInRacking[i])
                        }
                    }
                    errorParts = errorParts.filter((a) => a !== undefined)
                    
                    
                    
                    let partList = this.store.rackManager.partLists.MP.concat(this.store.rackManager.partLists.assemblages)
                    partList = partList.map(part => part.code)

                    let failedToPlace = partList.map((part, index) => {
                        if(placedInShelves.indexOf(part) == -1){ return part }
                        else return null
                    })
                    failedToPlace = failedToPlace.filter((a) => a !== null)

                    
                    let notOnPartList = {};
                    baseRef.map((part, index) => {
                        if(partList.indexOf(part.code) == -1){
                            notOnPartList = {
                                ...notOnPartList,
                                [part.code]: {
                                    family: part.family,
                                    type: part.emballage.TF.type,
                                    specs: part.specs
                                }
                            }
                             
                        }
                    })
                    let shelfData = {}
                    this.store.shelves.map((shelf, index) => {
                        let s = {
                            ...shelf,
                            space: null
                        }
                        shelfData = {
                            ...shelfData,
                            [shelf.name]: s
                        }
                    })
                    exportData.exportJSON(shelfData, 'shelves', '../SORTIE')
                    term(`\n\nLe PFEP contient ${this.store.PFEP.length} pièces\n`);
                    term(`^y${baseRef.length}^: pièces ont été retenues, ^y${failed.length}^: rejetées \n\n`)
                    
                    term('PARTLIST: MP: ').yellow(this.store.rackManager.partLists.MP.length)(', assemblages: ').yellow(this.store.rackManager.partLists.assemblages.length)('    -> total: ').yellow(partList.length)('\n')
                    term('PARTS PLACED: shelves: ').yellow(placedInShelves.length)(', racking: ').yellow(placedInRacking.length)('\n')
                    console.log(errorParts)

                    term(`\n Failed to place ^y${failedToPlace.length}^: parts in shelves\n`)
                    console.log(failedToPlace)


                    term(`${partStorage.length} pièces ont des containers\n`)
                    term(`${placedInRacking.length} pièces sont placées dans les racking\n`)
                    term('\n\n')
                    
                    term(`La liste des pièces rejetées est exportée en JSON (notOnBaseRef.json)\n`);
                    term(`La liste de pièces considérées pour le magsin est exportée en JSON (baseRef.json)\n`);
                    term(`La liste des données d'entreposage est exportée en JSON (storageData.json)\n`) 
                    term(`notOnPartList: liste des pieces qui devraient etre sur partList mais qui ne le sont pas\n`)
                    exportData.exportJSON(notOnPartList, 'notOnPartList', '../SORTIE');
                    exportData.exportJSON(storageData, 'storageData', '../SORTIE')
                    exportData.exportJSON(noStorage, 'noStorage', '../SORTIE')
                    exportData.exportJSON(notOnBaseRefObj, 'notOnBaseRef', '../SORTIE')
                    exportData.exportJSON(baseRefObj, 'baseRef', '../SORTIE');
                    
                    
                    
                    
                    
                    
                    
                }
                else if(response.selectedIndex === 10){
                    console.log('dasdas')
                    fs.readFile('../ENTRÉE/test.json', 'utf8', (err, jsonString) => {
                        if(err){ console.log(err) }
                        else{
                            let json = JSON.parse(jsonString);
                            let data = [];

                            json.map((part, index) => {
                                data = { ...data, [part.CODE]: part}
                                let item = this.store.getItemFromPFEP(part.CODE)
                                let utilite = []
                                let options = ['TS', 'TE', 'TW', 'TH', 'TF', 'SAE', 'SEO']
                                if(part && part.UTILITE){
                                    for(let i = 0; i < options.length; i++){
                                        if(part.UTILITE.toString().includes(options[i])){ utilite.push(options[i]) }
                                    }
                                    console.log(utilite)
                                    this.store.getItemFromPFEP(part.CODE).utilite = utilite
                                }
/* 

                                if(part !== undefined && part.UTILITE !== undefined){
                                    console.log(part.UTILITE)
                                }

                                 */
                            })
                            exportData.exportJSON(data, 'infos', '../SORTIE')

                        }
                    })

                }
                else if(response.selectedIndex === 11){
                    let ref = this.store.PFEP.map(part => part.code)
                    for(let i = 0; i < this.store.PFEP.length; i++){
                        if(this.store.PFEP[i].code.indexOf('LA') !== -1){
                            if(ref.indexOf(this.store.PFEP[i].code.substring(0, this.store.PFEP[i].code.indexOf('-LA'))) !== -1){
                                console.log(this.store.PFEP[ref.indexOf(this.store.PFEP[i].code.substring(0, this.store.PFEP[i].code.indexOf('-LA')))].history)
                                this.store.PFEP[ref.indexOf(this.store.PFEP[i].code.substring(0, this.store.PFEP[i].code.indexOf('-LA')))].history = {
                                    ...this.store.PFEP[ref.indexOf(this.store.PFEP[i].code.substring(0, this.store.PFEP[i].code.indexOf('-LA')))].history,
                                    ...this.store.PFEP[i].history,
                                    
                                }
                                console.log(this.store.PFEP[ref.indexOf(this.store.PFEP[i].code.substring(0, this.store.PFEP[i].code.indexOf('-LA')))].history)
                                console.log('--------------------')
                            }
                        }
                    }
                }
                else if(response.selectedIndex === 12){
                    let part = this.store.getItemFromPFEP('SEP3411')
                    this.FichePiece.displayPart(part)

                }
                else if(response.selectedIndex == 14){
                    console.log('TAG')
                    let toRemove = 0
                    console.log(this.store.PFEP.length)
                    for(let i = 0; i < this.store.PFEP.length; i++){
                        if(!this.store.PFEP[i].code){
                            this.store.PFEP.splice(i, 1)
                            toRemove++
                            break;
                        }
                    }

                    console.log(toRemove)
                    console.log(this.store.PFEP.length)


                }
            }


        })
    }

    categorizeParts() {
        //this.lastScreen.screen = 'maintenance'


        let bac2Parts = [
            'SEP2504',
            'SEP200-004301',
            'SEP240-004312',
            'FP01-0012M',
            'FP01-0016',
            'SEP260-0G44560',
            'SEP260-004394',
            'SEP240-005046',
        ]
        let array = [];
        let bac1 = [];
        let bac2 = [];
        let collant = [];
        let extrusions = []
        let extrusionUsine = [];
        let bt = []
        let emballage = [];
        let main = []
        let restant = [];
        let targetNb = 0;
        this.store.PFEP.map((part, index) => {
            //GET MAX
            if (part.specs.length && part.specs.width && part.specs.height) {
                if (part.family !== 'Consommable') { targetNb++ }

                let dimensions = [part.specs.length, part.specs.width, part.specs.height];
                /* let max1 = Math.max(dimensions[0], dimensions[1], dimensions[2]);
                let dimensions2 = dimensions.map((dim, index) => {
                    if(dim !== max1){ return dim }
                    else return 0
                })
                let max2 = Math.max(dimensions2[0], dimensions2[1], dimensions2[2]);
                let dimensions3 = dimensions2.map((dim, index) => {
                    if(dim !== max1 )
                }) */

                function placeInBac1(part, app) {
                    if (isNaN(part.qteMax) == false && isNaN(part.emballage.TF.nbPieces) == false) {
                        app.store.storeManagerDesk('bac1', part, Math.ceil(part.qteMax));
                    }
                    else {
                        if (part.class.includes('C') || part.family.includes('Cylindre') || part.family.includes('Assemblage') || part.family.includes('Extrusion usin')) {
                            //on prend un seul
                            let partEmballage = part.emballage.TF;
                            //capacite du bac devient qteMax
                            if (Number(part.emballage.TF.nbPieces) > 0) { app.store.getItemFromPFEP(part.code).qteMax = part.emballage.TF.nbPieces }
                            else if (!isNaN(part.qteMax)) { app.store.getItemFromPFEP(part.code).emballage.TF.nbPieces = part.qteMax }
                            else {
                                app.store.getItemFromPFEP(part.code).emballage.TF.nbPieces = 'singleBac';
                                app.store.getItemFromPFEP(part.code).qteMax = 'singleBac'
                            }
                            app.store.storeManagerDesk('bac1', part, isNaN(part.qteMax) ? part.qteMax : Math.ceil(part.qteMax))
                        }
                    }

                }
                function placeInBac2(part, app) {
                    if (isNaN(part.emballage.TF.nbPieces) == false && isNaN(part.qteMax) == false) {
                        app.store.storeManagerDesk('bac2', part, Math.ceil(part.qteMax))
                    }
                    else if (part.class.includes('C') || part.family.includes('Assemblage') || app.store.getItemFromPFEP(part.code).family.includes('Extrusion usin')) {
                        if (Number(part.emballage.TF.nbPieces) > 0) { app.store.getItemFromPFEP(part.code).qteMax = part.emballage.TF.nbPieces }
                        else if (isNaN(part.qteMax) == false) { part.emballage.TF.nbPieces = part.qteMax }
                        else {
                            //console.log('----------------------------')
                            //console.log(part)
                            app.store.getItemFromPFEP(part.code).emballage.TF.nbPieces = 'singleBac'
                            app.store.getItemFromPFEP(part.code).qteMax = 'singleBac'
                            //console.log(part)
                        }

                        app.store.storeManagerDesk('bac2', app.store.getItemFromPFEP(part.code), isNaN(part.qteMax) ? part.qteMax : Math.ceil(part.qteMax))

                    }
                }

                dimensions = dimensions.sort(function (a, b) { return a - b; }).reverse();

                let maxBacParPiece = 10;

                //let containersData = this.store.containersSample;
                let excludes = ['Extrusion', 'Collant', 'Main', 'Consommable', 'Barre transversale', 'Emballage']
                if (excludes.indexOf(part.family) == -1) {
                    if (isNaN(dimensions[0]) == false && isNaN(dimensions[1]) == false && isNaN(dimensions[2]) == false) {
                        //if fit in bac1
                        if (dimensions[0] < containersData[0].inside.length && dimensions[1] < containersData[0].inside.width && dimensions[2] < containersData[0].inside.height) {
                            let volPart = (dimensions[0] * dimensions[1] * dimensions[2]) / 1000000000;
                            let estimateQte = (containersData[0].volumeInt / volPart)
                            //if qteMax exist
                            if (!isNaN(part.qteMax)) {
                                let nbPiecesItemBac = part.emballage.TF.nbPieces ? part.emballage.TF.nbPieces : 0;
                                //if nb de piece qui fit dans bac x facteur est en dessous de ce qu'on a a entrer
                                if (estimateQte * maxBacParPiece < part.qteMax || nbPiecesItemBac * maxBacParPiece < part.qteMax) {
                                    //renvoyer vers plus gros bac
                                    part.emballage.TF.type = 'bac2FromBac1'
                                    placeInBac2(part, this);
                                    bac2.push({ [part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })
                                } else {
                                    //on garde le meme bac
                                    part.emballage.TF.type = 'bac1'
                                    placeInBac1(part, this)
                                    bac1.push({ [part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })

                                }
                            } else {
                                //on va garder le meme bac pour l'instant mais on est suppose avoir qteMax pour toutes les pieces
                                part.emballage.TF.type = 'bac1'
                                placeInBac1(part, this);
                                bac1.push({ [part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })
                            }
                        }
                        else if (dimensions[0] < containersData[1].inside.length && dimensions[1] < containersData[1].inside.width && dimensions[2] < containersData[1].inside.height) {
                            let volPart = (dimensions[0] * dimensions[1] * dimensions[2]) / 1000000000;
                            let estimateQte = (containersData[1].volumeInt / volPart);
                            //if qteMax exist
                            if (!isNaN(part.qteMax)) {
                                let nbPiecesItemBac = part.emballage.TF.nbPieces ? part.emballage.TF.nbPieces : 0;
                                //if nb de piece qui fit dans bac x facteur est en dessous de ce qu'on a a entrer
                                if (estimateQte * maxBacParPiece < part.qteMax || nbPiecesItemBac * maxBacParPiece < part.qteMax) {
                                    //renvoyer vers etagere?
                                    part.emballage.TF.type = 'etagere?'
                                    //bac2.push({[part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces})
                                } else {
                                    //on garde le meme bac
                                    part.emballage.TF.type = 'bac2'
                                    placeInBac2(part, this)
                                    bac2.push({ [part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })
                                }
                            } else {
                                //on va garder le meme bac pour l'instant mais on est suppose avoir qteMax pour toutes les pieces
                                bac2.push({ [part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })
                                placeInBac2(part, this);
                                part.emballage.TF.type = 'bac2'
                            }
                        }
                        else {
                            if (part.family.includes('Extrusion usin')) {
                                part.emballage.TF.type = 'bundleUsine'
                                extrusionUsine.push({ [part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })
                                let data = {

                                }
                                //this.store.storeManagerDesk('palette', part, 1000, data);
                            }
                            //useless: excluded
                            else if (part.family.includes('Emballage')) {
                                part.emballage.TF.type = 'palette';
                                emballage.push({ [part.code]: part.length, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })
                                let data = {

                                }
                                this.store.storeManagerDesk('palette', part, Math.ceil(part.qteMax), data);

                            }
                            else {
                                part.emballage.TF.type = 'restant'
                                restant.push({ [part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })
                            }
                        }
                    }
                    else {
                        part.emballage.TF.type = 'restant'
                        restant.push({ [part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })
                    }

                }
                else if (part.family == 'Collant') {
                    part.emballage.TF.type = 'collant'
                    collant.push({ [part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })
                }
                else if (part.family == 'Extrusion') {
                    part.emballage.TF.type = 'bundle'
                    extrusions.push({ [part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })
                    this.store.storeManagerDesk('bundle', part, Math.ceil(part.qteMax))
                    //this.store.bundleManager(part.code, Math.ceil(part.qteMax))
                }
                else if (part.family == 'Emballage') {
                    if (part.code.includes('CAR')) {
                        let data = {

                        }
                        this.store.storeManagerDesk('palette', part, Math.ceil(part.qteMax), data)
                    }
                    else if (part.code.includes('SAC')) {
                        //sac -> rangement sac
                    }
                    else {
                        emballage.push(part.code);
                    }
                }
                else if (part.family == 'Main') {
                    part.emballage.TF.type = 'etagereMain'
                    main.push({ [part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })
                }
                else if (part.family == 'Barre transversale') {
                    part.emballage.TF.type = 'bundle_BT'
                    bt.push({ [part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })
                }
                else {
                    part.emballage.TF.type = 'restant'
                    restant.push({ [part.code]: dimensions, family: part.family, class: part.class, nb: part.emballage.TF.nbPieces })
                }

            }
        })

        //console.log('extrusionUsine');
        //console.log(extrusionUsine);
        //console.log('bac1')
        //console.dir(bac1, { maxArrayLength: null });
        console.log(`bac1 has ${bac1.length} parts`)
        console.log(`bac2 has ${bac2.length} parts`)
        console.log(`emballage ${emballage.length}`);
        console.log(`barre transversale ${bt.length}`)
        console.log(`extrusions ${extrusions.length}`);
        console.log(`extrusionUsine ${extrusionUsine.length}`)
        console.log(`collant ${collant.length}`)
        console.log(`main ${main.length}`)
        console.log(`a total of ${bac1.length + bac2.length + extrusions.length + collant.length + main.length + extrusionUsine.length + emballage.length + bt.length} part have been placed`)
        console.log(emballage)
        //console.log(`restant ${restant.length}`)
        //console.dir(restant, { maxArrayLength: null })
        //this.clearScreen()

    }

    displaySelectedFiles() {
        for (let i = 0; i < 50; i++) {
            console.log('display selected files');

        }
    }





    //TO DELETE
    selectFile() {
        console.clear();
        let test = this.fileSelector('PFEP');
        console.log(test);

    }

    afficherTel(phone) {
        if (phone) {
            phone = phone.toString();
            if (phone.length == 10) {
                return phone.slice(0, 3) + '-' + phone.slice(3, 6) + '-' + phone.slice(6)
            }
            else if (phone.length == 11) {
                return phone.slice(0, 4) + '-' + phone.slice(4, 7) + '-' + phone.slice(7)
            } else return phone
        } else return null
    }
    title = (title) => {
        term('\n');
        term.moveTo(term.width / 2 - 11, 3).left(title.length / 2);
        term.bgColor('yellow').bold.underline('---------- ' + title + ' ----------');
        term('\n');
        term.styleReset();
    }

    start() {
        console.clear();
        term.alternateScreenBuffer();
        term.eraseDisplayAbove();
        this.title('PFEP')

        term.on('key', (key) => {
            const movingKeys = ['UP', 'DOWN', 'LEFT', 'RIGHT']
            if (key === 'CTRL_Z') {
                if(this.FichePiece.bindCursorToKeys === true){ this.FichePiece.bindCursorToKeys = false }
                if(this.enableGoBack){ setTimeout(() => { this.goBack() }, 10)}
            }
            if (key === 'CTRL_C') { /*console.clear();*/ process.exit() }
            if (key === 'CTRL_X') { this.clearScreen(); this.home() }
            if(movingKeys.indexOf(key) !== -1){
                if (this.FichePiece.bindCursorToKeys === true) {
                    this.FichePiece.index = this.FichePiece.moveCursor(key, this.FichePiece.index)
                }
            }
            if(key === 'ENTER'){
                if(this.FichePiece.bindCursorToKeys === true){
                    this.FichePiece.changeProp()
                }
            }
        });
        //this.home()
        this.industry.importSuppliersJSON()
        this.store.nImportPFEPJSON();

        setTimeout(() => {
            //this.categorizeParts()
            this.home()

        }, 150)

    }
}

const app = new App();
app.start();

/* 
let awaitUserInput = true;
let state = 'default';
UI.manager('default');
while(awaitUserInput){
    state = UI.state;
    if(state === 'on'){ awaitUserInput = false };
    if(state === 'verif'){
        fs.readdir('./node_modules', (err, files) => {
            console.log(files.length + "fichiers sont dans le répertoire d'entrée")
        })
    }
};
 */
//const store = new Store()
//store.test()

/* 
var number = 0;
while(number < 100){
    number = prompt('enter a number ');
}
 */
/* 
const data = [
    {
        name: 'John',
        surname: 'Snow',
        age: 26,
        gender: 'M'
    }, {
        name: 'Clair',
        surname: 'White',
        age: 33,
        gender: 'F',
    }, {
        name: 'Fancy',
        surname: 'Brown',
        age: 78,
        gender: 'F'
    }
]; */

//demo gen array pour creation CSV
function genArray(a) {
    console.log(a.length);
    let b = 0;
    let data = [];
    for (let i = 0; i < a.length; i++) {
        data.push({
            Numpiece: a[i].TYPE,
            status: a[i].STATUS

        })
        if (a[i].TYPE === 'Bloc') {
            b++;
        }
    }
    exportCSV(data);
    console.log(`${b} bloc sont sur la liste`);
    return a
}
/* 
//use loop for multiple files
fs.createReadStream('../ENTRÉE/data.csv')
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => { results.push(data) })
    .on('end', () => {
        console.log('csv successfully processed!');
        //console.log(results);
        //genArray(results)
    })

 */


function addZero(n) {
    if (n < 10) { return '0' + n.toString() }
    else return n.toString()
}








function exportCSV(data) {
    console.log('exporting to csv');
    let date = new Date();
    let path = 'report_' + date.toISOString().substring(0, 10) + '-' + addZero(date.getHours()) + addZero(date.getMinutes());
    console.log(path);

    const csvWriter = createCsvWriter({
        path: path + '.csv',
        fieldDelimiter: ';',
        header: [
            { id: 'Numpiece', title: 'Numpiece' },
            { id: 'status', title: 'status' },
            //{ id: 'age', title: 'Age' },
            //{ id: 'gender', title: 'Gender' },
        ]
    });
    csvWriter
        .writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'));

}


