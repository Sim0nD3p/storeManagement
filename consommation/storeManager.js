const Bac = require('./containers/bac');
const Bundle = require('./containers/bundle');
const Palette = require('./containers/palette');
const Shelf = require('./containers/shelf');
const shelves = require('./containers/shelves');
const containersData = require('./containers/containerData');
const ShelfManager = require('./shelfManager');
const CustomContainer = require('./containers/customContainer');
const term = require('terminal-kit').terminal;
const ExportData = require('./exportData');
const fs = require('fs')
const shelvesData = require('./containers/shelves');
const fsPromise = require('fs/promises')
const bUs = require('./containers/bUs');
const storageData = require('./storageData');
const Racking = require('./containers/racking');

const exportData = new ExportData()


//Crée et remplis les containers et les retourne au store
class StoreManager {
    constructor(app) {
        this.app = app;
        this.storePartList = [];
        this.finalStoreList = [];
        this.noContainerList = [];
        //this.shelfManager = new ShelfManager(app)

    }

    /**
     * filter go get parts that goes in store
     * A enlever
     *  - barre stephane,
     *  - consommable
     *  - collant
     *  - 
     * @param {*Array} PFEP 
     * @returns 
     */
    getStoreList = (PFEP, minOrderQte) => {
        minOrderQte = minOrderQte == undefined ? 2 : minOrderQte; 
        let baseRef = PFEP.map((part, index) => {
            if (part !== undefined && part.family !== 'Consommable' && part.family !== 'Collant') {
                if (!part.class || part.class.includes('barr') == false) {
                    if (part.consommation.totalOrders.nbOrders > minOrderQte){ return part}
                    //else if (part.storage.length > 0) { return part }
                    else if (part.code.includes('SEA') || part.code.includes('SEO')) { return part }
                    else if (!part.family || part.family.includes('Assem') || part.family.includes('usin') || part.family.includes('transversale') || part.family.includes('Main')) {
                        return part
                    }
                    else return index
                } else return part
            } else return index
        })
        let notInStore = baseRef.filter((a) => typeof a == 'number')
        notInStore = notInStore.map(a => this.app.store.PFEP[a])
        baseRef = baseRef.filter((a) => typeof a !== 'number')
        return [baseRef, notInStore]

    }
    filterPFEP(PFEP){
        return PFEP.filter((a) => a.class && a.class.includes('barr'))
    }

    assignItemsContainers = () => {
        for (const code in storageData) {
            //console.log(code)
            if(this.app.store.getItemFromPFEP(code.toString()) !== -1){
                this.app.store.getItemFromPFEP(code.toString()).emballage.TF.type = storageData[code].container
                this.app.store.getItemFromPFEP(code.toString()).emballage.TF.nbPieces = isNaN(Number(storageData[code].nbPieces)) ? storageData[code].nbPieces : Number(storageData[code].nbPieces);
            }
            if (storageData[code].container == 'bUs') {
                //term.red.bold('\n\n\nEXCEPTION\n\n\nEXCEPTION\n')
                //this.app.store.getItemFromPFEP(code.toString()).qteMax = storageData[code].nbPieces //IL FAUT REUSSIR A ENLEVER CETTE SKETCHASS MERDE
            }
        }
 
        for (let i = 0; i < this.app.store.PFEP.length; i++) {
            let containers = this.app.store.storeManagerDesk(
                this.app.store.PFEP[i].emballage.TF.type,   //should be bac1, bac1, bundle, cus, bUs
                this.app.store.PFEP[i],
                this.app.store.PFEP[i].qteMax ? Math.ceil(this.app.store.PFEP[i].qteMax) : Math.ceil(this.app.store.PFEP[i].emballage.TF.nbPieces)
            )
        }

    }
    //list => PFEP
    verifyItemsContainers = () => {
        let baseContainers = this.app.store.PFEP.map(part => {
            if(part.storage.length > 0){ return part }
            else return null
        }).filter(a => a !== null)

        term(`\n ${baseContainers.length} pieces ont des contenants\n`)
        term(`aucune autre anaylse n'a ete programmee\n`)

        console.log(baseContainers.length)
        let filter1 = baseContainers.map(part => {
            let valid = true;
            part.storage.forEach(cont => {
                if(isNaN(cont.height) || isNaN(cont.width) || isNaN(cont.length)){
                    valid = false
                }
            })
            if(valid == true){ return part }
            else return null
        }).filter(a => a !== null)
        console.log(filter1.length)

    }

