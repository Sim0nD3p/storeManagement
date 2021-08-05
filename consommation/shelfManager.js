const shelves = require('./containers/shelves');
const Shelf = require('./containers/shelf');
const term = require('terminal-kit').terminal


const { performance } = require('perf_hooks')
const containerData = require('./containers/containerData');
const Bac = require('./containers/bac');
const { runInThisContext } = require('vm');
const FRONT = 'FRONT';
const BACK = 'BACK'

class ShelfManager{
    constructor(app){
        this.app = app;
        this.unusedShelves = shelves;
        this.shelfQte = {
            bundle: 0,
            container: 0
        }
    }
    checkAvailability(part, shelf, returnFull){

    }
    getShelf(name){
        console.log('getShelf from shelfManager')
        let index = -1;
        for(let i = 0; i < this.app.store.shelves.length; i++){
            if(name == this.app.store.shelves[i].name){ index = i }
        }
        return this.app.store.shelves[index]
    }

    /**
     * @param {*prop} - length
     * @param {*} length 
     * @param {*} weight 
     * @returns index of the chosen shelf type
     */
    choseShelf = (prop, length, weight, priority) => {
        if(prop == 'length'){
            //returns spare length when shelfLength > objectLength
            let potential = this.unusedShelves.map((shelf, index) => {
                if (shelf.length > length && shelf.qte > 0) { return [shelf.length - length, index] }
                else return null
            })
            potential = potential.filter(a => a !== null)
            potential = potential.sort((a, b) => a[0] - b[0])
            return potential[0][1]; //the most tight shelf
        }
        else if(prop == `container`){
            let options = this.app.store.racking.map((rack, index) => {

                let priorityArray = []
                rack.shelves.map((shelf, index) => {
                    if(isNaN(shelf.priority) == false){ priorityArray.push(shelf.priority) }
                    //console.log(shelf.name, shelf.length, shelf.height, shelf.priority)
                })

                let totalPriority = 0;
                for(let i = 0; i < priorityArray.length; i++){ totalPriority += Number(priorityArray[i]) }
                totalPriority = isNaN(totalPriority / priorityArray.length) ? 0 : totalPriority / priorityArray.length
                return [rack.name, totalPriority, rack.height, rack.length]
            })

            if(priority !== 0){
                options = options.sort((a, b) => { return Math.abs(a[1] - priority)/a[1] - Math.abs(b[1] - priority)/b[1] })
            } else { options = options.sort((a, b) => { return a[1] - b[1] }) }

            
            
            let targetLength;
            let targetIndex = 0
            options:
            for(let i = 0; i < options.length; i++){
                for(let j = 0; j < this.unusedShelves.length; j++){
                    if(this.unusedShelves[j].length == options[i][3] && this.unusedShelves[j].qte > 0 && options[i][2] < 1600){
                        targetLength = this.unusedShelves[j]
                        targetIndex = j;
                        break options;
                    }
                }
            }
            return targetIndex
        }
    }

