const ShelfManager = require('./shelfManager');
const Racking = require('./containers/racking');
const term = require('terminal-kit').terminal
//const { emitCallback } = require('terminal-kit/ScreenBufferHD');
const FRONT = 'FRONT';
const BACK = 'BACK';
const ACCESS_RATIO = 0.50;  //ratio countBack/countFront
const REACH_LIMIT = 3500;   //also in shelfManager.js and racking.js

/* ROLES
trouver racking de la bonne largeur ou en creer un nouveau
ajouter le shelf sur le racking selectionne

returns racks


*/
class RackManager {
    constructor(app) {
        this.app = app;
        this.store = this.app.store;
        this.shelfManager = new ShelfManager(app)
        this.partLists = {
            MP: [],
            assemblage: []
        }
    }

    test() {
        console.log(this.store.racking);
    }

    getRacking(name) {
        let rackIndex = -1
        for (let i = 0; i < this.app.store.racking.length; i++) {
            if (this.app.store.racking[i].name == name) { rackIndex = i }
        }
        return this.app.store.racking[rackIndex]
    }

    getPriorityList(array) {
        let assemblages = [];   //new Array(array.length).fill(undefined);
        let MP = [];    //new Array(array.length).fill(undefined);
        for (let i = 0; i < array.length; i++) {
            if (array[i].type == 'MP') { MP.push(array[i]) }
            else if (array[i].type == 'assemblage') { assemblages.push(array[i]) }
        }

        assemblages = assemblages.filter(ass => ass !== undefined);
        MP = MP.filter(mp => mp !== undefined);

        //SHOULD GET BETTER SORTING ALGORITHM
        //ajouter utilisation des pieces pour proximite picking
        MP = MP.sort(function (a, b) { return b.consoMens - a.consoMens })
        assemblages = assemblages.sort(function (a, b) { return a.class > b.class ? 1 : -1 })

        return { MP: MP, assemblages: assemblages }
    }

    filterParts(PFEP) {
        PFEP = PFEP.map((item, index) => {
            if (item.class) {
                if (!item.class.includes('barr')) { return item }
            } else return item
        })
        return PFEP.filter(item => item !== undefined)
    }

    initRacking(PFEP) {
        PFEP = this.filterParts(PFEP);  //enleve les pieces avec le tag barre de stephane, could go eventually
        let array = PFEP.map((item, index) => {
            if (item.storage.length > 0) {
                if (item.class) {
                    if (item.family && item.family !== 'Consommable' && item.family !== 'Collant') {
                        if (item.family !== 'Assemblage' && !item.family.includes('Extrusion usin')) {
                            return { code: item.code, type: 'MP', class: item.class, consoMens: item.consommation ? item.consommation.mensuelleMoy : undefined }
                        }
                        else return { code: item.code, type: 'assemblage', class: item.class, consoMens: item.consommation ? item.consommation.mensuelleMoy : undefined }
                    }
                    else if (!item.family) { return { code: item.code, type: 'MP', class: item.class, consoMens: item.consommation ? item.consommation.mensuelleMoy : undefined } }
                } else return { code: item.code, type: 'MP', class: item.class, consoMens: item.consommation ? item.consommation.mensuelleMoy : undefined }
            }
        })
        array = array.filter(part => part !== undefined)
        term(`${array.length} parts should be placed in racking\n`)
        let object = this.getPriorityList(array)

        let MP = object.MP.map((mp, index) => { return this.app.store.getItemFromPFEP(mp.code) })
        let assemblages = object.assemblages.map((ass, index) => { return this.app.store.getItemFromPFEP(ass.code) })
        this.partLists = {
            MP: [...MP],
            assemblages: [...assemblages]
        }

        console.log(`MP ${MP.length}`)
        console.log(`assemblages ${assemblages.length}`)
        this.placeInRacking(MP, 'MP');
        this.placeInRacking(assemblages, 'ASS')
        this.optimizeRacking()
    }

