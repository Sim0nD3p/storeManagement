const term = require('terminal-kit').terminal;
const containerObject = require('./containerObject')
const Bac = require('./bac');
const Bundle = require('./bundle');
const Palette = require('./palette')
const CustomContainer = require('./customContainer');
const bUs = require('./bUs')
const VERTICAL = 'VERTICAL';
const HORIZONTAL = 'HORIZONTAL';
const FRONT = 'FRONT';
const BACK = 'BACK';

function clearScreen() {
    process.stdout.write('\u001b[3J\u001b[1J');
    term.clear();
    console.clear();
}



class Shelf{
    constructor(name, shelfData, type, tag){
        this.name = name;
        this.type = type; //what is type? bac, bundle, bus?
        this.tag = tag;
        this.address; //range in numbers
        this.priority;
        this.isDoubleSided = false;
        this.width = 107; //mm
        this.capacity = shelfData ? shelfData.rating / 2.2046 : undefined;  //1 kg == 2.2046 lbs
        this.length = shelfData ? shelfData.length : undefined;
        this.weight = 0; //masse kg
        this.accessRatio = 0; //FRONT/(FRONT + BACK)
        
        this.content = []
        this.height = 0
        this.baseHeight = undefined

        this.totalConsom = 0;
        this.space = this.initShelf(shelfData)

    }

    test = () => {
        console.log('shelf method accessible')
    }


    searchPlace = (item, accessSide, logToConsole) => {
        if(!logToConsole){ logToConsole = 1 }

        let result;
        let generalType = item.storage[0].type.substring(0, 3);
        let containerCount = item.storage.length;
        let containersPlacement;
        let orientationArray = [];
        let totalItemWeight = 0;
        for(let i = 0; i < item.storage.length; i++){ isNaN(item.storage[i].weight) ? null : totalItemWeight += item.storage[i].weight }
        
        if(this.weight + totalItemWeight <= this.capacity || isNaN(this.totalItemWeight)){
            if (generalType == 'bac') {
                for (let i = 0; i < (containerCount / 2) + 1; i++) {
                    let option = [];
                    for (let j = 0; j < (containerCount / 2); j++) {
                        if (j < i) { option.push(HORIZONTAL) }
                        else option.push(VERTICAL)
                    }
                    orientationArray.push(option)
                }
                result = this.searchPlaceForBac(item, orientationArray, accessSide, logToConsole)
            }
            else if (generalType == 'bun' || generalType == 'pal') {
                let option = []
                for (let i = 0; i < containerCount; i++) { option.push(HORIZONTAL) }
                orientationArray.push(option);
                result = this.searchPlaceForBundle(item, logToConsole)
            }
            else if (generalType == 'cus') {
                //orientationArray = [[VERTICAL]];
                orientationArray = [[VERTICAL], [HORIZONTAL]];
                result = this.searchPlaceForBac(item, orientationArray, accessSide, logToConsole)
            }
            else if(generalType == 'bUs'){
                orientationArray = [[VERTICAL], [HORIZONTAL]];
                result = this.searchPlaceForBUS(item, orientationArray, logToConsole);
            }
        }
        else {
            console.log('weight constraint')
            return false

        }
        return result

    }

