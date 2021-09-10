const ShelfManager = require('./shelfManager');
const Racking = require('./containers/racking');
const term = require('terminal-kit').terminal;
const samples = require('./useCasesEx');
//const { emitCallback } = require('terminal-kit/ScreenBufferHD');
const FRONT = 'FRONT';
const BACK = 'BACK'
/* ROLES
trouver racking de la bonne largeur ou en creer un nouveau
ajouter le shelf sur le racking selectionne

returns racks


*/
class RackManager{
    constructor(app){
        this.app = app;
        this.store = this.app.store;
        this.shelfManager = new ShelfManager(app)
        this.placeShelf = [];   //temp
        this.partLists = {
            MP: [],
            assemblage: []
        }
    }

    test = (partList, tag) => {
        for(let i = 0; i < partList.length; i++){
            this.app.log += `part: ${partList[i].code}\n`
        }
    }

    getRacking(name){
        let rackIndex = -1
        for(let i = 0; i < this.app.store.racking.length; i++){
            if(this.app.store.racking[i].name == name){ rackIndex = i }
        }
        return this.app.store.racking[rackIndex]
    }

    /**
     * Returns object with arrays of parts by tag
     * @param {*Array} partList - PFEP like array
     * @returns object {...tag: [arrayOfParts]}
     */
    splitPartsByTag = (partList) => {
        let sorted = {}
        partList.forEach((part, index) => {
            if(sorted[part.tag]){
                let array = sorted[part.tag];
                array.push(part)
                sorted = { ...sorted, [part.tag]: array }
            }
            else {
                sorted = { ...sorted, [part.tag]: [part] }
            }
        })
        return sorted
    }

    getPriorityList = (partList) => {
        let sorted = partList.sort((a, b) => {
            //if(a.class && b.class){
                if(!a.consommation.mensuelleMoy && !b.consommation.mensuelleMoy){
                    if(a.class < b.class) return -1
                    if(a.class > b.class) return 1
                }
                return b.consommation.mensuelleMoy - a.consommation.mensuelleMoy
        })
        return sorted
    }

