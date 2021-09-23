const term = require(`terminal-kit`).terminal

const phoneNumber = (number) => {
    return number.substring(0, 3) + '-' + number.substring(3, 6) + '-' + number.substring(6, 11)
}
const address = (addressObject) => {
    return 'nothing yet'
}
const dimensions = (specs) => {
    let str = ''; let array = [];
    let dimensionsSpecs = ['length', 'width', 'height']
    for(const spec in specs){
        if(dimensionsSpecs.includes(spec)){
            array.push(specs[spec])
        }
    }
    str += Math.ceil(array[0]).toString()
    for(let i = 1; i < array.length; i++){
        str += ` x ${Math.ceil(array[i]).toString()}`
    }
    return str += ` (mm)`
}
const utilite = (partUtilite) => {
    let utiliteStr; 
    if(Array.isArray(partUtilite)){
        partUtilite.forEach(u => utiliteStr += u + ','); utiliteStr = utiliteStr.substring(0, utiliteStr.length - 1);  //format utilité
    } else utiliteStr = partUtilite
    return utiliteStr
}

class FichePiece{
    constructor(app){
        this.app = app
        this.bindCursorToKeys = false


    }

    rawData = (part) => {
        this.app.clearScreen()
        console.log(part)
    }

    displayHistoric = (history) => {
        this.app.clearScreen()
        const header = 'Historique des commandes'
        term.moveTo(term.width/2 - header.length/2, 2); term.bold.underline(header); term('\n');
        const levels = [5, 15, 25, 35];
        const filler = 'N/D';
        term.column(levels[0]); term.bold.underline('Année');
        term.column(levels[1]); term.bold.underline('Mois');
        term.column(levels[2]); term.bold.underline('Jour');
        term.column(levels[3]); term.underline.yellow('Nombre de pièces commandées')
        term('\n')
        for(const year in  history){
            term.column(levels[0]); term.bold(year ? year : filler); term(': \n')
            for(const month in history[year]){
                term.column(levels[1]); term.bold(month ? month : filler); term(': ')
                for(const day in history[year][month]){
                    term.column(levels[2]); term(day ? day : filler);
                    term.column(levels[3]); term.yellow(history[year][month][day] ? history[year][month][day] : filler); term('\n')
                }
            }   
        }
    }
    modifierPiece = (part) => {
        this.app.clearScreen()
        //this.app.lastScreen.screen = 'home'
        const leftMargin = 5; const filler = 'ND'
        this.bindCursorToKeys = true
        let index = 0

        let bluePrints = [];
        term.moveTo(leftMargin, 4); term.bold.underline('INFORMATIONS PRINCIPALES');
        term.moveTo(leftMargin, 14); term.bold.underline(`INFORMATIONS FOURNISSEUR`);
        term.moveTo(leftMargin, 22); term.bold.underline('INFORMATIONS EMBALLAGE');
        term.moveTo(leftMargin, 30); term.bold.underline('INFORMATIONS ENTREPOSAGE');
        term.moveTo(term.width/3+leftMargin, 4); term.bold.underline('INFORMATIONS DE CONSOMMATION')

        let primary = this.primaryInfos(part, leftMargin, filler, 5); primary ? bluePrints = bluePrints.concat(primary) : null;
        let supplier = this.supplierInfos(part.supplier[0], leftMargin, filler, 15); supplier ? bluePrints = bluePrints.concat(supplier) : null;
        let emballage = this.emballage(part.emballage, leftMargin, filler, 23); emballage ? bluePrints = bluePrints.concat(emballage) : null
        let storage = this.storage(part.storage, leftMargin, filler, 31); storage ? bluePrints = bluePrints.concat(storage) : null
        let consommation = this.consommation(part.consommation, term.width/3+leftMargin, filler, 5); consommation ? bluePrints = bluePrints.concat(consommation) : null
        bluePrints = bluePrints.sort((a, b) => {
            if(a.y == b.y) return a.x - b.x
            else return a.y - b.y
        })




        function moveCursor_old(dir, bP) {
            let location = term.getCursorLocation();
            location.then((pos) => {
                let x; let y;

                if (dir == 'UP') {
                    if (bP.findIndex(a => a.y == pos.y - 1) !== -1) {
                        let p = bP.find(a => a.y == pos.y - 1);
                        x = p.x + p.name.length
                    }



                    else {
                        let target = bP.sort((a, b) => { return Math.abs(b.y - pos.y) - Math.abs(a.y - pos.y) })
                        console.log(target)
                        target = target.findIndex(a => a.y - pos.y > 0)
                        if (target !== undefined) {
                            x = target.x;
                            y = target.y
                        }
                        else {
                            x = 1;
                            y = 1
                        }

                    }
                    term.moveTo(x, y)
                    return { x: x, y: y }

                }
                else if (dir == 'DOWN') {
                    if (bP.findIndex(a => a.y == pos.y + 1) !== -1) {
                        let p = bP.find(a => a.y == pos.y + 1);
                        x = p.x + p.name.length
                    } else x = pos.x
                    term.moveTo(x, pos.y + 1)
                    return { x: x, y: pos.y + 1 }

                }

            }).catch((e) => console.log(e))
        }

        const pannel = (bP, index) => {
            bP = bP.sort((a, b) => {
                if(a.x == b.x){
                    return a.y - b.y
                }
                return a.x - b.x
            })
            term.moveTo(bP[index].x, bP[index].y)
            return index


        }
        const moveCursor = (dir, bP) => {
            let getPosition = term.getCursorLocation()
            getPosition.then((pos) => {
                let target = bP.sort((a, b) => {
                    if(a.x == b.x){
                        return a.y - b.y
                    }
                    return a.x - b.x
                })
                if(dir == 'UP' || dir == 'DOWN'){
                    let targetX = bP.sort((a, b) => Math.abs(a.x-pos.x) - Math.abs(b.x-pos.x))[0].x
                    target = target.filter(a => a.x == targetX || a.x == targetX+5).sort((a, b) => Math.abs(a.y - pos.y) - Math.abs(b.y - pos.y))
                    if(dir == 'DOWN'){
                        target = target.filter(a => pos.y - a.y < 0).find(a => a !== undefined)
                        term.moveTo(target.x, target.y)

                    }
                    else if(dir == 'UP'){
                        target = target.filter(a => pos.y - a.y > 0).find(a => a !== undefined)
                        term.moveTo(target.x, target.y)
                    }
    
                }
                else if(dir == 'LEFT' || dir == 'RIGHT'){
                    let columns = [];
                    target.forEach(t => { if(columns.indexOf(t.x) == -1){ columns.push(t.x) }})
                    for(let i = 1; i < columns.length; i++){ if(columns[i-1] == columns[i] - 5){ columns.splice(i, 1) } }
                    //target = target.filter((a) => a.x columns.indexOf(a.x) !== -1)
                    console.log(target)


                }

            })
        }


        term.on('key', (key) => {
            if(this.bindCursorToKeys === true){
                let position;
                if (key == 'UP') {
                    if(index == bluePrints.length - 1){ index = 0}
                    else index++
                    pannel(bluePrints, index)
                    //position = moveCursor('UP', bluePrints)
                }
                else if (key == 'DOWN') {
                    if(index == 0){ index = bluePrints.length - 1 }
                    else index--
                    pannel(bluePrints, index)
                    //position = moveCursor('DOWN', bluePrints)
                }
                else if (key == 'LEFT') {
                    pannel(bluePrints, index)
                    position = moveCursor('LEFT', bluePrints)
                }
                else if (key == 'RIGHT') {
                    pannel(bluePrints, index)
                    position = moveCursor('RIGHT', bluePrints)
                }








                    
                else if(key == 'CTRL_Z'){
                    this.bindCursorToKeys = false
                    term.reset();
                }

            }

            
        })



    }
    accessProp = (part, path) => {
        let split = path.split('.')
        let obj = part
        for(let i = 0; i < split.length; i++){
            obj = obj[split[i]]
        }
        return obj
    }

