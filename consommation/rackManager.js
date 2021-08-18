const ShelfManager = require('./shelfManager');
const Racking = require('./containers/racking');
const term = require('terminal-kit').terminal
//const { emitCallback } = require('terminal-kit/ScreenBufferHD');
const FRONT = 'FRONT';
const BACK = 'BACK';
const ACCESS_RATIO = 0.75;  //ratio countBack/countFront

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

        /* 
        {
            length : [],
            length2: []
        }
 */

        let shelves = {}
        for (const length in initShelvesObj) {
            let currentLength = [];
            for (const shelf in initShelvesObj[length]) {
                currentLength.push(initShelvesObj[length][shelf])

            }
            shelves = {
                ...shelves,
                [length]: currentLength,
            }
        }

        let types = Object.keys(initShelvesObj)

        for (let i = 0; i < types.length; i++) {
            console.log(types[i])
            shelves[types[i]].map((shelf, index) => {
                console.log(shelf.name, shelf.priority)

            })

        }
        //console.log(shelves['4000'])




    }
    cleanUpAccessPoints(tag) {
        //gets list of problematic containers
        const prob = () => {
            return this.app.store.shelves.map((shelf, index) => {
                if (shelf.getAccessRatio() < ACCESS_RATIO) {
                    return shelf.content.map((cont, index) => {
                        if (cont.accessPoint == BACK) { return cont }
                    }).filter((a) => a !== undefined)
                } else return null
            })
        }
        //makes list of problematic container


        const makeInstructions = (prob) => {
            let array = []; //[newShelf, part, containerObject, oldShelfIndex]
            prob.map((s, index) => {       //loop shelves
                if (s !== null && s.length > 0) {
                    s.map((cont, contIndex) => {     //loop problematic containers
                        let part = this.app.store.getItemFromPFEP(cont.name.split('_')[1])
                        let categorisation = {
                            consoMens: part.consommation ? part.consommation.mensuelleMoy : undefined,
                            classe: part.class ? part.class : undefined,
                            type: part.storage[0].type
                        }
                        let potentialShelves = this.shelfManager.findPotentialShelf(part, categorisation, tag).filter((a) => a !== null);
    
                        potentialShelves = potentialShelves.map((a, index) => {      //narrow options for potential shelves
                            if (a[0].getAccessRatio() > ACCESS_RATIO || a[1] == true) { return a }
                            else return null
                        }).filter((a) => a !== null)
    
                        if (potentialShelves.length > 0) {
                            let shelf = this.shelfManager.matchPartToShelf(potentialShelves, part)
                            //[newShelf, part, containerObject, oldShelfIndex]
                            array.push([shelf, part, cont, index])
                        }
                        else array.push([null, part, cont, index])
                        //potentialShelves = potentialShelves.filter((a) => a[0].getAccessRatio() > ACCESS_RATIO || a[0] == true)
                        //let pot = this.shelfManager.matchPartToShelf(potentialShelves, part)
                    })
                }
            })
            return array
        }
        
        let ins = makeInstructions(prob())
        console.log(ins[0])
        let instructions = makeInstructions(prob());    //[newShelf, part, containerObject, oldShelfIndex]

        /*
        NOTES 2021-08-18
        potentialShelves is not checked after each placement so the shelf given by matchPartToShelf in instructions might not work.
        we need to check potentialShelves and matchPartToShelf in the loop below.


        */

        let partsAdded = []
        for(let i = 0; i < instructions.length; i++){
            let part = instructions[i][1];
            if(partsAdded.indexOf(part.code) == -1){
                partsAdded.push(part.code)
                let shelf = instructions[i][0][0];
                let place = shelf.searchPlace(part, instructions[i][0][1])
                console.log(place)
                if(place !== false){
                    for(let j = 0; j < place.length; j++){
                        //shelf.putInShelf(place[j][0], place[j][1], place[j][2], partList[i].storage[j], partList[i], accessPoint)
                        shelf.putInShelf(place[j][0], place[j][1], place[j][2], part.storage[j], part, instructions[i][0][1])
                    }
                }
            }
            console.log('-------------------------------------------------------')
            console.log(this.app.store.shelves[instructions[i][3]].content.length)
            console.log('--')
            //console.log(this.app.store.shelves[instructions[i][3].content.map(s => console.log(s.name))])
            //let index = this.app.store.shelves[instructions[i][3]].content.indexOf(instructions[2])
            //console.log(`index ${index}`)

        }


        /* 
        for(let i = 0; i < partList.length; i++){



            -----

            /*  let accessPoint = shelf[1];
                         shelf = shelf[0]
                         let place = shelf.searchPlace(part, accessPoint)
                         if(place !== false){
                             for(let j = 0; j < place.length; j++){
                              //shelf.putInShelf(place[j][0], place[j][1], place[j][2], partList[i].storage[j], partList[i], accessPoint)
                                 shelf.putInShelf(place[j][0], place[j][1], place[j][2], part.storage[j], part, accessPoint)
                                 console.log(this.app.store.shelves[index].name)
                                 console.log(shelf.name)
                              }
                              if(this.app.store.shelves[index].content.indexOf(cont) !== -1){
                                  this.app.store.shelves[index].content.splice(this.app.store.shelves[index].content.indexOf(cont), 1)
                              }
                         }
                         else { console.log('ERROR PLACE == FALSE') }
                         console.log(place) 




            console.log('-----------------------')
            console.log(`PART: ${partList[i].code}`)
            console.log(partList[i].consommation.mensuelleMoy, partList[i].class, partList[i].storage[0].type)
            potentialShelves.map((p, index) => { console.log(p[0].name, p[0].priority, p[0].type, p[0].getAccessRatio())})

            -----


        } */



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