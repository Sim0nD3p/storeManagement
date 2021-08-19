const shelves = require('./containers/shelves');
const Shelf = require('./containers/shelf');
const term = require('terminal-kit').terminal


const { performance } = require('perf_hooks')
const containerData = require('./containers/containerData');
const Bac = require('./containers/bac');
const { runInThisContext } = require('vm');
const FRONT = 'FRONT';
const BACK = 'BACK'
const BASE_HEIGHT_PRIORITY_LIMIT = 1500;
const REACH_LIMIT = 2500;
const ACCESS_RATIO = 0.50

const SAMPLE_HEIGHT_SHELF = 650;

class ShelfManager{
    constructor(app){
        this.app = app;
        this.unusedShelves = shelves;
        this.shelfQte = {
            bundle: 0,
            container: 0,
            bundleUsin: 0,
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
     * @param {string} prop (length, priority)
     * @param {number} length 
     * @param {number} weight
     * @param {number} priority
     * @param {*} type
     * @param {number} qte of container to place
     * @param {string} tag (MP, ASS)
     * @returns index of the chosen shelf type
     */
    choseShelf = (prop, length, weight, priority, type, qte, tag) => {
        const logToConsole = 3

        let targetType;     //bac, bun, cus, bUs
        if(type == 'bac'){ targetType = ['mixed', 'bac', 'cus'] }
        else if(type == 'bun' || type == 'bundle'){ targetType = ['bundle', 'mixed'] }
        else if(type == 'cUs'){ targetType = ['mixed', 'cUs'] }
        //else { targetType = ['mixed'] }
        
        let options = this.app.store.racking.map((rack, index) => {
            let totalPriority = 0;
            let nbPriority = 0;
            rack.shelves.map((shelf, index) => { if(isNaN(shelf.priority) == false){ totalPriority += shelf.priority; nbPriority++ } })
            totalPriority = isNaN(totalPriority / nbPriority) ? 0 : totalPriority / nbPriority
            return [rack.name, totalPriority, rack.height, rack.length, rack.contentType, rack.tag]
        })
        options = options.filter((a) => a[5] == tag)

        if (priority) {
            if (priority !== 0) {
                options = options.sort((a, b) => { return Math.abs(a[1] - priority) / a[1] - Math.abs(b[1] - priority) / b[1] })
            } else { options = options.sort((a, b) => { return a[1] - b[1] }) }
        } else { options = options.sort((a, b) => { return a[1] - b[1] }) }

        logToConsole >= 1 ? term.cyan(`chosing shelf based on ${prop}, targetType is [ ^y${targetType}^:^c ]\n`) : null

        logToConsole >= 2 ? term.cyan(`options are: \n`) : null
        logToConsole >= 2 ? options.map(o => term.column(5).cyan(`[${o[0]}, ${o[1]}, ${o[2]}, ${o[3]}, ${o[4]}, ${o[5]}]\n`)) : null


        if(prop == 'length'){

            //returns spare length when shelfLength > objectLength
            //[spareLength, index, lengthNb]
            let potential = this.unusedShelves.map((shelf, index) => {
                if(qte > 8 && shelf.length > 3 * 1.10 * length && shelf.qte > 0){ return [shelf.length - 3 * length, index, 3] }
                if(qte > 4 && shelf.length > 2 * 1.10 * length && shelf.qte > 0){ return [shelf.length - 2 * length, index, 2] }
                else if(shelf.length > length && shelf.qte > 0){ return [shelf.length - length, index, 2, 1] }
                else return null
            })
            
            potential = potential.filter(a => a !== null);                  //filters non compatible shelves
            potential = potential.sort((a, b) => b[2] - a[2]);              //sort lengthNb
            potential = potential.filter((a) => a !== potential[0][2]);     //filters lengthNb to only keep the highest
            potential = potential.sort((a, b) => a[1] - b[1])                  //filter spare length to have the most tight shelf in index 0
            return potential[0][1]; //the most tight shelf
        }
        else if(prop == `priority`){
            //build options => arrayOf[rack.name, totalPriority, rack.height, rack.length, rack.type]

            //sorts options shelf.priority vs options.priority



            
            
            let potential = []
            let targetIndex = -1
            options:    //on choisi parmi les options [rack.name, totalPriority, rack.height, rack.length]
            for(let i = 0; i < options.length; i++){    //options = [rack.name, totalPriority, rack.heigt, rack.length, rack.type]
                for(let j = 0; j < this.unusedShelves.length; j++){
                    if(this.unusedShelves[j].length == options[i][3] && options[i][5] == tag && this.unusedShelves[j].qte > 0){    //length, qte, type(removed)
                        potential.push([options[i], j])
                    }
                }
            }
            
            if(potential.length == 0){
                //need new racking
                let unusedShelves = [...this.unusedShelves]
                unusedShelves = unusedShelves.sort((a, b) => { return b.qte - a.qte })
                targetIndex = this.unusedShelves.findIndex((a) => a == unusedShelves[0]); //targetIndex
            }
            else {
                for(let i = 0; i < potential.length; i++){
                    //aglo to find potential good fit
                    if(Math.abs(potential[i][1] - priority) / potential[i][1] < 0.80){      //!!! creates new racking when rel diff > 0.20 !!! might want to change
                        targetIndex = potential[i][1];
                        break;
                    }
                    


                    
                }
                
                
            }
            return targetIndex
        }
        else if(prop == 'height'){
            let targetIndex = -1;
            
            const newRackOptions = () => {
                let options = this.unusedShelves.map((shelf, index) => {
                    if(this.app.store.racking.findIndex((a) => a.length == shelf.length && (a.contentType == type || a.contentType == 'mixed')) == -1){
                        return shelf
                    } else return null
                })
                options = options.filter((a) => a !== null)
                return options
            }
            options = options.filter((a) => targetType.indexOf(a[4]) !== -1)

            let results = options.map((rackingOption, index) => {
                let shelfSample = {
                    height: 600,
                    type: 'mixed'
                }
                if(this.app.store.rackManager.getRacking(rackingOption[0]).searchPlace(shelfSample, REACH_LIMIT) !== null){
                    return rackingOption
                } else return null

            })

            results = results.filter((a) => a !== null)
            results = results.sort((a, b) => a[2] - b[2])
            
            let i = 0;
            while(targetIndex == -1 && i < results.length){
                targetIndex = this.unusedShelves.findIndex((a) => a.length == results[i][3] && a.qte > 0)
                i++
            }

            if(targetIndex !== -1){                
            }
            else {
                let newRackOpt = newRackOptions()
                newRackOpt = newRackOpt.sort((a, b) => b.qte - a.qte)
                targetIndex = this.unusedShelves.findIndex((a) => a == newRackOpt[0])
                if(targetIndex == -1){
                    targetIndex = this.unusedShelves.findIndex((a) => a.length > 0)     //TO CHANGE QTE
                }
                
            }

            logToConsole >= 2 ? term.cyan(`available lengths are: `) : null
            logToConsole >= 2 ? this.unusedShelves.map(s => {s.qte > 0  ? term.yellow(`| ${s.length} |`) : null }) : null
            //logToConsole >= 1 ? term.cyan(`\nchose shelf length ${this.unusedShelves[targetIndex].length}\n`) : null
            return targetIndex
        }
    }

    //should return shelf
    createShelf(partsToPlace, tag){
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
                let shelfIndex = this.choseShelf('length', maxLengthArray.sort((a, b) => b - a)[0], null, null, 'bundle', partsToPlace[0].part.storage.length, tag)

                
                let shelfData = this.unusedShelves[shelfIndex]
                this.unusedShelves[shelfIndex].qte = this.unusedShelves[shelfIndex].qte - 1;
                let shelf = new Shelf(`bundle_${this.shelfQte.bundle}`, shelfData, 'bundle', tag)
                this.shelfQte.bundle++
                finalShelf = shelf


                break;
            }
            case 'bac': {



                let shelfIndex = this.choseShelf('height', null, null, totalPriority, 'bac', null, tag)
                let shelf = new Shelf(`shelf_${this.shelfQte.container}`, this.unusedShelves[shelfIndex], 'bac', tag)
                this.unusedShelves[shelfIndex].qte = this.unusedShelves[shelfIndex].qte - 1
                this.shelfQte.container++;
                let content = totalContainerArray[totalContainerArray.length - 1];
                let bacParPiece = (content.bac1 + content.bac2) / totalContainerArray.length
                //console.log(`${bacParPiece} BAC PAR PIECE EN MOYENNE`)

                finalShelf = shelf

                //shelf.getShelf()

                break;
            }
            case 'bUs': {
                 //let shelf = new Shelf(`shelf_${this.app.store.shelves.length + 1}`, this.unusedShelves[0], 'bundle');
                 let maxLengthArray = partsToPlace.map((part, index) => {
                    let lengthArray = part.part.storage.map((container, index) => container.length).sort((a, b) => b - a)
                    return lengthArray[0]
                })
                let shelfIndex = this.choseShelf('length', maxLengthArray.sort((a, b) => b - a)[0], null, null, 'bUs', partsToPlace[0].part.storage.length, tag)

                
                let shelfData = this.unusedShelves[shelfIndex]
                //this.unusedShelves[shelfIndex].qte = this.unusedShelves[shelfIndex].qte - 1;
                let shelf = new Shelf(`bundleUsin_${this.shelfQte.bundleUsin}`, shelfData, 'bUs', tag)
                this.shelfQte.bundleUsin++
                finalShelf = shelf


                break;


                break;
            }
            case 'cus': {
                //check priority for placement options CHOSESHELF
                let shelfIndex = this.choseShelf('height', null, null, totalPriority, 'bac', null, tag)
                let shelf = new Shelf(`shelf_${this.shelfQte.container}`, this.unusedShelves[shelfIndex], 'bac', null, tag)
                this.unusedShelves[shelfIndex].qte = this.unusedShelves[shelfIndex].qte - 1
                this.shelfQte.container++;
                let content = totalContainerArray[totalContainerArray.length - 1];
                let bacParPiece = (content.bac1 + content.bac2) / totalContainerArray.length
                //console.log(`${bacParPiece} BAC PAR PIECE EN MOYENNE`)

                finalShelf = shelf
                for(let i = 0; i < partsToPlace.length; i++){
                    //console.log(partsToPlace[i].part)
                    //partsToPlace = [this.app.store.getItemFromPFEP('SEP3411')]
                    //let place = shelf.searchPlace(partsToPlace[i].part, FRONT);
                    //console.log('place')
                    //console.log(place)


                }

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
        //term.column(5);
        term.cyan(`\ncreated ${finalShelf.name}, length ${finalShelf.length}\n`)
        return finalShelf
    }
   

    /**
     * Finds the optimal shelf among potentialShelves
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
            //[accessPoint, ecart, height]
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
                if(array[i] !== null){                   //[shelf, accessPoint, ecart, spareHeight]
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
     * Meme type de contenu (bundle, bac, bundleUsine || mixed)
     * Meme tag
     * placement via searchPlace (no BACK for bundle per conception)
     * @param {*} part 
     * @param {*} categorisation 
     * @returns [shelf, front, back]
     */
    findPotentialShelf = (part, categorisation, tag) => {
        let targetType = [categorisation.type.substring(0, 3)]
        if(targetType == 'bun'){ targetType = ['bun'] }
        else if(targetType == 'bac' || targetType == 'cus'){ targetType = ['bac', 'cus'] }
        else if(targetType == 'bUs'){ targetType = ['bUs']}

        return this.app.store.shelves.map((shelf, index) => {
            if (targetType.indexOf(shelf.type.substring(0, 3)) !== -1 && shelf.tag == tag) {
                let placement = [shelf.searchPlace(part, FRONT) !== false ? true : false, shelf.searchPlace(part, BACK) !== false ? true : false]
                //if(part.consommation && part.consommation.mensuelleMoy >= this.app.store.medianMonthlyConsom()){ placement[1] = false }
                if (placement[0] !== false || placement[1] !== false) {
                    return [shelf, placement[0], placement[1]]
                } else return null
            } else return null
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