    /**
     * Takes 8 lines
     * @param {*} part 
     * @param {*} leftMargin 
     * @param {*} filler 
     * @param {*} yStart 
     * @returns 
     */
    primaryInfos = (part, leftMargin, filler, yStart) => {
        let bluePrints = [
            { prop:'code', name: 'Code: ', y: yStart, x: leftMargin, type: 'primary' },
            { prop:'description', name: 'Description: ', y: yStart + 1, x: leftMargin, type: 'primary' },
            { prop:'family', name: 'Famille: ', y: yStart + 2, x: leftMargin, type: 'primary' },
            { prop:'utilite', name: 'Utilité: ', y: yStart + 3, x: leftMargin, type: 'primary' },
            { prop:'class', name: 'Classe: ', y: yStart + 4, x: leftMargin, type: 'primary' },
            { prop:'tag', name: 'Tag: ', y: yStart + 5, x: leftMargin, type: 'primary' },
            { prop:'specs', name: 'Dimensions: ', y: yStart + 6, x: leftMargin, type: 'primary' },
            { prop:'specs.weight', name: 'Masse: ', y: yStart + 7, x: leftMargin, type: 'primary' },
        ]

        bluePrints.forEach(s => {
            if(s.name == 'Dimensions: '){
                term.moveTo(s.x, s.y); term.bold(s.name); term(dimensions(part[s.prop]) ? dimensions(part[s.prop]).substring(0, 20) : filler);
            }
            else if(s.name == 'Masse: '){
                term.moveTo(s.x, s.y); term.bold(s.name); term(this.accessProp(part, s.prop) ? this.accessProp(part, s.prop).toString().substring(0, 20) : filler);
            }
            else {
                term.moveTo(s.x, s.y); term.bold(s.name); term(part[s.prop] ? part[s.prop].toString().substring(0, 20) : filler);
            }

        })

        return bluePrints

    }