    //should return shelf
    createShelf(partsToPlace){
        term('\n----- CREATING SHELF -----\n')
        let weightArray = []; let totalWeightArray = []; let containersArray = []; let totalContainerArray = []; let finalShelf; let priorityArray = []
        for(let i = 0; i < partsToPlace.length; i++){
            //weightArray
            let weight = 0;
            for(let st = 0; st < partsToPlace[i].part.storage.length; st++){ weight += partsToPlace[i].part.storage[st].weight }
            weightArray.push(weight)
            //console.log(`weight is ${weight}`)

            //totalWeightArray
            let totalWeight = 0;
            for(let w = 0; w < weightArray.length; w++){ totalWeight += isNaN(weightArray[w]) ? 0 : weightArray[w] }
            totalWeightArray.push(totalWeight)

            containersArray.push({ [partsToPlace[i].part.storage[0].type]: partsToPlace[i].part.storage.length })

            if(partsToPlace[i].part.consommation.mensuelleMoy){ 
                priorityArray.push(partsToPlace[i].part.consommation.mensuelleMoy)
            }
            
            

            
            totalContainerArray[i] = {
                bac1: totalContainerArray[i-1] ? totalContainerArray[i-1].bac1 + (containersArray[i].bac1 ? containersArray[i].bac1 : 0) : (containersArray[i].bac1 ? containersArray[i].bac1 : 0),
                bac2: totalContainerArray[i-1] ? totalContainerArray[i-1].bac2 + (containersArray[i].bac2 ? containersArray[i].bac2 : 0) : (containersArray[i].bac2 ? containersArray[i].bac2 : 0),
                bundle: totalContainerArray[i-1] ? totalContainerArray[i-1].bundle + (containersArray[i].bundle ? containersArray[i].bundle : 0) : (containersArray[i].bundle ? containersArray[i].bundle : 0),
                palette: totalContainerArray[i-1] ? totalContainerArray[i-1].palette + (containersArray[i].palette ? containersArray[i].palette : 0) : (containersArray[i].palette ? containersArray[i].palette : 0)
            }
        }

        let totalPriority = 0
        for(let i = 0; i < priorityArray.length; i++){ totalPriority += priorityArray[i] }
        totalPriority = isNaN(totalPriority / priorityArray.length) ? 0 : totalPriority / priorityArray.length
        //console.log('weightArray')
        //console.log(weightArray)
        //console.log('totalWeightArray')
        //console.log(totalWeightArray);
        //console.log('containersArray')
        //console.log(containersArray);
        //console.log('totalContainersArray')
        //console.log(totalContainerArray);
        switch(partsToPlace[0].categorisation.type.substring(0, 3)){
            case 'bun': {
                //let shelf = new Shelf(`shelf_${this.app.store.shelves.length + 1}`, this.unusedShelves[0], 'bundle');
                let maxLengthArray = partsToPlace.map((part, index) => {
                    let lengthArray = part.part.storage.map((container, index) => container.length).sort((a, b) => b - a)
                    return lengthArray[0]
                })
                let shelfIndex = this.choseShelf('length', maxLengthArray.sort((a, b) => b - a)[0])

                
                let shelfData = this.unusedShelves[shelfIndex]
                this.unusedShelves[shelfIndex].qte = this.unusedShelves[shelfIndex].qte - 1;
                let shelf = new Shelf(`bundle_${this.shelfQte.bundle}`, shelfData, 'bundle')
                this.shelfQte.bundle++
                finalShelf = shelf


                break;
            }
            case 'bac': {


                let shelfIndex = this.choseShelf('container', null, null, totalPriority)
                let shelf = new Shelf(`shelf_${this.shelfQte.container}`, this.unusedShelves[shelfIndex], 'bac')
                this.unusedShelves[shelfIndex].qte = this.unusedShelves[shelfIndex].qte - 1
                this.shelfQte.container++;
                let content = totalContainerArray[totalContainerArray.length - 1];
                let bacParPiece = (content.bac1 + content.bac2) / totalContainerArray.length
                //console.log(`${bacParPiece} BAC PAR PIECE EN MOYENNE`)

                for(let i = 0; i < partsToPlace.length; i++){
                    //console.log(partsToPlace[i].part)
                    //partsToPlace = [this.app.store.getItemFromPFEP('SEP3411')]
                    let place = shelf.searchPlace(partsToPlace[i].part, FRONT);
                    //console.log('place')
                    //console.log(place)
                    finalShelf = shelf


                }

                //shelf.getShelf()

                break;
            }
            case 'pal': {
                let shelf = new Shelf(`shelf_${this.app.store.shelves.length + 1}`, this.unusedShelves[2], 'bundle');
                finalShelf = shelf
                break;
            }
            default: {
                break;
            }

        }
        this.app.store.shelves.push(finalShelf)
        return finalShelf
    }

