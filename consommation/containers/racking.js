const term = require("terminal-kit").terminal;

const REACH_LIMIT = 3500;
const PRIORITY_LIMIT = 1600
const GAP = 150;
const MAX_HEIGHT = 6000;
/*
Racking will have a 'good zone' were priority shelves will be placed
*/
class Racking{
    constructor(name, length, type, tag){
        this.name = name;
        this.length = length;
        this.tag = tag; ////assemblage ou MP
        this.type;  
        this.address;   //range in letters
        this.shelves = []
        this.contentType = type;    //mixed, bac, bundle
        //this.priorityZone = [0, 1600]
        //this.space = new Array(10000).fill(null)
        this.contentSides = [null, null]
        this.height = 0
        this.priority;
        this.priorityIndex;
        this.class; //unused?
    }

    getTotalHeight = () => {
        let s = this.shelves[this.shelves.length - 1]
        return s.baseHeight + s.height
    }

   


    /**
     * 
     * @param {*shelf Object} shelf 
     * @param {Number || String (reach_limit)} height - height limit
     * @returns place (baseHeight)
     */
    searchPlace = (shelf, height) => {
        let logToConsole = 1;
        logToConsole >= 3 ? this.shelves.map(s => console.log(s.baseHeight, s.height)) : null
        let place = undefined
        const checkPlace = (i, shelf) => {
            let s = this.shelves;
            if(s[i+1] && s[i].baseHeight + s[i].height + shelf.height + 2 * GAP <= s[i+1].baseHeight){  //s'il y a shelf plus haut
                return s[i].baseHeight + s[i].height + GAP
            }
            else if(!s[i+1]){   //s'il y a pas de shelf plus haut
                return s[i].baseHeight + s[i].height + GAP;
            }
        }

        

        if(this.checkShelfComp(shelf) == true){
            if (this.shelves.length > 0) {  //nombre de shelf actuellement dans racking
                let i = 0;
                this.updateProps()
                let currentBaseHeight = 0;
                while (currentBaseHeight < MAX_HEIGHT && i < this.shelves.length && place == undefined) {
                    let s = this.shelves[i]
                    currentBaseHeight = s.baseHeight;
                    if (!height || shelf.type == 'bundle') {
                        if (currentBaseHeight + s.height + GAP + shelf.height <= MAX_HEIGHT) {
                            place = checkPlace(i, shelf)
                        }
    
    
                    }
                    else if (height == 'reach_limit') {
                        if (currentBaseHeight + s.height + GAP + shelf.height <= REACH_LIMIT) {
                            place = checkPlace(i, shelf)
                        }
    
                    }
                    else if (height) {
                        if (currentBaseHeight + s.height + GAP + shelf.height <= height) {
                            place = checkPlace(i, shelf)
                        }
                    }
                    i++
                }
            } else if(this.shelves.length == 0){ place = 0 } 
        } else return false



        if(place == undefined){ place = false }

        return place

    }
    getType = (shelf) => {
        switch(shelf.type){
            case 'bac': return ['bac', 'cus']
            case 'cus': return ['cus', 'bac']
            case 'bundle': return ['bundle', 'bUs']
            case 'bUs': return ['bUs', 'bun']
            default: return ['bac']
        }
    }

    /**
     * Checks contentSides, array of content accessed from both sides
     * @returns array of content accessed from sides
     */
    getContentSides = () => {
        let contentSides = [null, null]
        this.shelves.forEach(shelf => {
            if(shelf.isDoubleSided){    //si shelf est doubleSided, les 2 cote du rack ont le meme content (shelf prop)
                contentSides = [shelf.type, shelf.type]
            }
            //si shelf type n'est pas encore dans contentSides et il y a un slot de dispo
            else if (contentSides.findIndex(a => this.getType(shelf).includes(a)) == -1 && contentSides.findIndex(a => a == null) !== -1) {
                contentSides[contentSides.findIndex(a => a == null)] = shelf.type
            }
        })
        return contentSides
    }

    /**
     * Check compatibility of shelf in regards to contentSide ([bac, bac], [bac, bun], etc.)
     * @param {*Object shelf} shelf 
     * @returns bool (if shelf is compatible with racking on contentSides level)
     */
    checkShelfComp = (shelf) => {
        let type = this.getType(shelf);
        if(shelf.isDoubleSided == false){
            let compatible = false
            type.forEach(t => { if(this.contentSides.indexOf(t) !== -1){ compatible = true } })
            if(compatible == true || this.contentSides.indexOf(null) !== -1){
                return true
            } else return false
        } else {
            let compatibilityArray = [[shelf.type, shelf.type], [shelf.type, null], [null, shelf.type], [null, null]]
            if(compatibilityArray.findIndex(a => a.toString() == this.contentSides.toString()) !== -1){
                return true
            } else return false
        }
    } 


     /**
     * if we can add shelf to racking?
     * @param {*Object shelf} shelf 
     * @returns bool
     */
      checkContentSides_old = (shelf) => {
        let possForDouble = [['bac', 'bac'], ['bac', null], [null, 'bac'], [null, null], ['bun', null], [null, 'bun'], ['bUs', null], [null, 'bUs']]
        if(shelf.isDoubleSided == true){
            if(possForDouble.findIndex((a) => a.toString() == this.contentSides.toString()) == -1){ return false }
            else return true
        }
        else if(shelf.isDoubleSided !== true){
            if(this.contentSides.indexOf(shelf.type) == -1 && this.contentSides.indexOf(null) == -1){ return false }
            else return true
        }
    }

    /**
     * 
     * @returns bool(isDoubleSided)
     */
    checkAccessPoints_old = () => {
        if(this.shelves.filter((a) => a.isDoubleSided == true).length > 0) return true
        else return false
    }
    getContentSides_old = (shelf) => {
        if(this.checkContentSides(shelf) == true){
            if(shelf.isDoubleSided == true){ this.contentSides = ['bac', 'bac'] }
            else if(this.contentSides.indexOf(shelf.type) == -1 && this.contentSides.indexOf(null) !== -1){
                this.contentSides[this.contentSides.indexOf(null)] = shelf.type
            }

        }
    }

    /**
     * 
     * @param {shelf} shelf 
     * @param {*} priority 
     * @returns baseHeight
     */
    searchPlace_old = (shelf, priority) => {

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
                    if(currentBaseHeight + s.height + GAP /*+ shelf.height*/ <= REACH_LIMIT){
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
        return place
    }

    setPriority = () => {
        let totalConsom = 0;
        let nb = 0;
        this.shelves.forEach(shelf => {
            if(shelf.totalConsom && !isNaN(shelf.totalConsom)){
                totalConsom += Number(shelf.totalConsom)
                nb++
            }
        })
        this.priority = totalConsom
    }
    updateProps = () => {
        this.contentSides = this.getContentSides()
        this.height = this.getTotalHeight();
        this.setPriority()
        this.shelves = this.shelves.sort((a, b) => a.baseHeight - b.baseHeight)
    }

    addShelf = (shelf, baseHeight) => {

        shelf.baseHeight = baseHeight
        this.shelves.push(shelf)

        this.updateProps()
/* 
        if(shelf.isDoubleSided == true && (this.contentSides ))
        if(this.contentSides.indexOf(shelf.type) !== -1){
            placeShelf();
            
        }
        else if(this.contentSides.indexOf(null) !== -1){
            this.contentSides[this.contentSides.indexOf(null)] = shelf.type
            placeShelf();
        } */
    }
}

module.exports = Racking;