    /**
     * Takes 6 lines
     * @param {*} supplier 
     * @param {*} leftMargin 
     * @param {*} filler 
     * @param {*} yStart 
     * @returns 
     */
    supplierInfos = (supplier, leftMargin, filler, yStart) => {
        if(supplier !== undefined){
            let bluePrints = [
                { name: 'Nom: ', prop: 'name', x: leftMargin, y: yStart, type: 'supplier' },
                { name: 'Téléphone: ', prop: 'phone', x: leftMargin, y: yStart + 1, type: 'supplier' },
                { name: 'Fax: ', prop: 'fax', x: leftMargin, y: yStart + 2, type: 'supplier' },
                { name: 'Adresse: ', prop: 'address', x: leftMargin, y: yStart + 3, type: 'supplier' },
                { name: 'Lead time moyen: : ', prop: 'leadTime', x: leftMargin, y: yStart + 4, type: 'supplier' },
                { name: 'Lead time max: ', prop: 'leadTimeMax', x: leftMargin, y: yStart + 5, type: 'supplier' },
            ]
            bluePrints.forEach(b => {
                if(b.name == 'Adresse: '){
                    term.moveTo(b.x, b.y); term.bold(b.name); term(supplier[b.prop] ? supplier[b.prop].toString().substring(0, 20) : filler)
    
                }
                else { 
                    term.moveTo(b.x, b.y); term.bold(b.name); term(supplier[b.prop] ? supplier[b.prop].toString().substring(0, 20) : filler)
                }
            })
            return bluePrints
        }
        else {
            term.moveTo(leftMargin, yStart); term.red('Informatins fournisseur manquantes')
        } 
        
    }
    /**
     * takes 6 lines
     * @param {*} emballage 
     * @param {*} leftMargin 
     * @param {*} filler 
     * @param {*} yStart 
     * @returns 
     */
    emballage = (emballage, leftMargin, filler, yStart) => {
        let bluePrints = [
            { prop: null, name: 'Emballage Techno-Fab:', x: leftMargin, y: yStart, type: 'emballage' },
            { prop: 'TF.type', name: 'Type: ', x: leftMargin, y: yStart + 1, type: 'emballage' },
            { prop: 'TF.nbPieces', name: 'Nombre de pièces / contenant: ', x: leftMargin, y: yStart + 2, type: 'emballage' },
            { prop: null, name: 'Emballage fournisseur:', x: leftMargin, y: yStart + 3, type: 'emballage' },
            { prop: 'fournisseur.type', name: 'Type: ', x: leftMargin, y: yStart + 4, type: 'emballage' },
            { prop: 'fournisseur.nbPieces', name: 'Nombre de pièces / contenant: ', x: leftMargin, y: yStart + 5, type: 'emballage' },
        ]
        bluePrints.forEach(p => {
            if(p.prop == null){
                term.moveTo(p.x, p.y); term.bold(p.name);

            }
            else {
                term.moveTo(p.x, p.y); term.bold(p.name); term(this.accessProp(emballage, p.prop) ? this.accessProp(emballage, p.prop).toString().substring(0, 5) : filler)
            }
        })
        return bluePrints
    }

    storage = (storage, leftMargin, filler, yStart) => {
        if(storage.length > 0){
            let bluePrints = [
                { prop: 'type', name: 'Type de contenant: ', x: leftMargin, y: yStart, type: 'storage' },
                { prop: 'count', name: 'Nombre de piece / contenant: ', x: leftMargin, y: yStart + 1, type: 'storage' },
                { prop: 'length', name: 'Nombre de contenants maximal: ', x: leftMargin, y: yStart + 2, type: 'storage' },
                { prop: 'weight', name: 'Masse: ', x: leftMargin, y: yStart + 3, type: 'storage' },
                { prop: 'dimensions', name: 'Dimensions: ', x: leftMargin, y: yStart + 4, type: 'storage' },
            ]
            bluePrints.forEach(p => {
                let container = storage[0]
                if(p.name == 'Dimensions: '){
                    term.moveTo(p.x, p.y); term.bold(p.name); term(dimensions(storage[p.prop]) ? dimensions(storage[p.prop]).toString().substring(0, 10) : filler);
                }
                else if(p.name == 'Nombre de contenants maximal: '){
                    term.moveTo(p.x, p.y); term.bold(p.name); term(storage.length ? storage.length.toString().substring(0, 10) : filler);
    
                }
                else {
                    term.moveTo(p.x, p.y); term.bold(p.name); term(container[p.prop] ? container[p.prop].toString().substring(0, 10) : filler);
                }
            })
            return bluePrints
        }
        else {
            term.moveTo(leftMargin, yStart); term.red(`Informations d'entreposage manquantes`)
        }
    }