    /**
     * Makes list of nexts parts to place in to shelf to be created and uses shelfManager.createShelf() to return new shelf
     * @param {*array} partList 
     * @param {*number} index 
     * @returns new shelf
     */
    requestNewShelf(partList, index, tag) {
        let typeNeeded = [partList[index].storage[0].type.substring(0, 3)]
        let nextPartType = partList[index].storage[0].type.substring(0, 3)
        if (nextPartType == 'bun') { typeNeeded = ['bun'] }
        else if (nextPartType == 'bac' || nextPartType == 'cus') { typeNeeded = ['bac', 'cus'] }


        //let typeNeeded = partList[index].storage[0].type.substring(0, 3);   //bac, bun, pal (types de contenants)


        let partsToPlace = [];
        while (partsToPlace.length < 25) {
            if (partList[index + partsToPlace.length]) {
                if (typeNeeded.indexOf(partList[index + partsToPlace.length].storage[0].type.substring(0, 3)) !== -1) {
                    let categorisation = {
                        consoMens: partList[index + partsToPlace.length].consommation ? partList[index + partsToPlace.length].consommation.mensuelleMoy : undefined,
                        classe: partList[index + partsToPlace.length].class ? partList[index + partsToPlace.length].class : undefined,
                        type: typeNeeded[0],
                        //type: partList[index + partsToPlace.length].storage[0].type
                    }
                    partsToPlace.push({ part: partList[index + partsToPlace.length], categorisation: categorisation })
                }
                else {
                    index++
                }
            } else break
        }
        //console.log('end of requestNewShelf')
        let newShelf = this.shelfManager.createShelf(partsToPlace, tag); //returns new Shelf
        //console.log(result.content)

        //we gonna place the shelf when we know its height
        //this.placeNewShelf(newShelf, partsToPlace)
        return newShelf


    }


    /**
     * 
     * @param {array} partsPriority array of parts priority
     * @returns array of average priority for parts
     */
    predictNewShelfPriority = (partsPriority) => {
        partsPriority = partsPriority.filter((a) => a !== undefined && !isNaN(a) && a !== 0)
        let sum = partsPriority.map((part, index) => {
            let locSum = 0;
            for (let i = 0; i <= index; i++) { locSum += partsPriority[i] }
            return locSum / (index + 1)
        })
        let moyenne = 0;
        if (sum.length > 0) {
            for (let i = 0; i < sum.length; i++) { moyenne += sum[i] }
            moyenne = moyenne / sum.length
        }
        return moyenne
    }


    placeNewShelf(shelf) {
        term.brightRed(`placing shelf\n`)
        let logToConsole = 3;


        for (let i = 0; i < this.app.store.racking.length; i++) {     //updating shelves height
            this.app.store.racking[i].height = this.app.store.racking[i].getTotalHeight();
        }

        let targetIndex = -1;

        const targetType = (type) => {
            if (type == 'bac') { return ['bac', 'mixed'] }
            else if (type == 'bundle') { return ['bundle', 'mixed'] }
            else return ['bac', 'mixed']
        }

        const heightLimit = (type) => {
            if (type == 'bac') { return 'reach_limit' }
            else if (type == 'bundle') { return undefined }
            else { return undefined }
        }

        let potentialRacks = this.app.store.racking.map((rack, index) => {      //getting potential racking for shelf
            if (rack.length == shelf.length && shelf.tag == rack.tag) {

                if (targetType(shelf.type).indexOf(rack.contentType) !== -1) {    //keeps bundle&bac (lift&manual) separated
                    return [rack.name, rack.height, rack.searchPlace(shelf, heightLimit(shelf.type))]
                } else return null
            } else return null
        })
        potentialRacks = potentialRacks.filter((a) => a !== null && a[2] !== false)


        if (potentialRacks.length > 0) {
            potentialRacks = potentialRacks.sort((a, b) => { return a[1] - b[1] })
            logToConsole >= 2 ? term.brightRed(`potential racks:\n`) : null
            logToConsole >= 2 ? potentialRacks.map(p => term.brightRed(`[ ${p[0]}, ${p[1]}, ${p[2]} ]\n`)) : null
            let rack = this.getRacking(potentialRacks[0][0]);
            rack.addShelf(shelf, potentialRacks[0][2])
        }
        else {
            let name = `racking${this.app.store.racking.length}_length${shelf.length}`
            let rack = new Racking(name, shelf.length, shelf.type, shelf.tag)
            this.app.store.racking.push(rack)
            term.brightRed(`created ${name}, we now have ${this.app.store.racking.length} rack in store\n`)
            rack.addShelf(shelf, rack.searchPlace(shelf, heightLimit(shelf.type)))

        }

        /* 
        
        let rackType = shelf.type == 'bac' ? 'mixed' : shelf.type;
        let baseHeight = 0;
        let targetRack;
        let potRacks = this.app.store.racking.map((rack, index) => {  //finds potential racks (length, type)
            if (shelf.length == rack.length && shelf.tag == rack.tag) { return rack }
            else return null
        })
        if(potRacks.findIndex((a) => a !== null) == -1){  //si aucun potential rack => create new rack
            let rack = new Racking(`racking_${this.app.store.racking.length + 1}`, shelf.length, rackType, shelf.tag)
            this.app.store.racking.push(rack)
            targetRack = rack
        }
        else{
            potRacks = potRacks.filter((a) => a !== null);   //filters potentialRacks (null)
            //console.log('potentialRacking')
            //console.log(potentialRacks)
            let options = potRacks.map((rack, index) => {
                return [rack.name, rack.searchPlace(shelf)]
            })
            for(let i = 0; i < potRacks.length; i++){
                let place = potRacks[i].searchPlace(shelf, 'reach_limit')
                if(!isNaN(place) && rackType == potRacks[i].contentType){
                    baseHeight = place
                    targetRack = this.getRacking(potRacks[i].name)
            }
                //ALGO TO FIND BEST POTENTIAL RACK
                //nb of shelf already on rack => priorityZone
                //we got to check for priority (consomMens)
                //console.log(potentialRacks[i].shelves.length)
            }
            if (targetRack == undefined) {
                let rack = new Racking(`racking_${this.app.store.racking.length + 1}`, shelf.length, rackType, shelf.tag)
                targetRack = rack
                this.app.store.racking.push(rack)                
            }
        }
        //targetRack.getBlocs(shelf)
        targetRack.addShelf(shelf, baseHeight)

 */

    }