    initRacking_old(PFEP) {
        PFEP = this.filterParts(PFEP);  //enleve les pieces avec le tag barre de stephane, could go eventually
        let array = PFEP.map((item, index) => {
            if(item.storage.length > 0){
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

        let array_new = PFEP.map((item, index) => {
            if(item.family && item.family !== 'Assemblage' && item.family.includes('usin')){
                return { code: item.code, type: 'MP', class: item.class, consoMens: item.consommation ? item.consommation.mensuelleMoy : undefined }
            } else return { code: item.code, type: 'assemblage', class: item.class, consoMens: item.consommation ? item.consommation.mensuelleMoy : undefined } 
        })
        array_new = array.filter(part => part !== undefined)
        term(`${array.length} parts should be placed in racking\n`)
        let object = this.getPriorityList(array)

        let MP = object.MP.map((mp, index) => { return this.app.store.getItemFromPFEP(mp.code) })
        let assemblages = object.assemblages.map((ass, index) => { return this.app.store.getItemFromPFEP(ass.code) })
        this.partLists = { MP: [...MP], assemblages: [...assemblages] }
        
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
    requestNewShelf(partList, index, tag){
        let typeNeeded = [partList[index].storage[0].type.substring(0, 3)]
        let nextPartType = partList[index].storage[0].type.substring(0, 3)
        if(nextPartType == 'bun'){ typeNeeded = ['bun'] }
        else if(nextPartType == 'bac' || nextPartType == 'cus'){ typeNeeded = ['bac', 'cus'] }
        
        
        //let typeNeeded = partList[index].storage[0].type.substring(0, 3);   //bac, bun, pal (types de contenants)
        
        
        let partsToPlace = [];
        while(partsToPlace.length < 25){
            if(partList[index + partsToPlace.length]){
                if(typeNeeded.indexOf(partList[index + partsToPlace.length].storage[0].type.substring(0, 3)) !== -1){
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
        let newShelf = this.shelfManager.createShelf(partsToPlace, tag); //returns new Shelf

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
            for(let i = 0; i <= index; i++){ locSum += partsPriority[i] }
            return locSum / (index + 1)
        })
        let moyenne = 0;
        if(sum.length > 0){
            for(let i = 0; i < sum.length; i++){ moyenne += sum[i] }
            moyenne = moyenne / sum.length
        } 
        return moyenne
    }

    //filters TAG and LENGTH (searchPlace filters HEIGHT and TYPE)
    placeNewShelf = (shelf) => {
        for(let i = 0; i < this.app.store.racking.length; i++){ //gets totalHeight of all racking
            this.app.store.racking[i].height = this.app.store.racking[i].getTotalHeight();
        }
        
        const height = (shelf) => {
            if(shelf.type == 'bac'){ return 'reach_limit' }
            else if(shelf.type == 'bUs'){ return 'reach_limit' }
            else return undefined
        }
        let targetRack, baseHeight;
        let potentialRacks = this.app.store.racking.map(rack => {
            if(shelf.length == rack.length && shelf.tag == rack.tag){ return rack }
            else return null
        }).filter(a => a !== null)

        let potentialPlaces = potentialRacks.map(rack => {
            let bH = this.getRacking(rack.name).searchPlace(shelf, height(shelf))
            return [rack, bH]
        }).filter(a => a[1] !== false); //only racking that have pace for the shelf

        if(potentialPlaces.length > 0){
            potentialPlaces = potentialPlaces.sort((a, b) => { a[1] - b[1] })
            baseHeight = potentialPlaces[0][1]
            targetRack = this.getRacking(potentialPlaces[0][0].name)
        }
        else {
            let rack = new Racking(`racking_${this.app.store.racking.length + 1}`, shelf.length, shelf.type, shelf.tag)
            this.app.store.racking.push(rack)
            targetRack = rack;
            baseHeight = 0
        }

        targetRack.addShelf(shelf, baseHeight)

        this.app.log += `\track options are:\n`
        potentialRacks.forEach(rack => this.app.log += `\t${rack.name}, ${rack.type}, ${rack.length}, ${rack.tag}\n`)

    }
    placeNewShelf_old(shelf) {
        let rackType = shelf.type == 'bac' ? 'mixed' : shelf.type;
        //console.log(`shelf.type ${shelf.type}`)
        //let shelfPriority = this.predictNewShelfPriority(partsToPlace.map(part => part.categorisation.consoMens))
        for(let i = 0; i < this.app.store.racking.length; i++){
            this.app.store.racking[i].height = this.app.store.racking[i].getTotalHeight();
        }


        let baseHeight = 0;
        let targetRack;
        let potentialRacks = this.app.store.racking.map((rack, index) => {  //finds potential racks (length, type)
            if (shelf.length == rack.length && shelf.tag == rack.tag) { return rack }
            else return null
        })

        const getMaxHeight = (type) => {
            //bundle, bac, bUs, cus, pal

        }
        let maxHeight = getMaxHeight(shelf.type)
        for(let i = 0; i < this.app.store.racking.length; i++){
            this.app.store.racking[i].searchPlace
        }
        
        potentialRacks = potentialRacks.filter((a) => a !== null)
        this.app.log += `\track options are:\n`
        potentialRacks.forEach(rack => this.app.log += `\t${rack.name}, ${rack.type}, ${rack.length}, ${rack.tag}\n`)

        //console.log('potentialRacks')
        //console.log(potentialRacks)

        if(potentialRacks.findIndex((a) => a !== null) == -1){  //si aucun potential rack => create new rack
            let rack = new Racking(`racking_${this.app.store.racking.length + 1}`, shelf.length, rackType, shelf.tag)
            this.app.store.racking.push(rack)
            targetRack = rack
        }
        else{
            potentialRacks = potentialRacks.filter((a) => a !== null);   //filters potentialRacks (null)
            //console.log('potentialRacking')
            //console.log(potentialRacks)
            let options = potentialRacks.map((rack, index) => {
                return [rack.name, rack.searchPlace(shelf)]
            })
            for(let i = 0; i < potentialRacks.length; i++){

                let place = potentialRacks[i].searchPlace(shelf, 'reach_limit')
                if(!isNaN(place) && rackType == potentialRacks[i].contentType){
                    baseHeight = place
                    targetRack = this.getRacking(potentialRacks[i].name)
            }
                //ALGO TO FIND BEST POTENTIAL RACK
                //nb of shelf already on rack => priorityZone
                //we got to check for priority (consomMens)
                
                //console.log(potentialRacks[i].shelves.length)
                if(potentialRacks[i].shelves.length <= 5){
//                    targetRack = this.getRacking(potentialRacks[i].name)
                } 
            }
            if (targetRack == undefined) {
                let rack = new Racking(`racking_${this.app.store.racking.length + 1}`, shelf.length, rackType, shelf.tag)
                targetRack = rack
                this.app.store.racking.push(rack)                
            }
        }
        //targetRack.getBlocs(shelf)       
        this.app.log += `\tPLACED ${shelf.name} in ${targetRack.name}\n` 
        targetRack.addShelf(shelf, baseHeight)

    }

    optimizeRacking() {

        //makes sure that all shelves are placed in racking
        for (let i = 0; i < this.app.store.shelves.length; i++) {
            if (this.app.store.shelves[i].baseHeight == undefined) {
                this.placeNewShelf(this.app.store.shelves[i])
            }
        }

        /**
         * 
         * @returns object of array of shelves by length
         */
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

                currentShelves = currentShelves.map((shelf, index) => { //iterates shelves in current type (length) => returns {shelf, totalConsom}
                    let parts = []
                    let totalConsom = 0;
                    shelf.content.forEach((cont, index) => {        //makes array of parts in shelf along with their consomm
                        if (parts.findIndex((a) => a[0] == cont.name.split('_')[1]) == -1) {
                            parts.push([cont.name.split('_')[1], cont.consommation])
                        }
                    })
                    parts.forEach(part => totalConsom += part[1])
                    return { ...shelf, totalConsom: totalConsom }
                })

                let shelvesToPlace = currentShelves.sort((a, b) => {    //sorts shelves to place
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

                shelvesToPlace.forEach((shelf, index) => {  //iterates over shelvesToPlace => get minimal qte of racking for shelves
                    let height = shelf.type == 'bundle' ? undefined : 'reach_limit';    //if not bundle, max height is reach_limit

                    term(`${shelf.name} isDoubleSided ${shelf.isDoubleSided}`)

                    let rack = localRacks.map((rack, index) => {        //returns array of [rack, baseHeight]
                        if (rack !== null) { return [rack, rack.searchPlace(shelf, height)] }
                        else return null
                    }).filter((a) => a !== null && a[1] !== false)

                    if (rack.length > 0) {
                        rack = rack.sort((a, b) => a[1] - b[1])[0]  //gets the rack with the minimal baseHeight
                        term(` rack: ${rack[0].name}, ${rack[1]}\n`)
                        rack[0].addShelf(shelf, rack[1])    //adds the shelf to selected rack
                    }
                    else {  //no potential placement in existing rack => creating a new rack
                        key++
                        let newRack = new Racking(`racking_${key}`, shelf.length, shelf.type, shelf.tag)
                        let place = newRack.searchPlace(shelf, height)
                        term(` newRack: ${newRack.name}, ${place}\n`)
                        if (place !== false) {
                            newRack.addShelf(shelf, place)  //adding shelf to rack
                            localRacks.push(newRack)    //pushing rack in existing rackArray
                        }
                        else console.log('PROBLEM') //we have a problem, there is no place in the new (empty) rack
                    }
                })
                racking = racking.concat(localRacks)    //merging localRacks (racks for shelve length) into racking
            })
            return racking

        }

        let shelves = getShelves();
        let init = genRacking(getShelves());

        const redistributeShelves = (initRacking) => {
            let racking = [];
            let types = []

            initRacking.forEach((rack) => { //iterates over all the racks generated before (genRacking()), classes all types&racks (length && contentSides)
                let index = types.findIndex((a) => {    //findInex => rackLength && contentSides
                    let ref = [a[0], a[1]];
                    let typ = [rack.length, rack.contentSides]
                    return ref.toString() == typ.toString() //toString() comparaison bc of lazinesss
                })
                if(index == -1){        
                    types.push([rack.length, rack.contentSides, [rack]]) //create new type(length && contentSides) along with rack
                }
                else {
                    types[index][2].push(rack) //pushes rack into already existing type
                }
            })
            console.log(types)
            //type: [rack.length, rack.contentSides, [rackArray]]


            types.forEach(type => {     //iterates over all the types created earlier (type => length && contentType) and get shelves out of them
                console.log(`----- TYPE ${type[0]} -----`)
                let shelves = [];   //initiate shelves array
                let currentRacks = [];
                type[2].forEach(rack => {
                    shelves = shelves.concat(rack.shelves); //gets shelves from rack type
                    rack.shelves = [];      //clear shelves from rack
                    currentRacks.push(rack);    //pushes rack into new rackArray
                })

                shelves = shelves.sort((a, b) => {  //sorting shelves in order of placement (priority)
                    if(a.type == 'bundle' && b.type == 'bac') return 1
                    if(a.type == 'bac' && b.type == 'bundle') return -1

                    if(a.totalConsom > b.totalConsom) return -1
                    if(a.totalConsom < b.totalConsom) return 1
                })

                shelves.forEach(s => console.log(s.name, s.type, s.totalConsom))
                let rackIter = 0; 
                /* 
                we generated racking for shelf of length and type, now that we have an idea of the number of racking needed, we can redistribute the shelves so that
                the most importants ones are at the bottom. We iterates over empty rack cleared earlier searching place for ou shelves
                */
                shelves.forEach(shelf => {
                    rackIter++; //iterates the counter
                    if(rackIter == currentRacks.length){ rackIter = 0 }; //reset the iteration counter when we want to loop around the racks
                    let height = (shelf.type == 'bundle') ? undefined : undefined;  //SHOULD CHANGE FOR reach_limit BUT CURRENTLY NOT WORKING, TESTED ON 2021-08-30
                    let place = currentRacks[rackIter].searchPlace(shelf, height);  //searchPlace in racking => returns baseHeight of shelf
                    if(place !== false){
                        currentRacks[rackIter].addShelf(shelf, place);  //adding shelf to rack
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
                                currentRacks[rackIter + 1].addShelf(shelf, place)
                            } else console.log('PROBLEM')
                        }
                    }
                })
                racking = racking.concat(currentRacks)
                
            })
            return racking
        }        

        




        this.app.store.racking = redistributeShelves(init)
        
        
        

    }

    optimizeRacking_old(){
        //makes sure that all shelves are placed in racking
        for(let i = 0; i < this.app.store.shelves.length; i++){
            if(this.app.store.shelves[i].baseHeight == undefined){
                this.placeNewShelf(this.app.store.shelves[i])
            }
        }


        //gets all shelves, organized by length
        let initShelvesObj = {}
        for(let i = 0; i < this.app.store.shelves.length; i++){
            initShelvesObj = {
                ...initShelvesObj,
                [this.app.store.shelves[i].length]: {
                    ...initShelvesObj[this.app.store.shelves[i].length],
                    [this.app.store.shelves[i].name]: this.app.store.shelves[i]
                }
            }
        }

        let shelves = {}
        for(const length in initShelvesObj){
            let currentLength = [];
            for(const shelf in initShelvesObj[length]){
                currentLength.push(initShelvesObj[length][shelf])

            }
            shelves = {
                ...shelves,
                [length]: currentLength,
            }
        }
        
        let types = Object.keys(initShelvesObj)
        const height = (shelf) => {
            if(shelf.type == 'bac'){ return 'reach_limit' }
            else if(shelf.type == 'bUs'){ return 'reach_limit' }
            else return undefined
        }


        let racking = []
        for(let i = 0; i < types.length; i++){
            console.log(types[i])
            shelves[types[i]].forEach(s => s.setTotalConsom())
            let order = shelves[types[i]].sort((a, b) => {
                if(a.type < b.type) return -1
                if(a.type > b.type) return 1

                if(a.totalConsommation < b.totalConsommation) return 1
                if(a.totalConsommation > b.totalConsommation) return -1

            })
            console.log('-----')
            order = order.map((s => console.log(s.name, s.totalConsommation)))
            console.log('---')

            
            let typeRacking = []
            let currentRack = new Racking('temp_1', order[0].length, order[0].type, order[0].tag)
            order.forEach(shelf => {
                let place = currentRack.searchPlace(shelf, height(shelf))
                if(place !== false && place !== undefined){
                    currentRack.addShelf(shelf, place)
                }
                else {
                    if(typeRacking.findIndex(a => a.name == currentRack.name) == -1){ typeRacking.push(currentRack) }
                    let potential = typeRacking.map(rack => {
                        let place = rack.searchPlace(shelf, height(shelf))
                        if(place !== false && place !== undefined){ return [rack, place] }  //array [rack, baseHeight]
                        else return null
                    }).filter(a => a !== null)
                    if(potential.length > 0){

                    }
                }

            })


            
            
            /* 
            shelves[types[i]].forEach(shelf => {
                let potential = racking.map(rack => {
                    if(rack.length == shelf.length && rack.tag == shelf.tag){
                        let height = height(shelf)
                        return [rack.name, this.app.store.rackManager.getRacking(rack.name).searchPlace(shelf, height(shelf))]
                    }
                }).filter(a => a[1] !== false)
                if(potential.length > 0){

                }
            })
 */

            shelves[types[i]].map((shelf, index) => {
                console.log(shelf.name, shelf.priority, shelf.content.length)

            })
            
        }
        /*
        loop thru racking assinging shelves (sorted by priority) around racking of same length
        check if rack with low height can be replaced by shelve on other racking

        */
        //console.log(shelves['4000'])




    }

    placeInRacking(partList, tag){
        this.app.log += `received ${partList.length} parts (placeInRacking)\n`
        //let mains = ['SEP2506', 'SEP2507', 'SEP2521']
        let qteToPlace = partList.length
        this.app.log += `\tinitializing placeInRacking with tag: ${tag}\n`
        
       // partList = ['SEP3978', 'SEP260-0G4456', 'SEP3979', 'SEP4059', 'SEP2504', 'SEP3807-LA', 'SEP3782', 'SEP2506', 'SEP2507', 'SEP2521'];
        
        //partList = partList.concat(mains)
        //partList = ['EXV001-2600', 'EXV001-1720'];
        //partList = ['SEP4022', 'SEP3550', 'SEP3553', 'SEP3562', 'SEP3568', 'SEP3799']
        //partList = partList.map(part => this.app.store.getItemFromPFEP(part))
        


        let failedParts = []
        //partList = partList.map((part, index) => { return this.app.store.getItemFromPFEP(part.code) })
        for(let i = 0; i < partList.length; i++){
            term(`\n---------- NEW PART ----------\n`)
            this.app.log += 'new part--\n'
            this.app.log += `\n\n---------- ${partList[i].code} ----------\n`
            this.app.log += `${partList[i].storage.length} containers (${partList[i].storage[0].name.split('_')[0]}, ${partList[i].storage[0].length}, ${partList[i].storage[0].width}, ${Math.ceil(partList[i].storage[0].height)}) - priority: ${Math.ceil(partList[i].consommation.mensuelleMoy)}\n`
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
            this.app.log += `${this.app.store.shelves.length} shelves in store, ${potentialShelves.filter(a => a !== null).length} potential shelves\n`
            term(`${this.app.store.shelves.length} shelves in store, ${potentialShelves.filter(a => a !== null).length} potential shelves\n`)

            if(potentialShelves.findIndex((shelf) => shelf !== null) == -1){
                let lostShelf = null
                let u = 0;
                while (lostShelf == null & u < this.app.store.shelves.length){
                    if(this.app.store.shelves[u].isShelfFrontFull() > 0.50 && this.app.store.shelves[u].baseHeight == undefined){
                        this.placeNewShelf(this.app.store.shelves[u], tag)
                    }
                    u++
                }
                term.cyan('\n----- CREATING SHELF -----\n')
                this.app.log += `----- CREATING SHELF -----\n`
                newShelf = true;
                shelf = this.requestNewShelf(partList, i, tag);  //returns new shelf


            }

            else {
                //potentialShelves.map(shelf => {if(shelf !== null){console.log(shelf[1], shelf[2])}})
                potentialShelves = potentialShelves.filter((a) => a !== null)
                potentialShelves.forEach(s => this.app.log += `\t${s[0].name}, ${s[0].length}, ${s[0].type}, ${s[1]}, ${s[2]}\n`)
                shelf = this.shelfManager.matchPartToShelf(potentialShelves, partList[i]);
                this.app.log += `placing part in ${shelf[0].name}\n`
                let test = shelf[0].searchPlace(partList[i], shelf[1])
                accessPoint = shelf[1];
                shelf = shelf[0];

                newShelf = false
            }
            
            if(shelf !== null){
                //term(`placing ${partList[i].code} in ${shelf.name}\n`)
                let place = shelf.searchPlace(partList[i], accessPoint)
                console.log(place)
                this.app.log += `\t ${place}\n`
                
                if(place !== false){
                    this.app.log += `PART SUCCESSFULLY PLACED\n`
                    term.green(`part successfully placed\n`)
                    //console.log(partList[i].storage.length)
                    for(let j = 0; j < place.length; j++){
                        shelf.putInShelf(place[j][0], place[j][1], place[j][2], partList[i].storage[j], partList[i], accessPoint)                
                    }
                    
                }
                else {
                    console.log('DIDNT WORK ON FIRST TRY')
                    this.app.log += `part not placed in ${shelf.name}`
                    let part = { ...partList[i] }
                    let containerCount = part.storage.length;
                    let containerNbToPlace = containerCount;
                    let partsFitOnShelf = false;
                    while(containerNbToPlace > 1){
                        containerNbToPlace--
                        part.storage = part.storage.slice(0, containerNbToPlace)
                        let place = shelf.searchPlace(part, accessPoint);
                        if(place !== false){
                            partsFitOnShelf = true
                            break;
                        }
                    }
                    if(partsFitOnShelf == true){
                        let partsToAdd = []
                        let totalContainers = 0
                        while(totalContainers < containerCount){
                            let item = { ...part }
                            if(totalContainers + part.storage.length <= containerCount){ partsToAdd.push(item) }
                            else {
                                part.storage = part.storage.slice(0, (containerCount - totalContainers))
                                partsToAdd.push(item)
                            }
                            totalContainers += part.storage.length
                        }
                        console.log(partsToAdd.map(item => item.storage.length))
                        partList.splice(i, 1, ...partsToAdd)
                        //partList.splice(i+1, 0, ...partsToAdd)
                        
                    }
                    else{
                        term.red('error - part not placed\n')
                        failedParts.push(partList[i])

                    }

                    console.log(part.storage.length)
                    //console.log(partList[i].storage[0])



                    let test = this.shelfManager.findPotentialShelf(partList[i], categorisation);

                }                

            }
            else console.log('SHELF == NULL')
        }
        term(`\n\n\n ${qteToPlace} parts should be placed\n`)
        term.red(`${failedParts.length} part have not been placed in racking\n`)
        console.log(this.shelfManager.unusedShelves)
    }
}

module.exports = RackManager