    searchPlaceForBUS = (item, orientationArray, logToConsole) => {
        const space = () => {
            let array = [];
            this.space.forEach(length => {
                let w = 0;
                while(length[w] == null){
                    w++;
                    if(w >= this.width){ break }
                }
                array.push(w)
            })
            return array
        }
        const makeBlocs = (spaceArray) => {
            let blocs = [];
            let currentBloc = [spaceArray[0] * 10, 10];   //[depth, width]
            for(let i = 1; i < spaceArray.length; i++){
                if(spaceArray[i]*10 == currentBloc[0]){
                    currentBloc[1] += 10
                }
                else {
                    blocs.push(currentBloc);
                    currentBloc = [spaceArray[i] * 10, 10]
                }
            }
            blocs.push(currentBloc)
            return blocs

        }
        const getContainerDimensions = (container) => {
            let contDimensions = [container.width, container.length]
            //sort so that if it can fit in other orientation it does it
            //maybe add arg/props besauce all bUs will take all the shelf' depth
            contDimensions = contDimensions.sort((a, b) => b - a);  //sens de la largeur
            return contDimensions
        }

        const findPosition = (blocs, containerDimensions) => {
            let positions = blocs.map((bloc, index) => {
                if(bloc[1] > containerDimensions[0] && bloc[0] > containerDimensions[1]){
                    let position = 0;
                    for(let i = 0; i < index; i++){
                        position += blocs[i][1]
                    }
                    return position
                } else return null
            })
            console.log(positions)
            positions = positions.filter((a) => a !== null)
            return positions
        }

        const getCoord = (positionsArray, containerDimensions) => {
            let dimensions = {
                front: Math.ceil(containerDimensions[0] / 10),
                width: Math.ceil(containerDimensions[1] / 10)
            }
            let position = {
                front: Math.ceil(positionsArray[0] / 10),
                width: 0
            }

            return [[position, dimensions, 1]]

        }


        //---------- END OF FUNCTION DECLARATION ----------
        let spaceArray = space();
        let blocs = makeBlocs(spaceArray);
        let containerDimensions = getContainerDimensions(item.storage[0])
        let position = findPosition(blocs, containerDimensions)
        if(position.length > 0){
            let coord = getCoord(position, containerDimensions)
            return coord
        }
        else return false
    }
    //returns: position, containersPlacement
    searchPlaceForBundle = (item, logToConsole) =>{
        
        /**
         * 
         * @returns spaceArray
         */
        const space = () => {
            let array = [];
            this.space.map((length, index) => {
                let w = 0
                while (length[w] == null){
                    w++
                    if(w >= this.width){ break }
                }
                array.push(w)
            })
            return array
        }

        const genBlocs = (spaceArray) => {
            let blocs = [];
            let currentBloc = []; //width: distance
            for (let i = 0; i < spaceArray.length; i++) {
                if (i === 0) { currentBloc = [spaceArray[i] * 10, 10] }
                if (i > 0) {
                    if (spaceArray[i] == spaceArray[i - 1]) { currentBloc = [spaceArray[i] * 10, currentBloc[1] + 10] }
                    else {
                        blocs.push(currentBloc)
                        currentBloc = [spaceArray[i] * 10, 10]
                    }
                }
            }
            blocs.push(currentBloc)
            return blocs
        }


        /**
         * 
         * @param {array} blocs 
         * @returns array of options [nbDepth, nbHeight, nbLength]
         */
        const genOptions = (blocs) => {
            let maxHeight = item.storage[0].height * 2;
            let options = blocs.map((bloc, index) => {
                let nbDepth = Math.floor(bloc[0] / item.storage[0].width);
                let nbLength = Math.floor(bloc[1] / item.storage[0].length);
                let nbHeight = Math.floor(maxHeight / item.storage[0].height);
                return [nbDepth, nbHeight, nbLength]
            })
            return options
        }
        /**
         * 
         * @param {*array} options 
         * @returns [[depthNb, heightNb, lengthNb], blocIndex]
         */
        const findBestOption = (options, blocs) => {
            let containerCount = item.storage.length;
            options = options.map((option, index) => {
                if(option[0] * option[1] * option[2] >= containerCount){
                    return [option, index]
                }
                else return null
            })
            //waste = [[wasteWidth, wasteLength]]
            let wastedSpace = options.map((option, index) => {
                let waste = [];
                if(option !== null){
                    if(blocs[index][0] > option[index][0] * item.storage[0].width){
                        waste[0] = blocs[index][0] - (option[index][0] * item.storage[0].width)
                    } else waste[0] = -1
                    if(blocs[index][1] > option[index][2] * item.storage[0].length){
                        waste[1] = blocs[index][1] - (option[index][2] * item.storage[0].length)
                    } else waste[1] = -1
                    return waste
                } else return null
            })

            options.map((option, index) => {
                if(option !== null && wastedSpace[index].indexOf(-1) == -1){
                    return option
                } else return null
            })
            let minWasteLength = [9999, 0]
            let minWasteWidth = [9999, 0]
            for(let i = 0; i < options.length; i++){
                if(wastedSpace[i] !== null){
                    if(wastedSpace[i][0] <= minWasteWidth[0]){
                        if(wastedSpace[i][1] <= minWasteLength[0]){
                            minWasteLength = [wastedSpace[i][1], i]
                            minWasteWidth = [wastedSpace[i][0], i]
                        }
                    }
                }

            }
            let index = 0;
            if(minWasteLength[1] == minWasteWidth[1]){ index = minWasteLength[1] }
            if(options.findIndex((a) => a !== null) == -1){ return false }
            else return options[index]

        }

        const getCoord = (bestOption, blocs) => {
            let containerCount = item.storage.length;
            let coordArray = []
            let bundle = item.storage[0];
            let offset = 0;     //blocIndex
            for(let i = 0; i < bestOption[1]; i++){ offset += blocs[i][1] }
            for(let i = 0; i < bestOption[0][2]; i++){
                for(let j = 0; j < bestOption[0][0]; j++){
                    let height;
                    if(containerCount >= bestOption[0][1]){ height = bestOption[0][1] }
                    else height = containerCount

                    //doesnt get to the loop
                    let position = {
                        front: Math.ceil((0 + bundle.length * i) / 10),
                        width: Math.ceil((0 + bundle.width * j) / 10),
                    }
                    let dimensions = {
                        front: Math.ceil(bundle.length / 10),
                        width: Math.ceil(bundle.width / 10)
                    }
                    coordArray.push([position, dimensions, height])
                }
            }
            return coordArray
        }


        //----------- END OF FUNCTION DECLARATION --------
        if(item){
            let spaceArray = space()
            let blocs = genBlocs(spaceArray)
            let options = genOptions(blocs)
            let bestOption = findBestOption(options, blocs);
            if(bestOption == false){
                return false
            }
            else {
                let coordArray = getCoord(bestOption, blocs);
                if(coordArray.length > item.storage.length){
                    coordArray = coordArray.slice(0, item.storage.length);  //QUICK FIX (algo was returning best option for filling up the shelf with containers so it was possible to have more placement than containers)
                }
                return coordArray

            }
        }
        return false
    }
    /**
     * 
     * @param {object} item 
     * @param {string} accessSide  - front | back | both
     * @param {array} orientationOptions 
     * @returns 
     */
    searchPlaceForBac(item, orientationOptions, accessSide, logToConsole){
        //On calcule l'espace necéssaire en fonction de l'utilisation des bac seulement. Les boites fournisseur qui seront utilisées sont plus petites que les bac.

        //storage might be multiple things
        //palette, bundle, bac, multiple bac
        

        

        
        //BAC
        //might be multiple bac
        //space token by multiple bac
        // front space occupied by bac

        let generalType = item.storage[0].type.substring(0, 3);
        let containerCount = item.storage.length;
        let containersPlacement;
        let shouldLog = false

        const isFrontFull = () => {
            let array = this.space.map((length, index) => length[0])
            if(array.indexOf(null) == -1){ return true }
            else return false
        }


        
        //getting options for containers placement/dimensiosn as a bloc
        const genOptions = () => {
            let orientationArray = [];
            if(generalType == 'bac'){
                for(let i = 0; i < (containerCount / 2) + 1; i++){
                    let option = [];
                    for(let j = 0; j < (containerCount / 2); j++){
                        if(j < i){ option.push(HORIZONTAL) }
                        else option.push(VERTICAL)
                    }
                    orientationArray.push(option)
                }
            }
            else if(generalType == 'bun' || generalType == 'pal'){
                let option = []
                for(let i = 0; i < containerCount; i++){ option.push(HORIZONTAL) }
                orientationArray.push(option);
            }
            return orientationArray
        }

        /**
         * Generate spaceArray, array of free space from the edge of the shelf to the other edge or first container
         * @param {*bool} accessFromFront 
         * @returns spaceArray
         */
        const space = (accessFromFront) => {
            let array = [];
            this.space.map((length, index) => {
                let w = accessFromFront ? 0 : this.width
                while (length[w] == null){
                    if(accessFromFront == true){ w++ } else { w = w-1 }
                    if(w >= this.width || w < 0){ break }
                }
                if(accessFromFront == true){ array.push(w) }
                else{ array.push(this.width - w) }
            })
            return array
        }


        /**
         * Makes blocs that are easier to compare with size of the element to place, simplifies code
         * @param {*array} spaceArray 
         * @returns array of blocs format [ [width, length] ]
         */
        const makeBlocs = (spaceArray) => {
            let blocsArray = [];
            let currentBloc = [spaceArray[0] * 10, 10]; //on defini currentBloc qui nous sert de bloc de comparaison (facteur de 10 pour cm -> mm)
            for(let i = 0; i < spaceArray.length; i++){     //loop spaceArray(array de distance disponnible a partir du front)
                if(i > 0){
                    if(spaceArray[i] == spaceArray[i-1]){ currentBloc = [spaceArray[i] * 10, currentBloc[1] + 10] } //on compare avec l'adresse precedente (front)
                    else {        
                        blocsArray.push(currentBloc)                                                                //si les 2 adresses n'ont pas la meme distance, on cree un autre bloc
                        if(currentBloc[0] !== 0){
                        }                                                                                  //on ajuste la taille du currentBloc
                        currentBloc = [spaceArray[i] * 10, 10]                                                      //*possible amelioration -> complexification du code
                    }
                }
            }
            blocsArray.push(currentBloc)
            return blocsArray
        }
        /**
         * 
         * @param {array} orientationOptions 
         * @param {array} blocs 
         * @param {object} item 
         * @returns columns options for the placement of the containers nedded for the part to place
         */
        const initialColumnOptions = (orientationOptions, blocs, item) => {
            logToConsole >= 3 ? console.log('item storage') : null
            logToConsole >= 3 ? console.log(item.storage[0]) : null
            logToConsole >= 3 ? console.log('orientation options') : null;
            logToConsole >= 3 ? console.log(orientationOptions) : null;



            let columns = [];   //col: column, arrangement dans le sens width (array)
            for(let i = 0; i < blocs.length; i++){
                if(blocs[i][0] !== 0){
                    for(let j = 0; j < orientationOptions.length; j++){     //might/should be optimized
                        let col = [[]];                             //col (array) = [[depthTakenByContainer, frontTakenByContainer]]
                        containers:
                        for(let u = 0; u < containerCount; u++){    //containers loop
                            if(col[col.length - 1].length == 0){
                                if(orientationOptions[j][u] == VERTICAL){
                                    if(blocs[i][0] >= item.storage[u].length){
                                        col[col.length - 1] = [[item.storage[u].length, item.storage[u].width]]
                                    }
                                    if(blocs[i][0] >= 0.90 * item.storage[u].length){
                                        col[col.length - 1] = [[item.storage[u].length, item.storage[u].width]]
                                    }
                                    else break containers
                                }
                                else if(orientationOptions[j][u] == HORIZONTAL){
                                    if(blocs[i][0] >= item.storage[u].width){
                                        col[col.length - 1] = [[item.storage[u].width, item.storage[u].length]]
                                    }
                                    else if(blocs[i][0] >= 0.90 * item.storage[u].width){
                                        col[col.length - 1] = [[item.storage[u].width, item.storage[u].length]]
                                    }
                                    else break containers
                                }
                            }
                            else if(col[col.length - 1].length > 0){
                                let totalWidth = 0;
                                col[col.length - 1].map((container, index) => {
                                    totalWidth += container[0];
                                })
                                if(orientationOptions[j][u] == VERTICAL){
                                    if(blocs[i][0] >= totalWidth + item.storage[u].length){
                                        col[col.length - 1].push([item.storage[u].length, item.storage[u].width])
                                    }
                                    else if(blocs[i][0] >= totalWidth + 0.90 * item.storage[u].length){
                                        col[col.length - 1].push([item.storage[u].length, item.storage[u].width]);
                                        //col.push([])      removed 2021-08-10 pm
                                    }
                                    else{
                                        col.push([[item.storage[u].length, item.storage[u].width]])
                                    }
                                }
                                else if(orientationOptions[j][u] == HORIZONTAL){
                                    if(blocs[i][0] >= totalWidth + item.storage[u].width){
                                        col[col.length - 1].push([item.storage[u].width, item.storage[u].length])
                                    }
                                    else if(blocs[i][0] >= totalWidth + 0.90 * item.storage[u].width){
                                        col[col.length - 1].push([item.storage[u].width, item.storage[u].length])
                                        //col.push([])      removed 2021-08-10 pm
                                    }
                                    else{
                                        col.push([[item.storage[u].width, item.storage[u].length]])
                                    }
                                }
                            }
                        }
                        columns.push(col)
                    }
                }
            }
            return columns
        }
        /**
         * Minimize column options, minimize number of columns(front space taken by part)
         * @param {array} columns - Array of columns possible ( col => [depthTaken, frontTaken] )
         * @returns array of columns with the minimum column possible
         */
        const genFinalCol = (columns) => {
            //console.log('columns')
            //columns.map(col => console.log(col))    //why are some columns empty???


            let nbCol = Infinity;
            let colOptions = columns.map((column, index) => {
                if(column[0].length > 0){           //if the option is not empty
                    if(column.length < nbCol){ nbCol = column.length }  //minimizing nbCol 
                    return [index, column.length]       //returns number of column in the option
                }
                else return [index, null]
            })

            //console.log('colOptions')
            //console.log(colOptions)
    
            let array = []
            for(let i = 0; i < columns.length; i++){
                if(colOptions[i][1] == nbCol){
                    array.push(columns[i])
                }
            }
            for(let i = 0; i < array.length; i++){
                for(let j = 0; j < array[i].length; j++){
                    array[i][j] = array[i][j].sort(function(a, b){ return a[1] - b[1] })
                }
            }
            
            return array
        }
        //let finalCol = genFinalCol(columns)

        
        /**
         * 
         * @param {array} finalCol - minimized array columns possibilities
         * @returns [bestOption (array), width, depth]
         */
        const getBestOption = (finalCol) => { 
            //console.log('finalCol')
            //finalCol.map((col, index) => console.log(col))         
            let width; let bestOption;


            //Could be better to allow odd number of container to be placed across column like the exemple below
            /*
                |---------------|
                |               |
                |---------------|
                |       |       |
                |       |       |
                |-------|-------|       
            */



            //check for overlap when bac have 2 orientation in the same column (.old)
            //conflictedIndex => arrayOf(bool) => 
            let conflictIndex = finalCol.map((opt, index) => {
                //iterates options^^
                let conflictedCol = []  // {bool} - false if no conflict(all the containers take the same front space in the column), checks if containers in a column are all in the same orientation
                logToConsole >= 3 ? console.log('opt') : null 
                logToConsole >= 3 ? console.log(opt) : null 
                for (let col = 0; col < opt.length; col++) {    //columns
                    let containerWidth;
                    for (let container = 0; container < opt[col].length; container++) {     //containers
                        //if (container === 0) { containerWidth = opt[col][container][1]; conflictedCol[col] = false }    //initial width for comparaison
                        if (container === 0) { containerWidth = opt[col][container][1]; }    //initial width for comparaison
                        else {
                            if (opt[col][container][1] == containerWidth) { conflictedCol[col] = false }    //if next container takes the same front space, conflict = false
                            else conflictedCol[col] = true      //true: one of the container in the column takes more front space
                        }
                    }
                }


                logToConsole >= 3 ? console.log('conflictedCol') : null
                logToConsole >= 3 ? console.log(conflictedCol) : null
                if(conflictedCol.indexOf(true) == -1){  //if all the containers take the same front space 
                    return false
                }
                else return true    //if some container takes more front space
    
            })
            logToConsole >= 3 ? console.log('conflictIndex') : null
            logToConsole >= 3 ? console.log(conflictIndex) : null
            
            //get width of bac group
            if(conflictIndex.indexOf(false) !== -1){
                let widthOptions = []
                //loop dans les differentes options
                for(let i = 0; i < conflictIndex.length; i++){
                    if(conflictIndex[i] === false){
                        let totalWidth = 0;                         //finalCol and conflictIndex have the same index
                        finalCol[i].map((col, index) => { totalWidth += col[0][1] })
                        widthOptions[i] = totalWidth;
                    }
                    else widthOptions[i] = null
                }
                //trouve la meileure option
                for(let i = 0; i < widthOptions.length; i++){
                    if(widthOptions[i] !== null){
                        if(bestOption == undefined){
                            width = widthOptions[i]
                            bestOption = finalCol[i]
                        }
                        else if(widthOptions[i] < width){
                            width = widthOptions[i]
                            bestOption = finalCol[i]
                        }
                    }
                }
                let colDepth = bestOption.map((col, index) => {
                    let length = 0;
                    for(let i = 0; i < col.length; i++){ length += col[i][0] }
                    return length
                })
                colDepth = colDepth.sort(function(a, b){ return a - b })
                return [bestOption, colDepth[0], width] 
            } else{
                //console.log('CONFLICT WITH BAC ORIENTATION');
                return 'PROBLEM'

            } 
        }
        
        
        /**
         * Finds the best spot to minimize space left in the bloc after placing the part
         * @param {array} blocs - array of blocs (blocs of free space on the shelf)
         * @param {array} optionSpecs - [bestOption (array), width, front] 
         * @returns [bloc, position (offset length)]
         */
        const optimizeBloc = (blocs, optionSpecs) => {
            
            let freeSpace = blocs.map((bloc, index) => {
                if(bloc[0] == 0){ return null }
                else{
                    let freeSpaceCandidate = [ bloc[0] - optionSpecs[1], bloc[1] - optionSpecs[2]]
                    if(freeSpaceCandidate[0] >= 0 && freeSpaceCandidate[1] >= 0){ return freeSpaceCandidate }
                    else return null
                }
            })
            
            let index = freeSpace.findIndex((element) => element !== null)
            if(index !== -1){
                //length et index du meilleur bloc dans freeSpace
                let bestLength = [{ lengthLeft: freeSpace[index][1], index: index }]
                for(let i = 0; i < freeSpace.length; i++){
                    if(freeSpace[i] !== null){
                        if(freeSpace[i][1] > bestLength[0].length){ bestLength = [{ lengthLeft: freeSpace[i][1], index: i }] }
                        else if(freeSpace[i][1] == bestLength[0].length){ bestLength.push({ lengthLeft: freeSpace[i][1], index: i }) }
                    }
                }

                let offset = 0;
                for(let i = 0; i < bestLength[0].index; i++){ offset += blocs[i][1] }

                return [blocs[bestLength[0].index], offset]
            }
            else{
                //no place - freeSpace is all null
                return false
            }
        }

        

        /**
         * 
         * @param {array} containersPlacement - array of [width, length] of the container in width, length referential of the shelf 
         * @param {number} position - offset in the axis of the length of the shelf
         * @param {FRONT | BACK} accessPoint - access point front | back
         * @returns {array <object>} array of placement object for each container
         */
        const getPositionCoord = (containersPlacement, blocSpecs, accessPoint) => {
            let initialLat; let array = [];

            if(accessPoint == FRONT){ initialLat = 0 }
            else if(accessPoint == BACK){ initialLat = (this.width - 1) * 10 }
            
            let long = [blocSpecs[1]];  //front offset
            let lat = [initialLat];  //width offset
            containersPlacement.map((column, index) => {
                let columnInstructions = column.map((container, index) => {
                    if(accessPoint == BACK && index == 0){ lat = [(this.width - 1) * 10 - container[0]] }
                    let dimensions = {
                        front: Math.ceil(container[1] / 10),
                        width: Math.ceil(container[0] / 10)
                    }
                    let position = {
                        front: Math.ceil(long[long.length - 1] / 10),
                        width: Math.ceil(lat[lat.length - 1] / 10)
                    }
                    if(blocSpecs[0][0] >= dimensions.width && blocSpecs[0][1] >= dimensions.front){
                        let height;     //height - number of container stacked
                        if(containerCount >= 2){ height = 2; containerCount -= 2}
                        else { height = 1; containerCount-- }
    
                        //adjustement de la position dans l'axe width
                        if(accessPoint == BACK){ lat.push(Math.ceil(lat[lat.length - 1]) - Math.ceil(container[0] / 1)) }
                        else { lat.push(Math.ceil(lat[lat.length - 1]) + Math.ceil(container[0] / 1)) }
    
                        //ajustement de la position dans l'axe length
                        if (index == column.length - 1) {
                            lat.push(initialLat)
                            long.push(long[long.length - 1] + Math.ceil(container[1] / 1))
                        }
                        return [position, dimensions, height]

                    } else {
                        return null
                    }
                })
                array = array.concat(columnInstructions);
            })
            return array

        }


        //--------------------- END OF FUNCTIONS DECLARATIONS ----------------------


        if(accessSide == FRONT){
            let spaceArray = space(true);

            let blocs = makeBlocs(spaceArray);
            let columns = initialColumnOptions(orientationOptions, blocs, item);
            let finalCol = genFinalCol(columns);
            let optionSpecs = getBestOption(finalCol);
            let bestBloc = optimizeBloc(blocs, optionSpecs)
            logToConsole >= 3 ? console.log(`spaceArray:`) : null
            logToConsole >= 3 ? console.log(spaceArray) : null
            logToConsole >= 3 ? console.log(`blocs`) : null
            logToConsole >= 3 ? console.log(blocs) : null
            logToConsole >= 3 ? console.log('columns') : null
            logToConsole >= 3 ? console.log(columns) : null
            logToConsole >= 3 ? console.log('finalCol') : null
            logToConsole >= 3 ? console.log(finalCol) : null
            logToConsole >= 3 ? console.log('optionSpecs') : null
            logToConsole >= 3 ? console.log(optionSpecs) : null
            logToConsole >= 3 ? console.log(optionSpecs[0]) : null
            logToConsole >= 3 ? console.log('bestBloc') : null
            logToConsole >= 3 ? console.log(bestBloc) : null
            if(bestBloc == false){ return false }
            else{
                let data = getPositionCoord(optionSpecs[0], bestBloc, accessSide)
                logToConsole >= 3 ? console.log(data) : null
                logToConsole >= 3 ? console.log('return data') : null
                return data
            }
        }
        else if(accessSide == BACK){
            let spaceArray = space(false);
            let blocs = makeBlocs(spaceArray);
            let columns = initialColumnOptions(orientationOptions, blocs, item);
            let finalCol = genFinalCol(columns);
            let optionSpecs = getBestOption(finalCol);
            let bestBloc = optimizeBloc(blocs, optionSpecs)
            logToConsole >= 3 ? console.log(`spaceArray:`) : null
            logToConsole >= 3 ? console.log(spaceArray) : null
            logToConsole >= 3 ? console.log(`blocs`) : null
            logToConsole >= 3 ? console.log(blocs) : null
            logToConsole >= 3 ? console.log('columns') : null
            logToConsole >= 3 ? console.log(columns) : null
            logToConsole >= 3 ? console.log('finalCol') : null
            logToConsole >= 3 ? console.log(finalCol) : null
            logToConsole >= 3 ? console.log('optionSpecs') : null
            logToConsole >= 3 ? console.log(optionSpecs) : null
            logToConsole >= 3 ? console.log('bestBloc') : null
            logToConsole >= 3 ? console.log(bestBloc) : null
            if(bestBloc == false){ return false }
            else{
                let data = getPositionCoord(optionSpecs[0], bestBloc, accessSide)
                logToConsole >= 3 ? console.log(data) : null
                logToConsole >= 3 ? console.log('return data') : null
                return data
            }

        }
    }
    getShelf = (width, height) => {
        width = width ? width : term.width
        height = height ? height : term.height
        let paddingWidth = (term.width - width) / 2;
        let paddingHeight = (term.height - height) / 2;
        //ratios => real/screen .. real*screen/real = screen => screen = real/ratio
        let ratioL = (this.space.length / (width));
        let ratioW = (this.width / (height));

        for(let i = paddingWidth; i < term.width - paddingWidth; i++){
            term.moveTo(i, paddingHeight); term('-')
            term.moveTo(i, term.height - paddingHeight); term('-')
        }
        for(let i = paddingHeight; i < term.height - paddingHeight; i++){
            term.moveTo(paddingWidth, i); term('|')
            term.moveTo(term.width - paddingWidth, i); term('|')
        }

        let shelfContent = [];
        

    
        let data;
       this.content.map((container, index) => {
           data = container.getPosCoord(ratioL, ratioW);
           for(let x = data.position.front; x < data.position.front + data.dimensions.front; x++){
               term.moveTo(paddingWidth + x, term.height - paddingHeight - data.position.width); term('-');
               term.moveTo(paddingWidth + x, term.height - paddingHeight - (data.position.width + data.dimensions.width)); term('-')
           }
           for(let y = data.position.width; y < data.position.width + data.dimensions.width + 1; y++){
               term.moveTo(paddingWidth + data.position.front, term.height - paddingHeight - y); term('|');
               term.moveTo(paddingWidth + data.position.front + data.dimensions.front, term.height - paddingHeight - y); term('|')
           }
            let name = container.name.split('_')
            let middleFront = data.position.front + data.dimensions.front / 2;
            let middleWidth = data.position.width + data.dimensions.width / 2;
            term.moveTo(middleFront - name[1].length/2 + paddingWidth, term.height - paddingHeight - middleWidth); term(`${name[1]}`);
            term.moveTo(middleFront + paddingWidth, term.height - paddingHeight - middleWidth + 1); term(`(${container.height}) - ${Math.ceil(container.consommation)}`)
            

        })
        term.moveTo(term.height, 1);

    }