    consommation = (consommation, leftMargin, filler, yStart) => {
        let bluePrints = [
            { prop: 'mensuelleMoy', name: 'Consommation mensuelle moyenne: ', x: leftMargin, y: yStart, type: 'consommation' },
            { prop: 'mensuelleMax', name: 'Consommation mensuelle maximale: : ', x: leftMargin, y: yStart + 1, type: 'consommation' },
            { prop: 'anuelle', name: 'Consommation anuelle moyenne: : ', x: leftMargin, y: yStart + 2, type: 'consommation' },
            { prop: 'commandeType', name: 'Commande typique: ', x: leftMargin, y: yStart + 3, type: 'consommation' },
            { prop: 'freqReappro', name: 'Fréquence de réapprovisionnement: ', x: leftMargin, y: yStart + 4, type: 'consommation' },
        ]
        bluePrints.forEach(p => {
            term.moveTo(p.x, p.y); term.bold(p.name); term(consommation[p.prop] ? consommation[p.prop].toString().substring(0, 5) : filler)
        })
        return bluePrints
    }

    displayPart = (part) => {
        this.app.clearScreen()
        this.app.lastScreen.screen = 'rechercherItem'
        if(typeof part == 'string'){ part = this.app.store.getItemFromPFEP(part) }
        
        const partMenu = (leftMargin) => {
            term.column(leftMargin); term.bold.underline(`MENU PIÈCE`); term('\n');
            const menuItems = [
                'Afficher données brutes',
                'Historique des commandes',
                'Modifier pièce',
            ]
            let menu = term.singleColumnMenu(
                menuItems,
                {leftPadding: '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t', cancelable: true, keyBindings: { CTRL_Z: 'escape', ENTER: 'submit', DOWN: 'next', UP: 'previous'}}
            ).promise

            menu.then((res) => {
                this.app.clearScreen()
                if(res !== undefined){
                    if(res.canceled !== true){
                        this.app.lastScreen = {screen: 'displayPart', content: part };
                        switch(res.selectedIndex){
                            case 0: this.rawData(part); break;
                            case 1: this.displayHistoric(part.history); break;
                            case 2: this.modifierPiece(part)
                        }
                    }
                }
            }).catch((e) => console.log(e))

        }

        //CALLS TO DISPLAY INFOS
        const leftMargin = 5
        let filler = 'undefined'
        let str = `FICHE DE PIÈCE: ${part.code}`
        term.moveTo(term.width/2-str.length/2, 2).bold.underline(str); term('\n')

        term.moveTo(leftMargin, 4), term.bold.underline(`INFORMATION PRINCIPALES`);
        this.primaryInfos(part, leftMargin, filler, 5);

        term.moveTo(leftMargin, 14), term.bold.underline(`FOURNISSEUR PRINCIPAL`);
        this.supplierInfos(part.supplier[0], leftMargin, filler, 15);

        term.moveTo(leftMargin, 22); term.bold.underline(`INFORMATION EMBALLAGE`);
        this.emballage(part.emballage, leftMargin, filler, 23);

        term.moveTo(leftMargin, 30); term.bold.underline(`INFORMATIONS D'ENTREPOSAGE`);
        this.storage(part.storage, leftMargin, filler, 31);

        term.moveTo(3, 3)
        term.moveTo(term.width/3 + leftMargin, 4); term.bold.underline(`INFORMATION DE CONSOMMATION`);
        this.consommation(part.consommation, term.width/3 + leftMargin, filler, 5);

        term.moveTo(3, 3)
        partMenu(2*term.width/3 + leftMargin)

        term.moveTo(2*term.width/3, 3*term.height/4);
        let pos = this.app.store.getPartsLocation(part)
        term(`rack: `); term.yellow(pos.rack); term(`  shelf: `); term(pos.shelf)
        term.styleReset(0)
    }
}



module.exports = FichePiece