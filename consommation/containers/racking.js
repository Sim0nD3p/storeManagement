const REACH_LIMIT = 2500;
const PRIORITY_LIMIT = 1600
const GAP = 100;
const MAX_HEIGHT = 6000;
/*
Racking will have a 'good zone' were priority shelves will be placed
*/
class Racking{
    constructor(name, length, type, tag){
        this.name = name;
        this.length = length;
        this.tag = tag
        this.type;  //assemblage ou MP
        this.shelves = []
        this.contentType = type;
        //this.priorityZone = [0, 1600]
        //this.space = new Array(10000).fill(null)
        this.height = 0
        this.priority;
        this.class;
    }

    getTotalHeight(){
        let s = this.shelves[this.shelves.length - 1]
        return s.baseHeight + s.height
    }

    /**
     * 
     * @param {shelf} shelf 
     * @param {*} priority 
     * @returns baseHeight
     */
    searchPlace = (shelf, priority) => {

        let place;

        const checkPlace = (i, shelf) => {
            let s = this.shelves;
            if(s[i+1] && s[i].baseHeight + s[i].height + shelf.height + 2 * GAP <= s[i+1].baseHeight){
                return s[i].baseHeight + s[i].height + GAP
            }
            else if(!s[i+1]){
                return s[i].baseHeight + s[i].height + GAP
            }
        }

        let i = 0;
        let currentBaseHeight = 0
        while (currentBaseHeight < MAX_HEIGHT && i < this.shelves.length && place == undefined){
            let s = this.shelves[i];
            currentBaseHeight = s.baseHeight;
            if(shelf.type == 'bac'){
                if(this.contentType == 'mixed'){
                    //check entre dernier bac et REACH_LIMIT
                    if(currentBaseHeight + s.height + GAP + shelf.height <= REACH_LIMIT){
                        if(place !== false){
                            place = checkPlace(i, shelf)
                        }
                    }
                }
                else if(this.contentType == 'bac'){
                    //check entre dernier bac et MAX_HEIGHT
                    if(currentBaseHeight + s.height + GAP + shelf.height <= MAX_HEIGHT){
                        if(place !== false){
                            place = checkPlace(i, shelf)
                        }
                    }
                }
            }
            else if(shelf.type == 'bundle'){
                if(this.contentType == 'mixed'){
                    //check entre REACH_LIMIT et MAX_HEIGHT
                    if(currentBaseHeight + s.height + GAP >= REACH_LIMIT && currentBaseHeight + s.height + GAP + shelf.height <= MAX_HEIGHT){
                        if(place !== false){
                            place = checkPlace(i, shelf)                            
                        }
                    }

                }
                else if(this.contentType == 'bundle'){
                    //check entre dernier buncle et MAX_HEIGHT
                    if(currentBaseHeight + s.height + GAP + shelf.height <= MAX_HEIGHT){
                        if(place !== false){
                            place = checkPlace(i, shelf)
                            
                        }
                    }

                }
            }
            i++
        }
        console.log(place)
        return place
    }
    addShelf = (shelf, baseHeight) => {
        //shelf.baseHeight = this.getBaseHeight()


        shelf.baseHeight = baseHeight
        //console.log(`shelf.height ${shelf.height}`)
        /* 
        for(let i = 0; i < this.space.length; i++){
            if(this.space[i] == null){
                let isFitting = true;
                for(let j = i; j < i + shelf.height; j++){ if(this.space[j] !== null){ isFitting = false } }
                if(isFitting == true){
                    for(let j = i; j < i + shelf.height; j++){
                        console.log(shelf.name)
                        this.space[j] = shelf.name
                    }
                }
            }
        }
        console.log(this.space)
 */

        this.shelves.push(shelf)
        this.height = this.getTotalHeight();

    }
}

module.exports = Racking;