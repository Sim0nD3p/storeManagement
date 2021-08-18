const term = require('terminal-kit').terminal;
const VERTICAL = 'VERTICAL';
const HORIZONTAL = 'HORIZONTAL';
const FRONT = 'FRONT';
const BACK = 'BACK';

function clearScreen() {
    process.stdout.write('\u001b[3J\u001b[1J');
    term.clear();
    console.clear();
}

class containerObject{
    constructor(name, position, dimensions, heightNb, container, consomMensMoy){
        this.name = name;
        this.height = heightNb
        this.totalHeight = container.height * heightNb;
        this.weight = container.weight * heightNb;
        this.consommation = consomMensMoy;
        this.position = {
            front: position.front,
            width: position.width,
        }
        this.dimensions = {
            front: dimensions.front,
            width: dimensions.width,
        }
        this.getPos;
        this.getDim;
    }

    getPosCoord(ratioL, ratioW){
        this.getPos = {
            front: Math.ceil(this.position.front / ratioL),
            width: Math.ceil(this.position.width / ratioW),
        }
        this.getDim = {
            front: Math.ceil(this.dimensions.front / ratioL),
            width: Math.ceil(this.dimensions.width / ratioW)
        }
        return {
            position:{
                front: Math.floor(this.position.front / ratioL),
                width: Math.floor(this.position.width / ratioW),
            },
            dimensions: {
                front: Math.floor(this.dimensions.front / ratioL),
                width: Math.floor(this.dimensions.width / ratioW)
            }
        }
    }

}

class Shelf{
    constructor(name, shelfData, type, tag){
        this.name = name;
        this.type = type;
        this.tag = tag;
        this.priority;
        this.isDoubleSided = false;
        this.width = 107; //mm
        this.capacity = shelfData.rating / 2.2046;  //1 kg == 2.2046 lbs
        this.length = shelfData.length;
        this.weight = 0; //masse kg
        
        this.content = []
        this.height = 0
        this.baseHeight = undefined

        this.space = this.initShelf(shelfData)

    }


    searchPlace = (item, accessSide) => {
        let result;
        let generalType = item.storage[0].type.substring(0, 3);
        let containerCount = item.storage.length;
        let containersPlacement;
        let orientationArray = [];
        let totalItemWeight = 0;
        for(let i = 0; i < item.storage.length; i++){ totalItemWeight += item.storage[i].weight }

        if(this.weight + totalItemWeight <= this.capacity){
            if (generalType == 'bac') {
                for (let i = 0; i < (containerCount / 2) + 1; i++) {
                    let option = [];
                    for (let j = 0; j < (containerCount / 2); j++) {
                        if (j < i) { option.push(HORIZONTAL) }
                        else option.push(VERTICAL)
                    }
                    orientationArray.push(option)
                }
                result = this.searchPlaceForBac(item, orientationArray, accessSide)
            }
            else if (generalType == 'bun' || generalType == 'pal') {
                let option = []
                for (let i = 0; i < containerCount; i++) { option.push(HORIZONTAL) }
                orientationArray.push(option);
                result = this.searchPlaceForBundle(item)
            }
            else if (generalType == 'cus') {
                orientationArray = [[VERTICAL]];
                result = this.searchPlaceForBac(item, orientationArray, accessSide)
            }
        }
        else return false
        return result

    }
    //returns: position, containersPlacement
    searchPlaceForBundle = (item) =>{
        
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
    searchPlaceForBac(item, orientationOptions, accessSide){
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
                for (let col = 0; col < opt.length; col++) {    //columns
                    let containerWidth;
                    for (let container = 0; container < opt[col].length; container++) {     //containers
                        if (container === 0) { containerWidth = opt[col][container][1] }    //initial width for comparaison
                        else {
                            if (opt[col][container][1] == containerWidth) { conflictedCol[col] = false }    //if next container takes the same front space, conflict = false
                            else conflictedCol[col] = true      //true: one of the container in the column takes more front space
                        }
                    }
                }


                if(conflictedCol.indexOf(true) == -1){  //if all the containers take the same front space 
                    return false
                }
                else return true    //if some container takes more front space
    
            })
            
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
            if(bestBloc == false){ return false }
            else{
                let data = getPositionCoord(optionSpecs[0], bestBloc, accessSide)
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
            if(bestBloc == false){ return false }
            else{
                let data = getPositionCoord(optionSpecs[0], bestBloc, accessSide)
                return data
            }

        }
    }
    getShelf(){
        let padding = 0;
        //ratios => real/screen .. real*screen/real = screen => screen = real/ratio
        let ratioL = (this.space.length / (term.width - 2 * padding));
        let ratioW = (this.width / (term.height - 2 * padding));

        for(let i = padding; i < term.width - padding; i++){
            term.moveTo(i, padding); term('-')
            term.moveTo(i, term.height - padding); term('-')
        }
        for(let i = padding; i < term.height - padding; i++){
            term.moveTo(padding, i); term('|')
            term.moveTo(term.width - padding, i); term('|')
        }

        let shelfContent = [];
        

    
       this.content.map((container, index) => {
           let data = container.getPosCoord(ratioL, ratioW);
           for(let x = data.position.front; x < data.position.front + data.dimensions.front; x++){
               term.moveTo(padding + x, term.height - padding - data.position.width); term('-');
               term.moveTo(padding + x, term.height - padding - (data.position.width + data.dimensions.width)); term('-')
           }
           for(let y = data.position.width; y < data.position.width + data.dimensions.width + 1; y++){
               term.moveTo(padding + data.position.front, term.height - padding - y); term('|');
               term.moveTo(padding + data.position.front + data.dimensions.front, term.height - padding - y); term('|')
           }
            let name = container.name.split('_')
            let middleFront = data.position.front + data.dimensions.front / 2;
            let middleWidth = data.position.width + data.dimensions.width / 2;
            term.moveTo(middleFront - name[1].length/2 + padding, term.height - padding - middleWidth); term(`${name[1]}`);
            term.moveTo(middleFront + padding, term.height - padding - middleWidth + 1); term(`(${container.height}) - ${Math.ceil(container.consommation)}`)
            

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
    putInShelf = (position, dimensions, heightNb, item, part) => {
        term.green(`placed ${item.name} in ${this.name}\n`)
        if(!heightNb){ heightNb = 1 }
        
        this.content.push(new containerObject(item.name, position, dimensions, heightNb, item, part.consommation.mensuelleMoy))
        this.priority = this.getPriorityIndex();
        for(let x = position.front; x < position.front + dimensions.front; x++){
            for(let y = position.width; y < position.width + dimensions.width; y++){
                if(this.space[x] !== undefined && this.space[x][y] !== undefined){
                    this.space[x][y] = item;
                }
            }
            
        }
        this.weight = this.setWeight()
        this.height = this.setHeight();


    }
    setHeight(){
        let array = this.content.map(content => content.totalHeight ? content.totalHeight : 0)
        array = array.sort((a, b) => { return b - a})
        return array[0] + 100

    }
    initShelf(shelfData){
        let array = [];
        for(let length = 0; length < shelfData.length / 10; length++){
            array.push(new Array(this.width).fill(null))
        }
        return array
    }

}
module.exports = Shelf;

