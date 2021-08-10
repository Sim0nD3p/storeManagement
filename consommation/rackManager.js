const ShelfManager = require('./shelfManager');
const Racking = require('./containers/racking');
const term = require('terminal-kit').terminal
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
    }

    test(){
        console.log(this.store.racking);
    }

    getRacking(name){
        let rackIndex = -1
        for(let i = 0; i < this.app.store.racking.length; i++){
            if(this.app.store.racking[i].name == name){ rackIndex = i }
        }
        return this.app.store.racking[rackIndex]
    }

    getPriorityList(array){
        let assemblages = new Array(array.length).fill(undefined);
        let MP = new Array(array.length).fill(undefined);
        for(let i = 0; i < array.length; i++){
            if(array[i].type == 'MP'){ MP[i] = array[i] }
            else if(array[i].type == 'assemblage'){ assemblages[i] = array[i] }
        }

        assemblages = assemblages.filter(ass => ass !== undefined);
        MP = MP.filter(mp => mp !== undefined);

        //SHOULD GET BETTER SORTING ALGORITHM
        //ajouter utilisation des pieces pour proximite picking
        MP = MP.sort(function(a, b){ return b.consoMens - a.consoMens })
        assemblages = assemblages.sort(function(a, b){ return a.class > b.class ? 1 : -1 })

        return { MP: MP, assemblages: assemblages}
    }

    filterParts(PFEP){
        PFEP = PFEP.map((item, index) => {
            if(item.class){
                if(!item.class.includes('barr')){ return item }
            } else return item
        })
        return PFEP.filter(item => item !== undefined)
    }

    initRacking(PFEP) {
        PFEP = this.filterParts(PFEP);  //enleve les pieces avec le tag barre de stephane, could go eventually
        let array = PFEP.map((item, index) => {
            if(item.storage.length > 0){
                if (item.class) {
                        if (item.family && item.family !== 'Consommable') {
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
        let object = this.getPriorityList(array)

        let MP = object.MP.map((mp, index) => { return this.app.store.getItemFromPFEP(mp.code) })
        let assemblages = object.assemblages.map((ass, index) => { return this.app.store.getItemFromPFEP(ass.code) })
        
        console.log(`MP ${MP.length}`)
        console.log(`assemblages ${assemblages.length}`)
        this.placeInRacking(MP);
        this.placeInRacking(assemblages)
    }

    /**
     * Makes list of nexts parts to place in to shelf to be created and uses shelfManager.createShelf() to return new shelf
     * @param {*array} partList 
     * @param {*number} index 
     * @returns new shelf
     */
    requestNewShelf(partList, index){
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
        //console.log('end of requestNewShelf')
        let newShelf = this.shelfManager.createShelf(partsToPlace); //returns new Shelf
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
    placeNewShelf(shelf, partsToPlace) {
        let rackType = shelf.type == 'bac' ? 'mixed' : shelf.type;
        //console.log(`shelf.type ${shelf.type}`)
        //let shelfPriority = this.predictNewShelfPriority(partsToPlace.map(part => part.categorisation.consoMens))
        for(let i = 0; i < this.app.store.racking.length; i++){
            this.app.store.racking[i].height = this.app.store.racking[i].getTotalHeight();
        }


        let baseHeight = 0;
        let targetRack;
        let potentialRacks = this.app.store.racking.map((rack, index) => {  //finds potential racks (length, type)
            if (shelf.length == rack.length) { return rack }
            else return null
        })

        //console.log('potentialRacks')
        //console.log(potentialRacks)

        if(potentialRacks.findIndex((a) => a !== null) == -1){  //si aucun potential rack => create new rack
            term.column(5); term(`no options available for length ${shelf.length}\n`)
            let rack = new Racking(`racking_${this.app.store.racking.length + 1}`, shelf.length, rackType)
            this.app.store.racking.push(rack)
            targetRack = rack
        }
        else{
            potentialRacks = potentialRacks.filter((a) => a !== null);   //filters potentialRacks (null)
            //console.log('potentialRacking')
            //console.log(potentialRacks)


            let rackName;
            term.column(5); term('potential racking are:\n')
            potentialRacks.map(rack => { term.column(10); term(`${rack.name}, ${rack.length}, ${rack.height}, ${rack.contentType}\n`) })

            let options = potentialRacks.map((rack, index) => {
                return [rack.name, rack.searchPlace(shelf)]
            })
            term.column(5); term(`options are: \n`)
            options.map(option => { term.column(10); term(`${option[0]}, ${option[1]}\n`)})
            for(let i = 0; i < potentialRacks.length; i++){
                let place = potentialRacks[i].searchPlace(shelf)
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
                let rack = new Racking(`racking_${this.app.store.racking.length + 1}`, shelf.length, rackType)
                targetRack = rack
                this.app.store.racking.push(rack)                
            }
        }
        //targetRack.getBlocs(shelf)
        
        targetRack.addShelf(shelf, baseHeight)
        term(`\nshelf added to racking (${targetRack.name}, ${targetRack.length})\n`)

    }

    placeInRacking(partList){
        //let mains = ['SEP2506', 'SEP2507', 'SEP2521']
        
       // partList = ['SEP3978', 'SEP260-0G4456', 'SEP3979', 'SEP4059', 'SEP2504', 'SEP3807-LA', 'SEP3782', 'SEP2506', 'SEP2507', 'SEP2521'];
        
        //partList = partList.concat(mains)
        //partList = ['EXV001-2600', 'EXV001-1720'];
        //partList = ['SEP4022', 'SEP3550', 'SEP3553', 'SEP3562', 'SEP3568', 'SEP3799']
        //partList = partList.map(part => this.app.store.getItemFromPFEP(part))
        
        let failedParts = []
        //partList = partList.map((part, index) => { return this.app.store.getItemFromPFEP(part.code) })
        for(let i = 0; i < partList.length; i++){
            term(`\n---------- NEW PART ----------\n`)
            term(`${partList[i].code} - ${partList[i].storage.length} containers - priority: ${Math.ceil(partList[i].consommation.mensuelleMoy)}\n`)
            //console.log('----- placing in racking -----\n')
            let categorisation = {
                consoMens: partList[i].consommation ? partList[i].consommation.mensuelleMoy : undefined,
                classe: partList[i].class ? partList[i].class : undefined,
                type: partList[i].storage[0].type
            }
            let potentialShelves = this.shelfManager.findPotentialShelf(partList[i], categorisation);
            let shelf; let accessPoint = FRONT;
            let place;
            
            //let place = shelf.searchPlace(partList[i], BACK);  //returns place
            let newShelf;
            

            //thats fine
            
            term(`${this.app.store.shelves.length} shelves in store, ${potentialShelves.filter(a => a !== null).length} potential shelves\n`)

            if(potentialShelves.findIndex((shelf) => shelf !== null) == -1){
                term('\n----- CREATING SHELF -----\n')
                newShelf = true;
                shelf = this.requestNewShelf(partList, i);  //returns new shelf


                let lostShelf = null
                let u = 0;
                while (lostShelf == null & u < this.app.store.shelves.length){
                    if(this.app.store.shelves[u].isShelfFrontFull() > 0.50 && this.app.store.shelves[u].baseHeight == undefined){
                        term(`\nplacing shelf (${this.app.store.shelves[u].name}), length: ${this.app.store.shelves[u].length}\n`)
                        this.placeNewShelf(this.app.store.shelves[u])
                    }
                    u++
                }
            }

            else {
                //potentialShelves.map(shelf => {if(shelf !== null){console.log(shelf[1], shelf[2])}})
                shelf = this.shelfManager.matchPartToShelf(potentialShelves, partList[i]);
                let test = shelf[0].searchPlace(partList[i], shelf[1])
                accessPoint = shelf[1];
                shelf = shelf[0];

                newShelf = false
            }
            
            if(shelf !== null){
                //term(`placing ${partList[i].code} in ${shelf.name}\n`)
                let place = shelf.searchPlace(partList[i], accessPoint)
                
                if(place !== false){
                    console.log(place)
                    term.green(`part successfully placed\n`)
                    console.log(partList[i].storage.length)
                    console.log(place.length)
                    for(let j = 0; j < place.length; j++){
                        shelf.putInShelf(place[j][0], place[j][1], place[j][2], partList[i].storage[j], partList[i])                
                    }
                    
                }
                else {
                    console.log('DIDNT WORK ON FIRST TRY')
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
                        partList.splice(i, 1)
                        partList.splice(i+1, 0, ...partsToAdd)
                        
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
        console.log(`${partList.length} parts should be placed`)
        console.log(this.shelfManager.unusedShelves)
        console.log(failedParts)
    }
}

module.exports = RackManager