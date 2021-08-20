const term = require("terminal-kit").terminal;

const REACH_LIMIT = 3500;
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
        this.tag = tag; ////assemblage ou MP
        this.type;  
        this.shelves = []
        this.contentType = type;    //mixed, bac, bundle
        //this.priorityZone = [0, 1600]
        //this.space = new Array(10000).fill(null)
        this.contentSides = [null, null]
        this.height = 0
        this.priority;
        this.class;
    }

    getTotalHeight = () => {
        let s = this.shelves[this.shelves.length - 1]
        return s.baseHeight + s.height
    }
    checkContentSides = (shelf) => {
        let possForDouble = [['bac', 'bac'], ['bac', null], [null, 'bac'], [null, null]]
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
            if(s[i+1] && s[i].baseHeight + s[i].height + shelf.height + 2 * GAP <= s[i+1].baseHeight){
                return s[i].baseHeight + s[i].height + GAP
            }
            else if(!s[i+1]){
                return s[i].baseHeight + s[i].height + GAP
            }
        }

        

        if(this.checkContentSides(shelf) == true){
            if (this.shelves.length > 0) {
                let i = 0;
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
            } else place = 0
            
        } else return false



        if(place == undefined){ place = false }

        return place

    }

    checkAccessPoints = () => {
        if(this.shelves.filter((a) => a.isDoubleSided == true).length > 0) return true
        else return false
    }
    getContentSides = (shelf) => {
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
    addShelf = (shelf, baseHeight) => {

        shelf.baseHeight = baseHeight
        this.shelves.push(shelf)
        this.height = this.getTotalHeight();
        this.accessPoints = this.checkAccessPoints()

        this.getContentSides(shelf)
        const placeShelf = (shelf, baseHeight) => {
        }
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