    getPriorityIndex = () => {
        let array = []
        let shelfConsom = 0;
        this.content.map((content, index) => {
            if(array.indexOf(content.name.split('_')[1]) == -1){
                array.push(content.name.split('_')[1]);
                shelfConsom += Number(content.consommation);
            }
        })
        return shelfConsom / array.length
    }
    
    getSpaceRatio = () => {
        let total = 0;
        let something = 0;
        /* let array = this.space.map(x => {
            return x.findIndex(a => a !== null)
        })
        console.log(array) */
        //console.log('this.space.length ', this.space.length)
        for(let x = 0; x < this.space.length; x++){
            for(let y = 0; y < this.space[x].length; y++){
                if(this.space[x][y] !== null){ something++ }
                total++
            }
        }
        //console.log('something / total ', something, total)
        return something / total
    }
    

    isShelfFrontFull = () => {
        let occupiedSpace = 0;
        for(let i = 0; i < this.space.length; i++){
            if(this.space[i][0] !== null){ occupiedSpace++ }
        }
        return occupiedSpace / this.space.length
    }
    setWeight(){
        let totalWeight = 0;
        for(let i = 0; i < this.content.length; i++){
            totalWeight += this.content[i].weight
        }
        return totalWeight;
    }
    

    //position={front, width}   dimensions={front, width}
    /**
     * 
     * @param {*} position 
     * @param {*} dimensions 
     * @param {*} heightNb 
     * @param {*} item 
     * @param {*} part 
     * @param {*} accessPoint 
     */
    putInShelf = (position, dimensions, heightNb, item, part, accessPoint) => {
        term.green(`placed ${item.name} (${part.consommation ? part.consommation.mensuelleMoy : null}) in ${this.name} (${this.priority })\n`)
        if(!heightNb){ heightNb = 1 }
        
        this.content.push(new containerObject(item.name, position, dimensions, heightNb, item, part.consommation.mensuelleMoy, accessPoint))
        for(let x = position.front; x < position.front + dimensions.front; x++){
            for(let y = position.width; y < position.width + dimensions.width; y++){
                if(this.space[x] !== undefined && this.space[x][y] !== undefined){
                    this.space[x][y] = item;
                }
            }
            
        }

        this.updateProps()

        /* 
        this.priority = this.getPriorityIndex();
        this.weight = this.setWeight()
        this.height = this.setHeight();
        this.accessRatio = this.getAccessRatio()
        this.spaceRatio = this.getSpaceRatio()
        if(this.getAccessRatio() == 0){ this.isDoubleSided = false }
        else if(this.getAccessRatio() !== 0){ this.isDoubleSided = true }
 */

    }