    optimizeRacking() {

        //makes sure that all shelves are placed in racking
        for (let i = 0; i < this.app.store.shelves.length; i++) {
            if (this.app.store.shelves[i].baseHeight == undefined) {
                this.placeNewShelf(this.app.store.shelves[i])
            }
        }

        const getShelves = () => {
            //gets all shelves, organized by length
            let initShelvesObj = {}
            for (let i = 0; i < this.app.store.shelves.length; i++) {
                initShelvesObj = {
                    ...initShelvesObj,
                    [this.app.store.shelves[i].length]: {
                        ...initShelvesObj[this.app.store.shelves[i].length],
                        [this.app.store.shelves[i].name]: this.app.store.shelves[i]
                    }
                }
            }
            let finalObj = {}
            let types = Object.keys(initShelvesObj)
            for(let i = 0; i < types.length; i++){
                let currentTypeArray = []
                for(const length in initShelvesObj[types[i]]){
                    currentTypeArray.push(initShelvesObj[types[i]][length])
                }
                finalObj = {
                    ...finalObj,
                    [types[i]]: currentTypeArray
                }
            }
            return finalObj
        }

        const genRacking = (shelves) => {
            let types = Object.keys(shelves)
            let racking = []
            let key = 0

            types.forEach((type) => {
                key++
                let currentShelves = shelves[type]

                currentShelves = currentShelves.map((shelf, index) => {
                    let parts = []
                    let totalConsom = 0;
                    shelf.content.forEach((cont, index) => {
                        if (parts.findIndex((a) => a[0] == cont.name.split('_')[1]) == -1) {
                            parts.push([cont.name.split('_')[1], cont.consommation])
                        }
                    })
                    parts.forEach(part => totalConsom += part[1])
                    return {
                        ...shelf,
                        totalConsom: totalConsom
                    }
                })

                let shelvesToPlace = currentShelves.sort((a, b) => {
                    if (a.type !== 'bundle' && b.type == 'bundle') return -1
                    if (a.type == 'bundle' && b.type !== 'bundle') return 1

                    if (a.isDoubleSided == true && b.isDoubleSided == false) return -1
                    if (a.isDoubleSided == false && b.isDoubleSided == true) return 1

                    if (a.totalConsom > b.totalConsom) return -1
                    if (a.totalConsom < b.totalConsom) return 1

                    //if(a.tag > b.tag) return -1
                    //if(a.tag < b.tag) return 1
                })

                let localRacks = [new Racking(`racking_${key}`, shelvesToPlace[0].length, shelvesToPlace[0].type, shelvesToPlace[0].tag)]

                shelvesToPlace.forEach((shelf, index) => {
                    let height = shelf.type == 'bundle' ? undefined : 'reach_limit'

                    term(`${shelf.name} isDoubleSided ${shelf.isDoubleSided}`)

                    let rack = localRacks.map((rack, index) => {
                        if (rack !== null) { return [rack, rack.searchPlace(shelf, height)] }
                        else return null
                    }).filter((a) => a !== null && a[1] !== false)

                    if (rack.length > 0) {
                        rack = rack.sort((a, b) => a[1] - b[1])[0]
                        term(` rack: ${rack[0].name}, ${rack[1]}\n`)
                        rack[0].addShelf(shelf, rack[1])
                    }
                    else {
                        key++
                        let newRack = new Racking(`racking_${key}`, shelf.length, shelf.type, shelf.tag)
                        let place = newRack.searchPlace(shelf, height)
                        term(` newRack: ${newRack.name}, ${place}\n`)
                        if (place !== false) {
                            newRack.addShelf(shelf, place)
                            localRacks.push(newRack)
                        }
                        else console.log('PROBLEM')
                    }
                })
                racking = racking.concat(localRacks)
            })
            return racking

        }

        let shelves = getShelves();
        let init = genRacking(getShelves());

        const redistributeShelves = (initRacking) => {
            let racking = [];
            let types = []
            initRacking.forEach((rack) => {
                let type = [rack.length, rack.contentSides]
                let index = types.findIndex((a) => {
                    let ref = [a[0], a[1]];
                    let typ = [rack.length, rack.contentSides]
                    return ref.toString() == typ.toString()
                })
                if(index == -1){
                    types.push([rack.length, rack.contentSides, [rack]])
                }
                else {
                    types[index][2].push(rack)
                }
            })
            console.log(types)


            types.forEach(type => {
                console.log(`----- TYPE ${type[0]} -----`)
                let shelves = []
                let currentRacks = []
                type[2].forEach(rack => {
                    shelves = shelves.concat(rack.shelves)
                    rack.shelves = []
                    currentRacks.push(rack)
                })

                shelves = shelves.sort((a, b) => {
                    if(a.type == 'bundle' && b.type == 'bac') return 1
                    if(a.type == 'bac' && b.type == 'bundle') return -1

                    if(a.totalConsom > b.totalConsom) return -1
                    if(a.totalConsom < b.totalConsom) return 1
                })

                shelves.forEach(s => console.log(s.name, s.type, s.totalConsom))
                let rackIter = 0;
                shelves.forEach(shelf => {
                    rackIter++;
                    if(rackIter == currentRacks.length){ rackIter = 0}
                    let height = (shelf.type == 'bundle') ? undefined : undefined
                    let place = currentRacks[rackIter].searchPlace(shelf, height)
                    if(place !== false){
                        currentRacks[rackIter].addShelf(shelf, place);
                    }
                    else {
                        if(rackIter == currentRacks.length - 1){
                            place = currentRacks[0].searchPlace(shelf, height)
                            if(place !== false){
                                currentRacks[0].addShelf(shelf, place)
                            } else console.log('PROBLEM')
                        }
                        else {
                            place = currentRacks[rackIter + 1].searchPlace(shelf, height)
                            if(place !== false){
                                currentRack[rackIter + 1].addShelf(shelf, place)
                            } else console.log('PROBLEM')
                        }
                    }


                    
                })
                racking = racking.concat(currentRacks)
                
            })
            this.app.store.racking = racking
        }

        let t = redistributeShelves(init)
        

        




        this.app.store.racking = init
        
        
        

    }
    cleanUpAccessPoints(tag) {
        //gets list of problematic containers

        const accessRatioProb = () => {
            return this.app.store.shelves.map((shelf, index) => {
                if (shelf.getAccessRatio() < ACCESS_RATIO) {
                    return shelf.content.map((cont, index) => {
                        if (cont.accessPoint == BACK) { return cont }
                    }).filter((a) => a !== undefined)
                } else return null
            })
        }

        
        //makes list of problematic container
        const initialPartsToAdd = (prob) => {
            let array = []; //[parts]
            prob.map((s, index) => {       //loop shelves
                if (s !== null && s.length > 0) {
                    s.map((cont, contIndex) => {     //loop problematic containers
                        let code = cont.name.split('_')[1];
                        if(array.findIndex((a) => a.code == code) == -1){
                            array.push(this.app.store.getItemFromPFEP(code))
                        }
                    })
                }
            })
            return array
        }
        
        const placeParts = (partsToPlace, accessRatio, spaceRatio) => {
            //[part, cont, index]
            let partsAdded = []
            for(let i = 0; i < partsToPlace.length; i++){
                let part = partsToPlace[i];
                if(partsAdded.indexOf(part.code) == -1){
                    let categorisation = {
                        consoMens: part.consommation ? part.consommation.mensuelleMoy : undefined,
                        classe: part.class ? part.class : undefined,
                        type: part.storage[0].type
                    }
                    let potentialShelves = this.shelfManager.findPotentialShelf(part, categorisation, tag).filter((a) => a !== null);
                    console.log(`potential shelves: ${potentialShelves.length}`)
                    potentialShelves = potentialShelves.map((a, index) => {      //narrow options for potential shelves
                        if (a[0].getAccessRatio() > accessRatio || a[1] == true || a[0].getSpaceRatio() < spaceRatio) { return a }
                        else if(a[2] == true && a[0].getSpaceRatio() < spaceRatio){ return a }
                        else return null
                    }).filter((a) => a !== null).sort((a, b) => part.consommation ? Math.abs(a[0].priority - part.consommation.mensuelleMoy) - Math.abs(b[0].priority - part.consommation.mensuelleMoy) : a - b)
                    if(potentialShelves.length > 0){
                        let shelf = potentialShelves[0][0];
                        let placement = [potentialShelves[0][1], potentialShelves[0][2]]
                        let sample = [FRONT, BACK]            
                        let accessPoint = sample[placement.indexOf(true)]
                        let place = shelf.searchPlace(part, accessPoint)
                        if(place !== false){
                            partsAdded.push(part)
                            this.app.store.getPartsShelf(part).removeFromShelf(part);
                            for(let j = 0; j < place.length; j++){
                                shelf.putInShelf(place[j][0], place[j][1], place[j][2], part.storage[j], part, accessPoint)
                            }
                        }
                        else {
                            console.log('PROBLEM PLACING PART')
                        }
                    }
                    else {
                        console.log('NO POTENTIAL SHELF')
                    }
                }
            }
            return partsAdded    
        }
                
        const getFailedParts = (partsToAdd, partsAdded) => {
            return partsToAdd.map((part, index) => {
                if (partsAdded.indexOf(part) == -1) { return part }
                else return null
            }).filter((a) => a !== null)
        }
        
        let accessRatio = ACCESS_RATIO;
        let spaceRatio = 0.5;
        let i = 0;
        let partsToPlace = initialPartsToAdd(accessRatioProb())
        while(partsToPlace.length > 0 && i < 10){
            let partsAdded = placeParts(partsToPlace, ACCESS_RATIO, 0.5);
            partsToPlace = getFailedParts(partsToPlace, partsAdded)
            console.log(`failedParts: ${partsToPlace.length}, accessRatio: ${accessRatio}, spaceRatio: ${spaceRatio}`)
            spaceRatio = spaceRatio + 0.10;
            accessRatio = accessRatio - 0.10;
            i++
        }


    }

