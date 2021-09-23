const terminal = require('terminal-kit').terminal;
const Racking = require('./containers/racking');
const Shelf = require('./containers/shelf');
const FRONT = 'FRONT';
const BACK = 'BACK';
const ExportData = require('./exportData')
const exportData = new ExportData()


class StoreUpdater{
    constructor(app){
        this.app = app
    }

    getTargetTypes = (type) => {
        const types = ['bun', 'bac', 'cus', 'bUs', 'pal']   //IMPORTANT IF WE ADD TYPES
        switch(type.substring(0, 3)){
            case 'bun': return ['bun', 'bUs']
            case 'bac': return ['bac', 'cus']
            case 'cus': return ['bac', 'cus']
            case 'bUs' : return ['bun', 'bUs']
            case 'pal': return ['pal']  //pal is not completed, WILL fuck the program
        }
    }



    getPotentialShelves = (part, shelves, accessSides) => {
        const targetTypes = this.getTargetTypes(part.storage[0].type)
        let shelfPotential = shelves.map(shelf => {
            if(shelf.type == undefined || targetTypes.indexOf(shelf.type.substring(0, 3)) !== -1){
                if(shelf.tag == part.tag || shelf.tag == undefined){
                    let placement = [accessSides[0] ? shelf.searchPlace(part, FRONT) : false, accessSides[1] ? shelf.searchPlace(part, BACK) : false]
                    if(placement.findIndex(a => a !== false) !== -1){
                        return [shelf, placement[0], placement[1]]
                    }
                    else return null
                }
                else return null
            }
            else return null
        }).filter(a => a !== null)
        return shelfPotential

    }
    getRackingPotential = (part) => {
        const container = part.storage[0];
        const needLift = ['bundle', 'bUs'];
        const accessOptions = [FRONT, BACK];
        const combForDoubleSide = [
            ['bac', 'bac'],
            ['cus', 'cus'],
            ['bac', 'cus'],
            ['cus', 'bac'],
            ['bac', null],
            ['cus', null],
            [null, null],
        ]

        /*
        si [bundle, null] => [true, false]
        si [bundle, bac] => [true, false]
        si [bac, bac] => [true, true]
        si [bac, null] => [true, true]
        si [bUs, bundle] => [true, false]
        */

        let rackingPotential = this.app.store.racking.map(rack => {
            //conditions for choice of racking
            //lift, type, accessSide

            //si type needs lift
            if(needLift.indexOf(container.type) !== -1 && rack.liftAccess == false){ 
                return null
            }  //return null when racking doesnt allow lift and part needs it

            let accessSides = [true, false]; //[FRONT, BACK]
            if(combForDoubleSide.findIndex(a => a.toString() == rack.contentSides.toString()) !== -1){ accessSides = [true, true] }   //check if we can put parts on both sides
            
            
            if(rack.tag == part.tag || rack.tag == undefined){
                let potentialShelves = this.getPotentialShelves(part, rack.shelves, accessSides)
                if(potentialShelves.length > 0){
                    let _rack = { ...rack, shelves: potentialShelves }
                    return _rack
                }
                else return null
            }
            else return null
            

            

        }).filter(a => a !== null)

        return rackingPotential

    }
    placeContainers = (partList) => {
        const accessOptions = [FRONT, BACK];
        this.app.log = '';
        partList.map(part => {
            this.app.log += `----- ${part.code} -----\n`;
            console.log(part.code)
            let potential = this.getRackingPotential(part)


            potential.forEach(rack => {
                if(rack.shelves){
                    rack.shelves.forEach(shelf => {
                        if(shelf){
                            this.app.log += `\t${shelf[0].name} - ${shelf[0].type} - ${shelf[0].isDoubleSided}\n`
                        }
                    })
                }
            })


            racking:
            for(let i = 0; i < potential.length; i++){
                shelves:
                console.log(potential[i].shelves)
                for(let j = 0; j < potential[i].length; j++){
                    let placement = [potential[i].shelves[j][1], potential[i].shelves[j][2]]

                    if(placement.findIndex(a => a !== false) !== -1){
                        let place = placement.find(a => a !== false)
                        let accessPoint = accessOptions[placement.findIndex(a => a !== false)]
                        let shelf = this.app.store.getShelfFromRacking(potential[i].shelves[j][0].name)                        


                        if(place !== false){
                            //need to assign type
                            //racking priority !== updateProps
                            //need to check props
                            //shelf priority
                            //shelf: priority, accessRatio, ...props
                            if(shelf.type == undefined){ shelf.type = part.storage[0].type }


                            this.app.log += 'part successfuly placed\n'
                            for(let j = 0; j < place.length; j++){
                                shelf.putInShelf(place[j][0], place[j][1], place[j][2], part.storage[j], part, accessPoint)                
                            }
                            break racking;
                        }


                    }

                    //des qu'on trouve une place on le met dedans et on break


                }
            }

            this.app.log += `----------\n\n`

        })

        exportData.exportTxt(this.app.log, 'log', '../SORTIE')
        console.log('should be done processing things')

    }


    /**
     * Clear the racking and shelves while retainning height, priorityIndex, etc
     * @returns [newRacking, newShelves]
     */
    clearRacking = () => {
        let newShelves = []
        let newRacking = this.app.store.racking.map(rack => {
            let r = new Racking(rack.name, rack.length, rack.type, undefined)
            let shelvesSource = rack.shelves.sort((a, b) => a.baseHeight - b.baseHeight)
            r.shelves = shelvesSource.map((shelf, index) => {
                let shelfData = {
                    length: shelf.length,
                    rating: shelf.capacity * 2.2046
                }
                let s = new Shelf(shelf.name, shelfData, undefined, undefined)
                s = {
                    ...s,
                    baseHeight: shelf.baseHeight,
                    address: shelf.address,
                    height: shelf.height
                }
                newShelves.push(s)
                return s
            })
            r = {
                ...r,
                address: rack.address,
                contentSides: rack.contentSides,
                height: rack.height,
                priorityIndex: rack.priorityIndex,
                liftAccess: rack.liftAccess,
            }
            return r
        })
        
        newRacking = newRacking.sort((a, b) => a.priorityIndex - b.priorityIndex)
        return [newRacking, newShelves]
    }

}

module.exports = StoreUpdater
/* 
let placementOptions = rackingPotential.map((rack, index) => {
    /*
    *should start with things that require lift bc place is limited
    allow bun|bUs when rakcing has bun|bUs in accessSides
    *//*
    return this.app.store.rackManager.shelfManager.findPotentialShelves(part, rack.shelves, rack.accessSides)
})



racking:
for(let i = 0; i < placementOptions.length; i++){
    shelves:
    for(let j = 0; j < placementOptions[i].length; j++){
        let placement = placementOptions[i][j]
        let shelf = placement[0]
        if(placement[1] !== false){
            console.log(placement[0].name, placement[1])
            this.app.log += `\t found ${placement[0].name}, ${placement[0].type} in FRONT\n}`

            break racking;

            //place in FRONT
        }
        else if(placement[2] && placement[0].isDoubleSided == true){
            //place in BACK
            this.app.log += `\t found ${placement[0].name}, ${placement[0].type} in BACK\n}`
            break racking;

        }
    }
} */