    removeFromShelf = (part) => {
        let indexes = this.content.map((cont, index) => {
            if (cont.name.split('_')[1] == part.code) { return index }
            else return null
        }).filter((a) => a !== null)

        for(let i = 0; i < indexes.length; i++){ this.content.splice(indexes[i], 1) }

        for(let x = 0; x < this.space.length; x++){
            for(let y = 0; y < this.space[x].length; y++){
                if(this.space[x][y] !== null && this.space[x][y].name.split('_')[1] == part.code){
                    this.space[x][y] = null
                }
            }
        }
        this.weight = this.setWeight()
        this.height = this.setHeight();
        this.accessRatio = this.getAccessRatio()
        if(this.getAccessRatio() == 0){ this.isDoubleSided = false }
        else if(this.getAccessRatio() !== 0){ this.isDoubleSided = true }
    }
    setTotalConsom = () => {
        let contList = []
        this.content.forEach(cont => { if(contList.findIndex(a => a.name.split('_')[1] == cont.name.split('_')[1]) == -1){ contList.push(cont) } });    //list of parts
        let consom = contList.map(part => {
            if(!isNaN(part.consommation) && part.consommation !== 0){
                return part.consommation
            } else return 0
        })
        let totalConsom = 0;
        consom.forEach(c => totalConsom += c)
        this.totalConsom = totalConsom
        return totalConsom
    }