    placeInRacking(partList, tag) {
        //let mains = ['SEP2506', 'SEP2507', 'SEP2521']
        let qteToPlace = partList.length

        // partList = ['SEP3978', 'SEP260-0G4456', 'SEP3979', 'SEP4059', 'SEP2504', 'SEP3807-LA', 'SEP3782', 'SEP2506', 'SEP2507', 'SEP2521'];

        //partList = partList.concat(mains)
        //partList = ['EXV001-2600', 'EXV001-1720'];
        //partList = ['SEP4022', 'SEP3550', 'SEP3553', 'SEP3562', 'SEP3568', 'SEP3799']
        //partList = partList.map(part => this.app.store.getItemFromPFEP(part))



        let failedParts = []
        //partList = partList.map((part, index) => { return this.app.store.getItemFromPFEP(part.code) })
        for (let i = 0; i < partList.length; i++) {
            term(`\n---------- NEW PART ----------\n`)
            term(`${partList[i].code} - ${partList[i].storage.length} containers (${partList[i].storage[0].name.split('_')[0]}, ${partList[i].storage[0].length}, ${partList[i].storage[0].width}, ${partList[i].storage[0].height}) - priority: ${Math.ceil(partList[i].consommation.mensuelleMoy)}\n`)
            //console.log('----- placing in racking -----\n')
            let categorisation = {
                consoMens: partList[i].consommation ? partList[i].consommation.mensuelleMoy : undefined,
                classe: partList[i].class ? partList[i].class : undefined,
                type: partList[i].storage[0].type
            }
            let potentialShelves = this.shelfManager.findPotentialShelf(partList[i], categorisation, tag);
            let shelf; let accessPoint = FRONT;
            let place;

            //let place = shelf.searchPlace(partList[i], BACK);  //returns place
            let newShelf;


            //thats fine

            term(`${this.app.store.shelves.length} shelves in store, ${potentialShelves.filter(a => a !== null).length} potential shelves\n`)

            if (potentialShelves.findIndex((shelf) => shelf !== null) == -1) {
                let lostShelf = null
                let u = 0;
                while (lostShelf == null & u < this.app.store.shelves.length) {
                    if (this.app.store.shelves[u].isShelfFrontFull() > 0.50 && this.app.store.shelves[u].baseHeight == undefined) {
                        this.placeNewShelf(this.app.store.shelves[u])
                    }
                    u++
                }
                term.cyan('\n----- CREATING SHELF -----\n')
                newShelf = true;
                shelf = this.requestNewShelf(partList, i, tag);  //returns new shelf


            }

            else {
                //potentialShelves.map(shelf => {if(shelf !== null){console.log(shelf[1], shelf[2])}})
                shelf = this.shelfManager.matchPartToShelf(potentialShelves, partList[i]);
                let test = shelf[0].searchPlace(partList[i], shelf[1])
                accessPoint = shelf[1];
                shelf = shelf[0];

                newShelf = false
            }

            if (shelf !== null) {
                //term(`placing ${partList[i].code} in ${shelf.name}\n`)
                let place = shelf.searchPlace(partList[i], accessPoint)
                console.log(place)

                if (place !== false) {
                    term.green(`part successfully placed\n`)
                    //console.log(partList[i].storage.length)
                    for (let j = 0; j < place.length; j++) {
                        shelf.putInShelf(place[j][0], place[j][1], place[j][2], partList[i].storage[j], partList[i], accessPoint)
                    }

                }
                else {
                    console.log('DIDNT WORK ON FIRST TRY')
                    let part = { ...partList[i] }
                    let containerCount = part.storage.length;
                    let containerNbToPlace = containerCount;
                    let partsFitOnShelf = false;
                    while (containerNbToPlace > 1) {
                        containerNbToPlace--
                        part.storage = part.storage.slice(0, containerNbToPlace)
                        let place = shelf.searchPlace(part, accessPoint);
                        if (place !== false) {
                            partsFitOnShelf = true
                            break;
                        }
                    }
                    if (partsFitOnShelf == true) {
                        let partsToAdd = []
                        let totalContainers = 0
                        while (totalContainers < containerCount) {
                            let item = { ...part }
                            if (totalContainers + part.storage.length <= containerCount) { partsToAdd.push(item) }
                            else {
                                part.storage = part.storage.slice(0, (containerCount - totalContainers))
                                partsToAdd.push(item)
                            }
                            totalContainers += part.storage.length
                        }
                        console.log(partsToAdd.map(item => item.storage.length))
                        partList.splice(i, 1)
                        partList.splice(i + 1, 0, ...partsToAdd)

                    }
                    else {
                        term.red('error - part not placed\n')
                        shelf.searchPlace(partList[i], accessPoint, 3)

                        failedParts.push(partList[i])

                    }

                    console.log(part.storage.length)
                    //console.log(partList[i].storage[0])



                    let test = this.shelfManager.findPotentialShelf(partList[i], categorisation);

                }

            }
            else console.log('SHELF == NULL')
        }
        this.cleanUpAccessPoints(tag)
        term(`\n\n\n ${qteToPlace} parts should be placed\n`)
        term.red(`${failedParts.length} part have not been placed in racking\n`)
        console.log(this.shelfManager.unusedShelves)
    }
}

module.exports = RackManager