    manageAdress = (content) => {
        let menuItems = this.app.store.racking.map(rack => `${rack.name} - ${rack.address ? rack.address : 'N/D'}`);
        const displayRackShelves = (racking) => {

            function createPad(prop, pad){
                const filler = 'N/D';
                return prop ? prop.padEnd(pad) : filler.padEnd(pad)
            }
            let header = createPad('ID', 15) + createPad('Priorité', 10) + createPad('Type', 10) + createPad('Tag', 5)
            term.moveTo(2*term.width/3, 3); term.bold.underline('Étagères:\n');
            term.moveTo(2*term.width/3, 4); term.bold(header); term('\n')
            let shelvesItems = racking.shelves.map(shelf => {
                let name = createPad(shelf.name, 15)
                let priority = createPad(Math.ceil(shelf.priority).toString(), 10)
                let type = createPad(shelf.type, 10)
                let tag = createPad(shelf.tag, 5)
                return name + priority + type + tag
            })
            let menu = term.singleColumnMenu(shelvesItems, { cancelable: true, leftPadding: '\t\t\t\t\t\t\t\t\t\t\t\t ', keyBindings: { ENTER: 'submit', DOWN: 'next', UP: 'previous', CTRL_Z: 'escape' }}).promise
            menu.then((e) => {
                console.log(e)
            }).catch((e) => console.log(e))

        }

        const displayRacking = (racking) => {
            this.app.clearScreen()
            this.app.lastScreen = { ...this.app.lastScreen, type: 'initial' }
            
            const priority = (racking) => {
                let priorityArray = racking.shelves.map(shelf => {
                    if(shelf.priority && !isNaN(shelf.priority)){
                        return Math.ceil(shelf.priority)
                    } else return 'ND'
                })
                return priorityArray.toString()
            }
            //name, length, contentSides, height, tag, priority, shelfCount
            let marginLeft = term.width/3
            term.moveTo(marginLeft, 3); term.bold.underline(`Fiche racking:\n`)
            term.moveTo(marginLeft, 4); term.bold(`ID: `); term(racking.name);
            term.moveTo(marginLeft, 5); term.bold(`Adresse: `); term(racking.address ? racking.address : 'N/D');
            term.moveTo(marginLeft, 6); term.bold(`Longueur: `); term(racking.length);
            term.moveTo(marginLeft, 7); term.bold(`Hauteur: `); term(racking.height);
            term.moveTo(marginLeft, 8); term.bold('Tag: '); term(racking.tag);
            term.moveTo(marginLeft, 9); term.bold(`Priorité étagères: `); term(priority(racking))
            term.moveTo(marginLeft, 10); term.bold(`Contenu côtés: `); term(`${racking.contentSides[0] ? racking.contentSides[0] : 'N/D'}, ${racking.contentSides[1] ? racking.contentSides[1] : 'N/D'}`);
            term.moveTo(marginLeft, 11); term.bold(`Nombre d'étagères: `); term(racking.shelves.length);

            let setMenu = term.singleColumnMenu(
                ['Retour', 'Modifier adresse racking', 'Modifier adresses étagères'],
                { y: 13, leftPadding: '\t\t\t\t\t\t', cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', UP: 'previous', DOWN: 'next'} }
            ).promise
            setMenu.then((res) => {
                if(res.selectedIndex == 0){ rackingSelector(this.app.lastScreen) }
                else if(res.selectedIndex == 1){
                    this.app.enableGoBack = false;
                    term(`\nEntrer l'adresse du racking: `)
                    let inputField = term.inputField({cancelable: true, x: term.width/3, keyBindings: { ENTER: 'submit', BACKSPACE: 'backDelete', CTRL_Z: 'escape'}}).promise
                    inputField.then((res) => {
                        this.app.enableGoBack = true

                        //AJOUTER IF POUR PAS QUE 2 RACKING AIENT LA MEME ADRESSE
                        let target = this.app.store.racking.find(a => a.name == racking.name)
                        if(target !== undefined){ target.address = res }
                        rackingSelector({ index : this.app.lastScreen.index })
                    }).catch((e) => console.log(e))
                }
                else if(res.selectedIndex == 2){
                    this.app.lastScreen = {
                        ...this.app.lastScreen,
                        type: 'racking',
                    }
                    displayRackShelves(racking)
                }
            }).catch((e) => console.log(e))
        }
        
        const rackingSelector = (content) => {
            this.app.clearScreen()
            this.app.lastScreen = { screen: 'home' }
            term.bold(`Gestion de l'adressage\n`)
            term.bold(`ID rack - Adresse`)
            menuItems = this.app.store.racking.map(rack => `${rack.name} - ${rack.address ? rack.address : 'N/D'}`);
            let rackMenu = term.singleColumnMenu(
                menuItems,
                //arranger menuIndex
                { cancelable: true, selectedIndex: content.index ? content.index : 0, keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', UP: 'previous', DOWN: 'next'}}
            ).promise

            rackMenu.then((res) => {
                this.app.lastScreen = {
                    screen: 'manageAdress',
                    type: 'initial',
                    index: res.selectedIndex,
                    racking: this.app.store.rackManager.getRacking(res.selectedText.split(' - ')[0])
                }
                displayRacking(this.app.store.rackManager.getRacking(res.selectedText.split(' - ')[0]))

                
            }).catch((e) => console.log(e))
        }

        /*

        object = {
            type: racking || shelves ||
            index: racking index
            racking: racking object 
        }
        */

        if(typeof content == 'object'){
            if(content.type == 'initial'){
                rackingSelector(content)

            }
            else if(content.type == 'racking'){
                displayRacking(content.racking)
            }

        }
        else { rackingSelector(content ? content : 0) }
    }

    storeManagerMenu = () => {
        this.app.clearScreen();
        this.app.lastScreen.screen = 'home';
        let menuItems = [
            'Contenants pièces',
            'Vérification des contenants',
            'Générer magasin',
            'Vérification du magasin',
            'Gérer adressage',
            'Exporter magasin',
            'Importer magasin',

        ]
        let menu = term.singleColumnMenu(
            menuItems,
            {cancelable: true, keyBindings: { CTRL_Z:'escape', ENTER: 'submit', DOWN: 'next', UP: 'previous', }}            
        ).promise
        menu.then((res) => {
            this.app.lastScreen.screen = 'storeManagerMenu';
            switch(res.selectedIndex){
                case 0: this.assignItemsContainers(); break;
                case 1: this.verifyItemsContainers(); break;
                case 2: this.storeGenerator(); break;
                case 3: this.storeVerification(); break;
                case 4: this.manageAdress(); break;
                case 5: this.exportStore(); break;
                case 6: this.importStore(); break;
                default: this.app.home(); break;
            }
        }).catch((e) => console.log(e))

    }
    storeVerification = () => {
        this.app.lastScreen.screen = 'storeManagerMenu'
        this.app.clearScreen();
        term.bold(`Vérification du magasin\n`)
        
        let shelvesPartList = []
        this.app.store.shelves.forEach((shelf, index) => {
            shelf.content.map((item, index) => {
                if(shelvesPartList.indexOf(item.name.split('_')[1]) == -1){
                    shelvesPartList.push(item.name.split('_')[1])
                }
            })
        })

        let rackingPartList = [];
        let shelvesInRacking = [];
        this.app.store.racking.forEach((racking, index) => {
            racking.shelves.map((shelf, index) => {
                shelvesInRacking.push(shelf)
                shelf.content.map((item, index) => {
                    if(rackingPartList.indexOf(item.name.split('_')[1]) == -1){
                        rackingPartList.push(item.name.split('_')[1])
                    }
                })
            })
        })

        let failedShelves = this.app.store.shelves.map(shelf => {
            if(shelvesInRacking.findIndex((a) => a.name == shelf.name) == -1){ return shelf }
            else return null
        }).filter((a) => a !== null)
        failedShelves.forEach(s => console.log(s.name))



        let piecesNonPlacees = this.finalStoreList.map(part => {
            if(shelvesPartList.findIndex(a => a == part.code) == -1){
                return part
            } else return null
        }).filter(a => a !== null)


        let dataNonPlacees = {}
        piecesNonPlacees.forEach(part => { dataNonPlacees = { ...dataNonPlacees, [part.code]: part } })
        
        let dataNoContainer = {}
        this.noContainerList.forEach(part => { dataNoContainer = { ...dataNoContainer, [part.code]: part } })
        
        exportData.exportJSON(dataNonPlacees, 'piecesNonPlacees', '../SORTIE')
        exportData.exportJSON(dataNoContainer, 'piecesSansContenant', '../SORTIE')
        
        term(`Le PFEP contient ^y${this.app.store.PFEP.length}^: pièces\n`)
        
        term(`^y${this.initialStoreList.length}^: pièces ont initialement été sélectionnées pour le magasin\n`)
        term(`------------------------------\n`)
        term(`^y${this.finalStoreList.length}^: pièces ont des contenants et ont passé les algorithmes\n`)
        term(`^y${this.noContainerList.length}^: pièces n'ont pas de contentants et n'ont pas passé les algorithmes\n`)
        term.column(5); term(`*La liste de pièces sans contenants a été exportée dans le fichier [piecesSansContenant.json]\n`)
        term(`------------------------------\n`)
        term(`^y${shelvesPartList.length}^: pièces sont dans les étagères\n`)

        
        


        term(`Le magasin comprend ^y${this.app.store.shelves.length}^: shelves\n`)
        term(`Les racking comprennent ^y${shelvesInRacking.length}^: shelves\n`)
        term(`\n`)
        term(`^y${rackingPartList.length}^: pièces sont dans les racking\n`)


    }
    exportStore = () => {
        let iter = 0
        let groupIndex = 0;
        let index = 0

        let reviewObject = {
            shelves: this.app.store.shelves.map(shelf => {
                return {
                    name: shelf.name,
                    length: shelf.length,
                }
            }),
            racking: this.app.store.racking.map(rack => {
                return {
                    name: rack.name
                }

            })
        }
        exportData.exportJSON(reviewObject, 'storeReviewObject', '../SORTIE')

        let currentString = '['
        term(`^y${this.app.store.shelves.length}^: shelves sont dans le magasin\n`)
        term(`^y${this.app.store.racking.length}^: racking sont dans le magasin\n`)
        while(index < this.app.store.shelves.length + 1 && iter < 1000){
            iter++
            if(index < this.app.store.shelves.length && this.app.store.shelves[index] !== undefined){
                if(groupIndex < 4){
                    console.log(`adding ${this.app.store.shelves[index].name}, index: ${index}, GI: ${groupIndex}`)
                    currentString += JSON.stringify(this.app.store.shelves[index], null, 4) + ',';
                    groupIndex++
                    index++
                }
                else if(groupIndex == 4){
                    console.log(`adding ${this.app.store.shelves[index].name}, index: ${index}, GI: ${groupIndex}`)
                    currentString += JSON.stringify(this.app.store.shelves[index], null, 4) + ']'
                    groupIndex++
                    index++
                }
                else if(groupIndex == 5){
                    console.log(`exporting ${this.app.store.shelves[index].name}, index: ${index}, GI: ${groupIndex}`)
                    let name = `shelves_${index - groupIndex}_To_${index}`
                    groupIndex = 0;
                    fs.writeFile(`../SORTIE/shelves/${name}.json`, currentString, (err) => {
                        if(err){ console.log('ERROR ', err) }
                        else { console.log(`${name} exported successfully`) }
                    })
                    currentString = '['
                }
            }
            else if(index == this.app.store.shelves.length){
                iter == 1001;
                if(currentString.endsWith(',')){
                    currentString = currentString.substring(0, currentString.length - 1)
                }
                currentString += ']'
                console.log(`exporting ${this.app.store.shelves[index-1].name}, index: ${index}, GI: ${groupIndex}`)
                let name = `shelves_${index - groupIndex}_To_${index}`
                fs.writeFile(`../SORTIE/shelves/${name}.json`, currentString, (err) => {
                    if(err) { console.log('ERROR ' , err) }
                    else { console.log(`${name} exported successfully`) }
                })
                break;

            }
        }
        let data = []
        for(let i = 0; i < this.app.store.racking.length; i++){
            let rackData = { ...this.app.store.racking[i] }
            rackData.shelves = rackData.shelves.map(shelf => shelf.name)
            data.push(rackData)
        }
        term(`^y${index}^: shelves ont été exportées\n`)
        term(`^y${data.length}^: racking ont été exporté\n`)
        exportData.exportJSON(data, 'racking', '../SORTIE')
    }
    importStore = () => {
        let data = new Promise((resolve, reject) => {
            let rackingCall = fsPromise.readFile('../SORTIE/racking.json', 'utf8')
            rackingCall.then((res) => {
                let racking = JSON.parse(res)


                let files = fsPromise.readdir('../SORTIE/shelves')
                files.then((res) => {
                    return new Promise((resolve, reject) => {
                        let progress = 0;
                        let shelves = []
                        for(let i = 0; i < res.length; i++){
                            let readFile = fsPromise.readFile(`../SORTIE/shelves/${res[i]}`, 'utf8')
                            readFile.then((string) => {
                                progress++
                                if(string.length !== 0){
                                    console.log(res[i], string.length)
                                    let json = JSON.parse(string)
                                    shelves = shelves.concat(json)
                                    console.log(`shelves.length: ${shelves.length}`)
                                }
                                if(progress == res.length){ resolve(shelves) }
                            }).catch((e) => console.log(e))
                        }
                    }).then((shelves) => {
                        racking = racking.map(rack => {
                            let shelves_names = rack.shelves
                            let r = new Racking(rack.name, rack.length, rack.contentType, rack.tag);
                            r = { ...r, ...rack }
                            r.shelves = shelves_names.map(shelf_name => {
                                if (shelves.find(a => a.name == shelf_name) !== undefined) {
                                    let source = shelves.find(a => a.name == shelf_name)
                                    let shelfData = {
                                        length: source.length,
                                        rating: source.capacity * 2.2046
                                    }
                                    let s = new Shelf(source.name, shelfData)
                                    s = { ...s, ...source }
                                    return s
                                }
                                else { console.log('CORRUPTED FILES!!'); return undefined }
                            })
                            return r
                        })
                        
                        let review = fsPromise.readFile('../SORTIE/storeReviewObject.json', 'utf8')
                        review.then((reviewObject) => {
                            reviewObject = JSON.parse(reviewObject)
                            
                            let check1 = reviewObject.shelves.map(shelf => { //checking shelves array with storeReviewObject
                                if(shelves.findIndex(a => a.name == shelf.name) !== -1){ return true }
                                else return false
                            }).filter(a => a !== false)

                            let check2 = reviewObject.shelves.map(shelf => {    //checking shelves in racking with storeReviewObejct
                                let present = false;
                                racking.forEach(rack => {
                                    if(rack.shelves.findIndex(a => a.name == shelf.name) !== -1){ present = true }
                                })
                                return present
                            }).filter(a => a !== false)

                            let check3 = reviewObject.racking.map(rack => {     //checking racking with storeReviewObject
                                if(racking.findIndex(a => a.name == rack.name) !== -1){ return true }
                                else return false
                            }).filter(a => a !== false)

                            if(reviewObject.shelves.length == check1.length && check1.length == check2.length && reviewObject.racking.length == check3.length){
                                term(`Le magasin a été importé avec succès!\n`)
                                this.app.store.racking = racking
                                this.app.store.shelves = shelves
                            }
                            else { term(`Problème lors de l'importation du magasin\n`) }
                        }).catch((e) => console.log(e))
                    }).catch((e) => console.log(e))
                }).catch((e) => console.log(e))
            }).catch((e) => console.log(e))
        })
    }

    storeGenerator = () => {
        this.app.clearScreen();
        term.bold("Création d'un magasin de pièces\n")
        let list = this.partSelector(this.app.store.PFEP)
        list.then((partList) => {
            this.app.log += '----- initializing store creation -----\n'
            this.app.log += `Initial partlist length: ${partList.length}\n`
            this.initialStoreList = partList;
            let split = this.app.store.rackManager.splitPartsByTag(partList)
            let tags = Object.keys(split)
            
            
            this.app.log += `tag categories are ${tags}\n`
            tags.forEach(tag => {
                let sorted = this.app.store.rackManager.getPriorityList(split[tag]);    //sorted tagList
                this.noContainerList = this.noContainerList.concat(sorted.filter((a) => a.storage.length == 0));    //filter noContainer

                sorted = sorted.filter((a) => a.storage.length > 0);    //filter container
        
                
                this.app.log += `sending ${sorted.length} parts to placeInRacking\n`
                this.finalStoreList = this.finalStoreList.concat(sorted);   //pushing parts that does algo to go in shelves
                this.app.store.rackManager.placeInRacking(sorted, tag); //calling place in racking on partList
                //this.app.store.rackManager.test(sorted, tag);
            })

            this.app.store.rackManager.optimizeRacking()
            //noContainer.forEach(a => console.log(a.length))
            this.app.log += `finalStoreList: ${this.finalStoreList.length}\n`
            term(`Les pièces sont séparées selon ${tags.length} tags dans les racking: ${tags}\n`)
             //option pour voir liste de priorité


             
             /*
            sorted.map(a => {
            term.column(0); term(a.code);
            term.column(15); term(Math.ceil(a.consommation.mensuelleMoy));
            term.column(25); term(a.class)
            term('\n')
            })
            */


            //this.filterPFEP(this.app.store.PFEP).map(a => console.log(a.code, a.description, a.class, a.family))

            exportData.exportTxt(this.app.log, 'log', '../SORTIE')

        }).catch((e) => console.log(e))


    } 
    addPartsToList = (list, potential) => {
        console.log('FEATURE IN DEV')
        return list
    }

    partSelector = (PFEP) => {
        return new Promise((exportList, exportError) => {
            let finalList; let rejectedFinal;
            term(`Entrer le nombre minimal de commande fournisseur pour considérer une pièce:\n`)
            let minOrderQte = term.inputField({ cancelable: true, keyBindings: { ENTER: 'submit', CTRL_Z: 'cancel', BACKSPACE: 'backDelete' } }).promise
            minOrderQte.then((qte) => {
                term.eraseArea(0, 2, term.width, 10); term.moveTo(0, 2);
                return new Promise((resolve, reject) => {
                    if (qte !== undefined && !isNaN(qte)) { resolve(qte) }
                    else reject('qte is not a number')
                })
                    .then((qte) => {
                        //code to get initial partList, then chosing option
                        this.minOrderQte = qte;
                        let storeFilter = this.getStoreList(PFEP, qte)
                        term(`Le PFEP contient ^y${PFEP.length}^: pièces\n`)
                        term.column(5); term(`^y${storeFilter[0].length}^: pièces ont été retenues\n`)
                        term.column(5); term(`^y${storeFilter[1].length}^: pièces ont été rejetées\n`)
                        term(`Les listes de pièces retenues et rejetées sont exportées sous les noms [piecesRetenues] et [piecesRejetees]\n`)

                        let dataRetenues = {}; let dataRejetees = {};
                        storeFilter[0].forEach((a) => { dataRetenues = { ...dataRetenues, [a.code]: a } }); exportData.exportJSON(dataRetenues, 'piecesRetenues', '../SORTIE');
                        storeFilter[1].forEach((a) => { dataRejetees = { ...dataRejetees, [a.code]: a } }); exportData.exportJSON(dataRejetees, 'piecesRejetees', '../SORTIE');

                        let potentialAddition = storeFilter[1].filter((a) => a.storage.length > 0)
                        term(`\nParmis les pièces rejetées, ^y${potentialAddition.length}^: pièces ont des contenants et peuvent être placées dans le magasin\n`)

                        let items = ['ajouter toutes les pièces', 'continuer sans ajouter les pièces', 'sélection manuelle des pièces à ajouter']
                        let option = term.singleLineMenu(items, { cancelable: true, keyBindings: { LEFT: 'previous', RIGHT: 'next', ENTER: 'submit', CTRL_Z: 'escape' } }).promise
                        option.then((opt) => {
                            return new Promise((resolve, reject) => {
                                if (opt.selectedIndex !== undefined) { resolve(opt) }
                                else reject('error - not option selected')
                            }).then((selectedOption) => {
                                //code for merging partLists
                                if (selectedOption.selectedIndex == 0) {
                                    storeFilter[0] = storeFilter[0].concat(potentialAddition)
                                    storeFilter[0] = storeFilter[0].sort((a, b) => { if (a.code < b.code) return -1; if (a.code > b.code) return 1 })
                                    finalList = storeFilter[0];
                                    rejectedFinal = storeFilter[1].filter((a) => a.storage.length == 0)
                                }
                                else if (selectedOption.selectedIndex == 1) {
                                    finalList = storeFilter[0]
                                    rejectedFinal = storeFilter[1]
                                }
                                else if (selectedOption.selectedIndex == 2) {
                                    console.log('\n\nFEATURE IN DEV - EXIT THE PROGRAM')
                                }

                                if (finalList) {
                                    term.eraseArea(0, 2, term.width, 20); term.moveTo(0, 2);
                                    term(`La liste de pièce pour le magasin comporte maintenant ^y${finalList.length}^: pièces\n`)
                                    term(`Les listes de pièces retenues et rejetées sont exportées sous les noms [piecesRetenues] et [piecesRejetees]\n`)

                                    let dataFinalList = {}; let dataRejected = {};
                                    finalList.forEach((a) => { dataFinalList = { ...dataFinalList, [a.code]: a } }); exportData.exportJSON(dataFinalList, 'piecesRetenues', '../SORTIE');
                                    rejectedFinal.forEach((a) => { dataRejected = { ...dataRejected, [a.code]: a } }); exportData.exportJSON(dataRejected, 'piecesRejetees', '../SORTIE');

                                }
                                let confirm = term.singleLineMenu(['Continuer', 'Annuler'], { cancelable: true, keyBindings: { LEFT: 'previous', RIGHT: 'next', ENTER: 'submit', CTRL_Z: 'escape' } }).promise
                                confirm.then((confirmation) => {
                                    return new Promise((resolve, reject) => {
                                        if (confirmation.selectedIndex == 0) { resolve(true) }
                                        else { reject(false) }
                                    }).then((confirmationBool) => {
                                        term.eraseArea(0, 2, term.width, 20); term.moveTo(0, 2);
                                        exportList(finalList)
                                    }).catch((confirmationBool) => {
                                        term.eraseArea(0, 2, term.width, 20); term.moveTo(0, 2);
                                        exportError(`L'opération a été annulée\n`)
                                    })
                                }).catch((e) => { console.log(e) })
                            }).catch((e) => { console.log('catch'); console.log(e) })
                        }).catch((e) => { console.log(e) })
                    }).catch((error) => { console.log(error) })
            })
        })
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
    /**
     * Creates and assign new customContainer
     * @param {*object} item 
     * @param {*string} type 
     * @param {number} qte 
     * @returns Array of single customContainer
     */
    makeCustomContainer(item, type, qte){
        let container;
        let partsLeft = qte
        //let partsLeft = qte !== 0 ? qte : 50;
        if(!isNaN(item.specs.height) && !isNaN(item.specs.width) && !isNaN(item.specs.length) && Number(item.specs.length) * Number(item.specs.width) * Number(item.specs.height) !== 0){

            console.log(`type: ${type}, partsLeft: ${partsLeft}`)
            if(!isNaN(partsLeft)){
                let name = 'customContainer_' + item.code + '_0';
                container = new CustomContainer(name, type, item, partsLeft)
            }
            else{
                partsLeft = 50; //WE DEFINE qteMax WHEN IT IS UNDEFINED!!! NOT OPTIMAL
                let name = 'customContainer_' + item.code + '_0';
                container = new CustomContainer(name, type, item, partsLeft)
            }
        } else return [null]
        return [container]
    }

    makeBUs(item, type, qte){
        let container;
        let partsLeft = qte;
        if(!isNaN(item.specs.height) && !isNaN(item.specs.width) && !isNaN(item.specs.length) && Number(item.specs.length) * Number(item.specs.width) * Number(item.specs.height) !== 0){
            let name = 'bUs_' + item.code + '_0';
            if(isNaN(partsLeft)){ partsLeft = 50 }
            container = new bUs(name, item, partsLeft, type)   
        } else return [null]
        
        if(container.checkValid() == true){
            return [container]
        } else return [null]
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