    fillShelf(shelf, container){

    }
    /**
     * 
     * @param {*array} shelves - array of potential shelves 
     * @param {*object} item - item to place
     * @returns [shelf, accessPoint]
     */
    matchPartToShelf(potentialShelves, item){
        //criteres pour match item a shelf
        //doit avoir de la place
        const accessOptions = [FRONT, BACK];

        //add heightNb constraint
        let accessPoint = FRONT;
        let targetShelf = null;

        let heightNeeded = 0;
        if (item.storage.length >= 2) { heightNeeded = 2 * item.storage[0].height }
        else { heightNeeded = item.storage[0].height }

        let array = potentialShelves.map((shelf, index) => {
            if(shelf !== null){
                //which access point to chose: front if possible else back
                let placement = [shelf[1], shelf[2]];   //[FRONT, BACK] (bool)
                accessPoint = accessOptions[placement.findIndex((a) => a !== false)]
                //ecart priorite
                let ecart
                if(Number(item.consommation.mensuelleMoy) == 0){ ecart = NaN }
                else { ecart = Math.abs(Number(shelf[0].priority) - Number(item.consommation.mensuelleMoy)) / Number(shelf[0].priority) }

                let spareHeight = shelf[0].height - heightNeeded

                return [accessPoint, ecart, spareHeight]
            } else return null
        })
        //targetShelf = [shelf, accessPoint, ecart, spareHeight]
        if(isNaN(item.consommation.mensuelleMoy) == false){
            for(let i = 0; i < array.length; i++){
                if(array[i] !== null){
                    if(targetShelf == null){ targetShelf = [potentialShelves[i][0], array[i][0], array[i][1], array[i][2]] }
                        //ecart > ecart
                    if(targetShelf[2] > array[i][1]){
                        //spareHeight
                        if(targetShelf[3] > array[i][2]){
                            targetShelf = [potentialShelves[i][0], array[i][0], array[i][1], array[i][2]]
                        }
                    }
                    //spareHeight && ecart avec facteur
                    if(array[i][2] < targetShelf[3] && array[i][1] >= targetShelf[2] - 0.05){
                        targetShelf = [potentialShelves[i][0], array[i][0], array[i][1], array[i][2]]
                    }
                }
            }
        }
        else{
            for(let i = array.length; i = 0; i--){
                if(array[i] !== null){
                    if (targetShelf == null) { targetShelf = [potentialShelves[i][0], array[i][0], array[i][1], array[i][2]] }
                    //spareHeight
                    if (targetShelf[3] > array[i][2]) {
                        targetShelf = [potentialShelves[i][0], array[i][0], array[i][1], array[i][2]]
                    }   
                }
            }
        }
        
        //console.log('potentialShelf array')
        //console.log(array)
        //console.log('targetShelf')
        //console.log(targetShelf[1], targetShelf[2], targetShelf[3])
        return [targetShelf[0], targetShelf[1]]
    }
    

    /**
     * 
     * @param {*} part 
     * @param {*} categorisation 
     * @returns [shelf, front, back]
     */
    findPotentialShelf = (part, categorisation) => {
        return this.app.store.shelves.map((shelf, index) => {
            if (shelf.type.substring(0, 3) == categorisation.type.substring(0, 3)) {
                let placement = [shelf.searchPlace(part, FRONT) !== false ? true : false, shelf.searchPlace(part, BACK) !== false ? true : false]
                if (placement[0] !== false || placement[1] !== false) {
                    return [shelf, placement[0], placement[1]]
                }
                else return null
            } else { return null }
        })
    }
}


module.exports = ShelfManager;


/* 

createShelf(name, length, rating){
        let shelfData;
        for(let i = 0; i < this.unusedShelves.length; i++){
            if(this.unusedShelves[i].rating === rating && this.unusedShelves[i].length == length){
                shelfData = this.unusedShelves[i];
                this.unusedShelves[i].qte--
                break;
            }
        }
        const shelf = new Shelf(name, shelfData)
        console.log(shelf)
        return shelf
    }


        let t0 = performance.now();
        let option1 = []
        for(let i = 0; i < this.unusedShelves.length; i++){
            let name = 'shelve_' + this.unusedShelves[i].rating + '_' + i;
            let shelf = []
            for(let w = 0; w < 1067; w++){
                shelf.push(new Array(this.unusedShelves[i].length).fill(0))
            }
            option1.push(shelf)

        }
        //console.log(option1)
        option1.map((shelf, index) => {
            console.log(index)
            shelf.map((width, index) => {
                width[0] = new Bac(containerData[0], `name_${width}_0`, part)
                width[1] = new Bac(containerData[0], `name_${width}_1`, part)

                /* width.map((length, index) => {
                    length = new Bac(containerData[0], `name_${width}_${length}`, part)
                }) *//*
            })
        })
        let t1 = performance.now()
        console.log(`the operation was performed in ${t1-t0} ms`) */