    getTest = () => {   //needs to be removed
        console.log('shelf.getTest() - this.simon ', this.simon)
        return this.simon
    }
    getSpace = () => {
        return this.space
    }
    updateProps = () => {
        this.priority = this.getPriorityIndex();
        //this.totalConsom = this.setTotalConsom();
        console.log(this.getPriorityIndex())
        this.setTotalConsom()
        //console.log(`totalConsom: ${this.totalConsom}`)
        this.height = this.setHeight();
        this.accessRatio = this.getAccessRatio()
        this.spaceRatio = this.getSpaceRatio()
        this.weight = this.setWeight()
        if(this.getAccessRatio() == 0){ this.isDoubleSided = false }
        else if(this.getAccessRatio() !== 0){ this.isDoubleSided = true }


    }

    getAccessRatio = () => {
        let counter = this.content.map((cont, index) => {
            if (cont.accessPoint == FRONT && cont.position.width == 0) {
                return FRONT
            }
            else if (cont.accessPoint == BACK && cont.position.width + cont.dimensions.width == this.width) {
                return BACK
            }
            else return null
        })
        counter = counter.filter((a) => a !== null)
        let countFront = counter.filter((a) => a == FRONT).length
        let countBack = counter.filter((a) => a == BACK).length
        if(countFront !== 0){ return countBack / countFront }
        else return null    //shouldn't happen, we call the function after we put something in shelf
    }

    setHeight(){
        let array = this.content.map(content => content.totalHeight ? content.totalHeight : 0)
        array = array.sort((a, b) => { return b - a})
        return array[0] + 100

    }
    initShelf = (shelfData) => {
        let array = [];
        for(let length = 0; length < shelfData.length / 10; length++){
            array.push(new Array(this.width).fill(null))
        }
        return array
    }

}
module.exports = Shelf;

