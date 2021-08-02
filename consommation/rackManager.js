const ShelfManager = require('./shelfManager');
const Racking = require('./containers/racking');
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

        return { MP: MP, assemblages, assemblages}
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
        //this.placeInRacking(assemblages)
    }

    /**
     * Makes list of nexts parts to place in to shelf to be created and uses shelfManager.createShelf() to return new shelf
     * @param {*array} partList 
     * @param {*number} index 
     * @returns new shelf
     */
    requestNewShelf(partList, index){
        let typeNeeded = partList[index].storage[0].type.substring(0, 3);   //bac, bun, pal (types de contenants)
        let partsToPlace = [];
        while(partsToPlace.length < 25){
            if(partList[index + partsToPlace.length]){
                if(partList[index + partsToPlace.length].storage[0].type.substring(0, 3) == typeNeeded){
                    let categorisation = {
                        consoMens: partList[index + partsToPlace.length].consommation ? partList[index + partsToPlace.length].consommation.mensuelleMoy : undefined,
                        classe: partList[index + partsToPlace.length].class ? partList[index + partsToPlace.length].class : undefined,
                        type: partList[index + partsToPlace.length].storage[0].type
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
        this.placeNewShelf(newShelf)
        return newShelf
        

    }

    createRacking(length){
        let name = -'name1';
        let type = 'type1';
        let rack = new Racking(name, length, type)

        return rack
    }
    placeNewShelf(shelf) {
        console.log('place in racking')
        let targetRack;
        let potentialRacks = this.app.store.racking.map((rack, index) => {
            if (shelf.length == rack.length) { return rack }
            else return null
        })

        console.log(potentialRacks)


        console.log(potentialRacks.findIndex((a) => a !== null))
        if(potentialRacks.findIndex((a) => a !== null) == -1){
            console.log('create new racking')

            let rack = new Racking(`racking_${this.app.store.racking.length + 1}`, shelf.length, 'shelfTest')
            rack.addShelf(shelf)
            console.log(rack.shelves.length)
            this.app.store.racking.push(rack)
        }
        else{
            let potential = potentialRacks.filter((a) => a !== null && a.length == shelf.length);
            let targetRackName = undefined
            for(let i = 0; i < potential.length; i++){ if(potential[i].height < 1600){ targetRackName = potential[i].name; break; } }

            if (targetRackName == undefined) {
                let rack = new Racking(`racking_${this.app.store.racking.length + 1}`, shelf.length, 'shelfTest')
                rack.addShelf(shelf)
                console.log(rack.shelves.length)
                this.app.store.racking.push(rack)

            }
            else {
                this.getRacking(targetRackName).addShelf(shelf)
            }
            console.log(`shelves in rack: ${this.app.store.racking[potentialRacks.findIndex((a) => a !== null)].shelves.length}`)
            console.log('place in already existing rack')
        }

        this.app.store.racking.map((rack, index) => {
            console.log(rack.name, rack.length, rack.shelves.length)
        })
    }

    placeInRacking(partList){
        
        //partList = ['SEP3978', 'SEP260-0G4456', 'SEP3979', 'SEP4059', 'SEP2504', 'SEP3807-LA', 'SEP3782'];
        //partList = ['EXV001-2600', 'EXV001-1720'];
        //partList = ['SEP4022', 'SEP3550', 'SEP3553', 'SEP3562', 'SEP3568', 'SEP3799']
        //partList = partList.map(part => this.app.store.getItemFromPFEP(part))
        
        let failedParts = []
        partList = partList.map((part, index) => { return this.app.store.getItemFromPFEP(part.code) })
        for(let i = 0; i < partList.length; i++){
            console.log('\n----- NEW PART -----')
            console.log(`${this.app.store.shelves.length} shelves in racking`)
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
            
            console.log(`${potentialShelves.filter(a => a !== null).length} potential shelves`)

            if(potentialShelves.findIndex((shelf) => shelf !== null) == -1){
                console.log('NEW SHELF')
                newShelf = true;
                shelf = this.requestNewShelf(partList, i);  //returns shelf
                if(partList[i].code.includes('EXV') && shelf !== null){
                    console.log('new shelf for exv')
                }
            }

            else {
                //potentialShelves.map(shelf => {if(shelf !== null){console.log(shelf[1], shelf[2])}})
                shelf = this.shelfManager.matchPartToShelf(potentialShelves, partList[i]);
                let test = shelf[0].searchPlace(partList[i], shelf[1])
                if(partList[i].code.includes('EXV')){

                    console.log('exv')
                    console.log(test)
                }
                accessPoint = shelf[1];
                shelf = shelf[0];

                newShelf = false
            }
            
            console.log(`placing in new shelf? ${newShelf}`)
            if(shelf !== null){
                console.log(`placing ${partList[i].code} in ${shelf.name}`)
                let place = shelf.searchPlace(partList[i], accessPoint)
                console.log(place)
                
                
                if(place == false){
                    failedParts.push(partList[i])
                    let test = this.shelfManager.findPotentialShelf(partList[i], categorisation);
                    //console.log(test)
                    //console.log(partList[i])
                }
                
                
                for(let j = 0; j < place.length; j++){
                    shelf.putInShelf(place[j][0], place[j][1], place[j][2], partList[i].storage[j], partList[i])                
                    if(partList[i].code.includes('EXV')){
                        console.log('calisse de exv')
                        //console.log(shelf.content)
                    }
                }

            }
            else console.log('SHELF == NULL')
        }
        console.log(`${partList.length} parts should be placed`)
        console.log(failedParts)
    }
}

module.exports = RackManager