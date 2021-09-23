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
        //this.app.lastScreen.screen = 'home'
        const leftMargin = 5; const filler = 'ND'
        let bluePrints = this.primaryInfos(part, leftMargin, filler, 3)
        bluePrints = bluePrints.concat(this.supplierInfos(part.supplier[0], leftMargin, filler, 15))
        bluePrints = bluePrints.concat(this.emballage(part.emballage, leftMargin, filler, 22))
        if(part.storage.length > 0){
            bluePrints = bluePrints.concat(this.storage(part.storage, leftMargin, filler, 30))
        }
        bluePrints = bluePrints.concat(this.consommation(part.emballage, term.width/3+leftMargin, filler, 4))



        function moveCursor(dir, bP){
            let location = term.getCursorLocation();
            location.then((pos) => {
                let x;
                if(dir == 'UP'){
                    if(bP.findIndex(a => a.y == pos.y-1) !== -1){
                        let p = bP.find(a => a.y == pos.y-1);
                        x = p.x + p.name.length
                    }
                    else x = pos.x
                    term.moveTo(x, pos.y-1)

                }
                else if(dir == 'DOWN'){
                    if(bP.findIndex(a => a.y == pos.y+1) !== -1){
                        let p = bP.find(a => a.y == pos.y+1);
                        x = p.x + p.name.length
                    } else x = pos.x
                    term.moveTo(x, pos.y+1)

                }

            }).catch((e) => console.log(e))
        }
        term.on('key', (key) => {
            if(key == 'UP'){
                moveCursor('UP', bluePrints)
            }
            else if(key == 'DOWN'){
                moveCursor('DOWN', bluePrints)

            }
            else if(key == 'CTRL_Z'){
                term.reset();
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
            { prop:'code', name: 'Code: ', y: yStart, x: leftMargin },
            { prop:'description', name: 'Description: ', y: yStart + 1, x: leftMargin},
            { prop:'family', name: 'Famille: ', y: yStart + 2, x: leftMargin},
            { prop:'utilite', name: 'Utilité: ', y: yStart + 3, x: leftMargin},
            { prop:'class', name: 'Classe: ', y: yStart + 4, x: leftMargin},
            { prop:'tag', name: 'Tag: ', y: yStart + 5, x: leftMargin},
            { prop:'specs', name: 'Dimensions: ', y: yStart + 6, x: leftMargin},
            { prop:'specs.weight', name: 'Masse: ', y: yStart + 7, x: leftMargin},
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
/* 
        term.column(leftMargin); term.bold.underline(`INFORMATIONS PRIMAIRES\n`)
        term.moveTo(leftMargin, bluePrints[0].y); term.bold(bluePrints[0].name); term(part.code ? part.code.substring(0, 20) : filler);
        //term.column(leftMargin); term.bold('Code: '); term(part.code ? part.code.substring(0, 20) : filler); term('\n');
        term.moveTo(bluePrints[1].x, bluePrints[1].y); term.bold(bluePrints[1].name); term(part[bluePrints[1].prop] ? part[bluePrints[1].prop].toString().substring(0, 20) : filler);
        //term(part.description ? part.description.substring(0, 20) : filler); term('\n');
        term.moveTo(bluePrints[2].x, bluePrints[2].y); term.bold(bluePrints[2].name); term(part[bluePrints[1].prop] ? part[bluePrints[1].prop].toString().substring(0, 20) : filler);
        term.moveTo(bluePrints[3].x, bluePrints[3].y); term.bold(bluePrints[3].name); term(part[bluePrints[1].prop] ? part[bluePrints[1].prop].toString().substring(0, 20) : filler);
        term.moveTo(bluePrints[4].x, bluePrints[4].y); term.bold(bluePrints[4].name); term(part[bluePrints[1].prop] ? part[bluePrints[1].prop].toString().substring(0, 20) : filler);
        term.moveTo(bluePrints[5].x, bluePrints[5].y); term.bold(bluePrints[5].name); term(part[bluePrints[1].prop] ? part[bluePrints[1].prop].toString().substring(0, 20) : filler);
        term.moveTo(bluePrints[6].x, bluePrints[6].y); term.bold(bluePrints[6].name); term(part[bluePrints[1].prop] ? part[bluePrints[1].prop].toString().substring(0, 20) : filler);
        term.moveTo(bluePrints[7].x, bluePrints[7].y); term.bold(bluePrints[7].name); term(part[bluePrints[1].prop] ? part[bluePrints[1].prop].toString().substring(0, 20) : filler);
 */

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
        let bluePrints = [
            { name: 'Nom: ', prop: 'name', x: leftMargin, y: yStart },
            { name: 'Téléphone: ', prop: 'phone', x: leftMargin, y: yStart + 1 },
            { name: 'Fax: ', prop: 'fax', x: leftMargin, y: yStart + 2 },
            { name: 'Adresse: ', prop: 'address', x: leftMargin, y: yStart + 3 },
            { name: 'Lead time moyen: : ', prop: 'leadTime', x: leftMargin, y: yStart + 4 },
            { name: 'Lead time max: ', prop: 'leadTimeMax', x: leftMargin, y: yStart + 5 },
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
            { prop: null, name: 'Emballage Techno-Fab:', x: leftMargin, y: yStart },
            { prop: 'TF.type', name: 'Type: ', x: leftMargin + 5, y: yStart + 1 },
            { prop: 'TF.nbPieces', name: 'Nombre de pièces / contenant: ', x: leftMargin + 5, y: yStart + 2 },
            { prop: null, name: 'Emballage fournisseur:', x: leftMargin, y: yStart + 3},
            { prop: 'fournisseur.type', name: 'Type: ', x: leftMargin + 5, y: yStart + 4 },
            { prop: 'fournisseur.nbPieces', name: 'Nombre de pièces / contenant: ', x: leftMargin+5, y: yStart + 5},
        ]
        bluePrints.forEach(p => {
            if(p.prop == null){
                term.moveTo(p.x, p.y); term.bold(p.name);

            }
            else {
                term.moveTo(p.x, p.y); term.bold(p.name); term(this.accessProp(emballage, p.prop) ? this.accessProp(emballage, p.prop) : filler)
            }
        })
        return bluePrints
    }

    storage = (storage, leftMargin, filler, yStart) => {
        if(storage.length > 0){
            let bluePrints = [
                { prop: 'type', name: 'Type de contenant: ', x: leftMargin, y: yStart},
                { prop: 'count', name: 'Nombre de piece / contenant: ', x: leftMargin, y: yStart + 1},
                { prop: 'length', name: 'Nombre de contenants maximal: ', x: leftMargin, y: yStart + 2},
                { prop: 'weight', name: 'Masse: ', x: leftMargin, y: yStart + 3},
                { prop: 'dimensions', name: 'Dimensions: ', x: leftMargin, y: yStart + 4},
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

    }
    consommation_old = (consommation, leftMargin, filler) => {
        if(consommation){
            term.column(leftMargin); term.bold.underline(`INFORMATION DE CONSOMMATION`); term('\n');
            term.column(leftMargin); term.bold(`Consommation mensuelle moyenne: `); term(consommation.mensuelleMoy ? consommation.mensuelleMoy.toString().substring(0, 5) : filler); term('\n')
            term.column(leftMargin); term.bold(`Consommation mensuelle maximale: `); term(consommation.mensuelleMax ? consommation.mensuelleMax.toString().substring(0, 5) : filler); term('\n')
            term.column(leftMargin); term.bold(`Consommation anuelle moyenne: `); term(consommation.anuelle ? consommation.anuelle.toString().substring(0, 5) : filler); term('\n');
            term.column(leftMargin); term.bold(`Commande typique: `); term(consommation.commandeType ? consommation.commandeType.toString().substring(0, 5) : filler); term('\n');
            term.column(leftMargin); term.bold(`Fréquence de réapprovisionnement: `); term(consommation.freqReappro ? consommation.freqReappro.toString().substring(0, 5) + ` mois` : filler); term('\n');

            term.column(leftMargin); term.bold(`Total commandes:`); term('\n');
            term.column(leftMargin + 5); term.bold(`Nombre de commandes: `); term(consommation.totalOrders.nbOrders ? consommation.totalOrders.nbOrders.toString().substring(0, 5) : filler); term(`\n`);
            term.column(leftMargin + 5); term.bold(`Nombre de pièces: `); term(consommation.totalOrders.nbPieces ? consommation.totalOrders.nbPieces.toString().substring(0, 5) : filler); term('\n');
        }
    }

    consommation = (consommation, leftMargin, filler, yStart) => {
        let bluePrints = [
            { prop: 'mensuelleMoy', name: 'Consommation mensuelle moyenne: ', x: leftMargin, y: yStart },
            { prop: 'mensuelleMax', name: 'Consommation mensuelle maximale: : ', x: leftMargin, y: yStart + 1 },
            { prop: 'anuelle', name: 'Consommation anuelle moyenne: : ', x: leftMargin, y: yStart + 2 },
            { prop: 'commandeType', name: 'Commande typique: ', x: leftMargin, y: yStart + 3 },
            { prop: 'freqReappro', name: 'Fréquence de réapprovisionnement: ', x: leftMargin, y: yStart + 4 },
        ]
        bluePrints.forEach(p => {
            term.moveTo(p.x, p.y); term.bold(p.name); term(consommation[p.prop] ? consommation[p.prop].toString().substring(0, 5) : filler)
        })
        return bluePrints
    }

    displayPart = (part) => {
        this.app.clearScreen()
        this.app.lastScreen.screen = 'home'
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
                {leftPadding: '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t', cancelable: true, keyBindings: { ENTER: 'submit', DOWN: 'next', UP: 'previous', CTRL_Z: 'escape'}}
            ).promise

            menu.then((res) => {
                if(res !== undefined){
                    this.app.clearScreen()
                    this.app.lastScreen = {screen: 'displayPart', content: part };
                    switch(res.selectedIndex){
                        case 0: this.rawData(part); break;
                        case 1: this.displayHistoric(part.history); break;
                        case 2: this.modifierPiece(part)
                    }
                }
            }).catch((e) => console.log(e))

        }

        //CALLS TO DISPLAY INFOS
        const leftMargin = 5
        let filler = 'undefined'
        let str = `FICHE DE PIÈCE: ${part.code}`
        term.moveTo(term.width/2-str.length/2, 2).bold.underline(str); term('\n')
        

        term.moveTo(leftMargin, 3), term.bold.underline(`INFORMATION PRINCIPALES`);
        this.primaryInfos(part, leftMargin, filler, 4);

        term.moveTo(leftMargin, 13), term.bold.underline(`FOURNISSEUR PRINCIPAL`);
        this.supplierInfos(part.supplier[0], leftMargin, filler, 14);


        term.moveTo(leftMargin, 21); term.bold.underline(`INFORMATION EMBALLAGE`);
        this.emballage(part.emballage, leftMargin, filler, 22);

        term.moveTo(leftMargin, 29); term.bold.underline(`INFORMATIONS D'ENTREPOSAGE`);
        this.storage(part.storage, leftMargin, filler, 30);

        term.moveTo(3, 3)
        term.moveTo(term.width/3 + leftMargin, 3); term.bold.underline(`INFORMATION DE CONSOMMATION`);
        this.consommation(part.consommation, term.width/3 + leftMargin, filler, 4);

        term.moveTo(3, 3)
        partMenu(2*term.width/3 + leftMargin)
        


        

        




        
        /*
        MAINS INFOS
        code
        description
        family
        utilite
        class
        specs
        */




    }
}



module.exports = FichePiece