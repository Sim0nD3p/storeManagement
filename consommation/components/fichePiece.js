const term = require(`terminal-kit`).terminal
const ChangeSupplier = require('./changeSupplier');
const ChangeContainer = require('./changeContainer');
const filler = 'ND'

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
const containerDimensions = (container) => {
    return container.length + ' x ' + container.width + ' x ' + container.height + ' (mm)'
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
        this.index = 0;
        this.part;
        this.changeSupplier = new ChangeSupplier(app)
        this.changeContainer = new ChangeContainer(app);


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
    getSrcObj = (type) => {
        if(type == 'supplier[0]'){ return this.part.supplier[0] }
        else if(type == 'consommation'){ return this.part.consommation }
        else if(type == 'storage'){ return this.part.storage }
        else if(type == 'storage[0]'){ return this.part.storage[0] }
        else if(type == 'emballage'){ return this.part.emballage }
        else if(type == 'primary'){ return this.part }
    }
    
    moveCursor = (key, index) => {
        const formatProp = (prop) => {
            if(typeof prop == 'string'){
                return prop.substring(0, 15)
            }
            else if(typeof prop == 'number'){
                return prop.toString().substring(0, 5)
            }
            else if(typeof prop == 'object'){
                if(Object.keys(prop).indexOf('length') !== -1){
                    return dimensions(prop)
                }
            }
        }
        
        term.styleReset();
        term.moveTo(this.plans[index].x, this.plans[index].y); term.bold(this.plans[index].name); term(this.getProp(this.plans[index]) ? formatProp(this.getProp(this.plans[index])) : filler)

        
        //if(this.accessProp(part, plans[index].prop))

        if(key == 'DOWN')
        {
            //console.log(this.accessProp(part, plans[index].prop))
            if(index == this.plans.length - 1)
            {
                index = 0
            }
            else
            {
                index++
            }
        }
        else if(key == 'UP')
        {
            if(index == 0)
            {
                index = this.plans.length - 1
            }
            else
            {
                index--
            }
        }
        else if(key == 'LEFT')
        {

        }
        else if(key == 'RIGHT')
        {

        }
        term.moveTo(this.plans[index].x, this.plans[index].y); term.bold.bgYellow(this.plans[index].name); term.bgYellow(this.getProp(this.plans[index]) ? formatProp(this.getProp(this.plans[index])) : filler)

        term.moveTo(this.plans[index].x + this.plans[index].name.length, this.plans[index].y)
        return index
    }

    userInput = (x, y, hint) => {
        this.bindCursorToKeys = false
        hint = hint ? hint : '';
        if(this.plans.findIndex(a => a.y == y && a.x + a.name.length !== x) !== -1){
            let pRow = this.plans.find(a => a.y == y && a.x + a.name.length !== x)
            setTimeout(() => {
                term.styleReset()
                term.moveTo(pRow.x, pRow.y); term.bold(pRow.name); term(this.getProp(pRow) ? this.getProp(pRow) : filler) 
                term.moveTo(x, y)
            }, 10);
        }
        //return term.inputField({ x: x, y: y, minLength: 20, maxLength: 20, cursorPosition: -1, default: hint, cancelable: true, keyBindings: { ENTER: 'submit', BACKSPACE: 'backDelete', CTRL_Z: 'cancel'}}).promise

        return term.inputField({ x: x, y: y, cancelable: true, keyBindings: { ENTER: 'submit', BACKSPACE: 'backDelete', CTRL_Z: 'cancel' }}).promise
    }
    getProp = (p) => {
            
        if(p.prop !== null){
            try {
                if(this.accessProp(this.part, p.prop)){
                    return this.accessProp(this.part, p.prop)
                }
                else throw 'error'
            } catch (error) {
                return this.accessProp(this.getSrcObj(p.type), p.prop)
            }
        }
    }    
    setProp = (p, value) => {
        if (p.prop !== null) {
            try {
                if(this.part[p.prop]){
                    this.part[p.prop] = value
                }
                else throw 'error'
            } catch (error) {
                let obj = this.getSrcObj(p.type)
                let split = p.prop.split('.')
                try {
                    switch(split.length){
                        case 1: obj[split[0]] = value; break;
                        case 2: obj[split[0]][split[1]] = value; break;
                        case 3: obj[split[0]][split[1]][split[2]] = value; break;
                        case 4: obj[split[0]][split[1]][split[2]][split[3]] = value; break;
                        case 5: obj[split[0]][split[1]][split[2]][split[3]][split[4]] = value; break;
                    }
                } catch (error) {
                    console.log('error')

                }
            }
        }

    }
    

    changeProp = (index) => {
        let p = this.plans[this.index]
        if(p.type == 'primary'){
            if(p.prop == 'specs'){
                const specsTypes = ['length', 'width', 'height'];
                const dimInput = (x, y) => {
                    return term.inputField({ x: x, y: y, maxLength: 5, cancelable: true, keyBindings: { ENTER: 'submit', BACKSPACE: 'backDelete', CTRL_Z: 'cancel'}}).promise
                }
                let menuItems = [this.part.specs.length, this.part.specs.width, this.part.specs.height]
                term.moveTo(p.x + p.name.length, p.y); term.erase(20); term.bgYellow();
                let selector = term.singleColumnMenu(menuItems.map(a => a + ' mm'), { y: p.y-1, leftPadding: '\t\t\t', cancelable: true, keyBindings: { CTRL_Z: 'escape', ENTER: 'submit', UP:'previous', DOWN:'next'}}).promise
                this.bindCursorToKeys = false

                selector.then((res) => {
                    let baseXY = [p.x+p.name.length+8, p.y-1+res.selectedIndex]
                    let input = dimInput(baseXY[0], baseXY[1])
                    input.then((newValue) => {
                        newValue = Number(newValue)
                        term.moveTo(baseXY[0], baseXY[1])
                        term.red(newValue); term.red(` mm`)
                        if(newValue !== undefined && !isNaN(newValue) && newValue !== 0){
                            switch(res.selectedIndex){
                                case 0: this.app.store.getItemFromPFEP(this.part.code).specs.length = newValue; break;  //length
                                case 1: this.app.store.getItemFromPFEP(this.part.code).specs.width = newValue; break;  //width
                                case 2: this.app.store.getItemFromPFEP(this.part.code).specs.height = newValue; break;  //height
                                default: break;
                            }
                        }
                        this.app.clearScreen()
                        this.modifierPiece(this.part);
                        this.moveCursor('DOWN', this.index-1)
                    }).catch((e) => console.log(e))
                }).catch((e) => console.log(e)) 
            }
            else if(p.prop == 'utilite'){   //bug when array.length > 1?
                let baseStr = ''
                if(this.part.utilite !== undefined){
                    //this.accessProp(this.part, p.prop).forEach(s => baseStr += s + ' ')
                }
                this.userInput(p.x + p.name.length, p.y, 'te').then((res) => {
                    term.red(res)
                    this.modifierPiece(this.part);
                    this.moveCursor('DOWN', this.index-1)
                })



            }
            else {
                let valueTypes = {
                    code: 'string',
                    description: 'string',
                    family: 'string',
                    tag: 'string',
                    weight: 'number',
                    class: 'string',
                }
                this.userInput(p.x + p.name.length, p.y, '').then((res) => {
                    console.log(res);
                    this.setProp(p, res);
                    this.modifierPiece(this.part);
                    this.moveCursor('DOWN', this.index-1)
                }).catch((e) => console.log(e))
                
            }
        }
        else if(p.type == 'supplier' || p.type == 'supplier[0]'){
            this.bindCursorToKeys = false
            this.app.lastScreen = { screen: 'modifyPart', content: this.part, index: this.index }

            this.app.clearScreen()
            this.changeSupplier.managePartSupplier(this.part)
        }
        else if(p.type == 'consommation'){

        }
        else if(p.type == 'emballage'){
            if(p.prop !== null){
                if(p.prop.includes('TF')){
                    term.red(`Veuillez modifier cette propriété dans la section entreposage`)

                }
                else {
                    this.userInput(p.x + p.name.length, p.y).then((res) => {
                        //console.log(res)
                        //console.log(p)
                        this.setProp(p, res)
                        this.modifierPiece(this.part);
                        this.moveCursor('DOWN', this.index-1)
        
                    }).catch((e) => console.log(e))
                    
                }
            }

        }
        else if(p.type == 'storage' || p.type == 'storage[0]'){
            this.app.lastScreen = {
                screen: 'modifyPart',
                content: this.part,
                index: this.index
            }
            this.app.clearScreen()
            this.bindCursorToKeys = false
            this.changeContainer.containerSelector(this.part)

        }
    }

    modifierPiece = (part) => {
        this.app.clearScreen()
        this.app.lastScreen = { screen: 'displayPart', content: this.part }
        const leftMargin = 5;
        this.bindCursorToKeys = true
        let index = 0

        let plans = [];
        term.moveTo(leftMargin, 4); term.bold.underline('INFORMATIONS PRINCIPALES');
        term.moveTo(leftMargin, 14); term.bold.underline(`INFORMATIONS FOURNISSEUR`);
        term.moveTo(leftMargin, 22); term.bold.underline('INFORMATIONS EMBALLAGE');
        term.moveTo(leftMargin, 30); term.bold.underline('INFORMATIONS ENTREPOSAGE');
        term.moveTo(term.width/3+leftMargin, 4); term.bold.underline('INFORMATIONS DE CONSOMMATION')

        let primary = this.primaryInfos(part, leftMargin, filler, 5); primary ? plans = plans.concat(primary) : null;
        let supplier = this.supplierInfos(part.supplier[0], leftMargin, filler, 15); supplier ? plans = plans.concat(supplier) : null;
        let emballage = this.emballage(part.emballage, leftMargin, filler, 23); emballage ? plans = plans.concat(emballage) : null
        let storage = this.storage(part.storage, leftMargin, filler, 31); storage ? plans = plans.concat(storage) : null
        let consommation = this.consommation(part.consommation, term.width/3+leftMargin, filler, 5); consommation ? plans = plans.concat(consommation) : null
        
        plans = plans.sort((a, b) => {
            if(a.x == b.x) return a.y - b.y
            return a.x - b.x
        })
        this.plans = plans
        //this.app.clearScreen()
        //console.log(plans)
        term.moveTo(plans[index].x + plans[index].name.length, plans[index].y)
    }
    accessProp = (part, path) => {
        let obj = part
        let split = path.split('.')
        try {
            for(let i = 0; i < split.length; i++){
                obj = obj[split[i]]
            }    
        } catch (error) {
            obj = ''
            
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
                { name: 'Nom: ', prop: 'name', x: leftMargin, y: yStart, type: 'supplier[0]' },
                { name: 'Téléphone: ', prop: 'phone', x: leftMargin, y: yStart + 1, type: 'supplier[0]' },
                { name: 'Fax: ', prop: 'fax', x: leftMargin, y: yStart + 2, type: 'supplier[0]' },
                { name: 'Adresse: ', prop: 'address', x: leftMargin, y: yStart + 3, type: 'supplier[0]' },
                { name: 'Lead time moyen: : ', prop: 'leadTime', x: leftMargin, y: yStart + 4, type: 'supplier[0]' },
                { name: 'Lead time max: ', prop: 'leadTimeMax', x: leftMargin, y: yStart + 5, type: 'supplier[0]' },
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
                { prop: 'type', name: 'Type de contenant: ', x: leftMargin, y: yStart, type: 'storage[0]' },
                { prop: 'count', name: 'Nombre de piece / contenant: ', x: leftMargin, y: yStart + 1, type: 'storage[0]' },
                { prop: 'length', name: 'Nombre de contenants maximal: ', x: leftMargin, y: yStart + 2, type: 'storage' },
                { prop: 'weight', name: 'Masse: ', x: leftMargin, y: yStart + 3, type: 'storage[0]' },
                { prop: 'dimensions', name: 'Dimensions: ', x: leftMargin, y: yStart + 4, type: 'storage[0]' },
            ]
            bluePrints.forEach(p => {
                let container = storage[0]
                if(p.name == 'Dimensions: '){
                    term.moveTo(p.x, p.y); term.bold(p.name); term(containerDimensions(container) ? containerDimensions(container).toString().substring(0, 20) : filler);
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
            let bluePrints = { prop: null, name: `Informations d'entreposage manquantes`, x: leftMargin, y: yStart, type: 'storage[0]'}

            term.moveTo(bluePrints.x, bluePrints.y); term.bold(bluePrints.name);
            return bluePrints 
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
        this.part = part;
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