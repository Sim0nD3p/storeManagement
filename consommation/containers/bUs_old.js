const term = require('terminal-kit').terminal
const SHELF_WIDTH = 1070;

class bUs{
    constructor(name, part, qte, type){
        this.name = name;
        this.itemCode = part.code;
        this.partSpecs = part.specs;
        this.type = 'bUs';
        this.length = this.getDimensions(part).length;
        this.width = this.getDimensions(part).width;
        this.height = this.getDimensions(part).height;
        this.weight = 50;
    }


    checkValid = () => {
        if(!isNaN(this.height) && !isNaN(this.width) && !isNaN(this.length)){
            return true
        } else return false
    }
    //get dimensions of bUs (others and better ways to do it, should be implemented in a better way, should have idea of actual racking specs, 'customRacking physical')
    getDimensions = (part) => {
        let nb, height, width, length;
        if(!isNaN(part.qteMax) || !isNaN(part.emballage.TF.nbPieces)){
            nb = !isNaN(part.qteMax) ? part.qteMax : part.emballage.TF.nbPieces
        } else { nb = 100 }
        if(nb == 0){ return { length: null, width: null, height: null } }

        if(part.specs.length && part.specs.width && part.specs.height){ //if we have dimensions
            let dimAnalyzer = [
                {
                    name: 'length',
                    spec: part.specs.length,
                    give: SHELF_WIDTH - part.specs.length
                },
                {
                    name: 'width',
                    spec: part.specs.width,
                    give: SHELF_WIDTH - part.specs.width
                },
                {
                    name: 'height',
                    spec: part.specs.height,
                    give: SHELF_WIDTH - part.specs.height
                }
            ]
            let sortedDim = dimAnalyzer.sort((a, b) => b.spec - a.spec)
            if(sortedDim[sortedDim.length - 1].name !== 'height'){  //set the lowest spec to be height
                let lowestSpecName = sortedDim.sort((a, b) => a.spec - b.spec)[0].name
                dimAnalyzer.find(a => a.name == lowestSpecName).give = SHELF_WIDTH - part.specs.height;
                dimAnalyzer.find(a => a.name == 'height').give = SHELF_WIDTH - dimAnalyzer.find(a => a.name == lowestSpecName).spec;
                dimAnalyzer.find(a => a.name == 'height').spec = dimAnalyzer.find(a => a.name == lowestSpecName).spec;
                dimAnalyzer.find(a => a.name == lowestSpecName).spec = part.specs.height;
            }
            //console.log(dimAnalyzer)
            dimAnalyzer = dimAnalyzer.sort((a, b) => a.give - b.give)
            let orientation = dimAnalyzer.find((a) => a.give > 0 && a.name !== 'height').name; //which spec is perpendicular to FRONT, minimum give but still > 0
            let nbDepth = Math.floor(SHELF_WIDTH / dimAnalyzer.find((a) => a.name == orientation).spec)
            width = nbDepth * dimAnalyzer.find(a => a.name == orientation).spec
            
            if(orientation == 'width'){
                length = part.specs.length
                length = dimAnalyzer.find(a => a.name == 'length').spec
                let nbHeight = Math.ceil(nb / nbDepth); //nbHeight selon nbDepth et nb

                
                let maxHeight = Math.min(2 * width, 2 * length)
                //console.log(`nbHeight ${nbHeight}`)
                if(nbDepth * nbHeight >= nb){
                    width = width
                    length = length
                    height = nbHeight * dimAnalyzer.find(a => a.name !== orientation && a.name !== 'length').spec
                }
                else {
                    term.red('problem @ bUs.js - \n')
                    term(`nbDepth: ${nbDepth}, nbHeight:${nbHeight}, nb:${nb}, orientation:${orientation}\n`)
                }
                //console.log(`bUs SPECS: width: ${width}, length: ${length}, height: ${height}`)
            }
            else if(orientation == 'length') {  //if orientation == 'length'
                let nbLength, nbHeight;
                //max 2x plus haut que large (FRONT, length)
                //qteMax = nbDepth * nbLength * nbHeight => nbHeight = 2 * nbLength => qteMax = nbDepth * nbLength * (2 * nbLength)
                //qteMax / nbDepth = 2 * nbLength^2 => qteMax / (2 * nbDepth) = nbLength^2 => nbLength = sqrt(qteMax / (2 * nbDepth))
                nbLength = Math.ceil(Math.sqrt(nb / (2 * nbDepth)))
                //console.log(`nb: ${nb}, nbDepth: ${nbDepth}`)
                //console.log(`nbLength: ${nbLength}`)
                length = nbLength * dimAnalyzer.find(a => a.name !== 'height' && a.name !== orientation).spec     
                let maxHeight = Math.min(2 * width, 2 * length)
                nbHeight = Math.ceil(nb / (nbDepth * nbLength))
                let height = nbHeight * dimAnalyzer.find(a => a.name == 'height').spec
                //console.log(`nbHeight: ${nbHeight}`)
                //console.log(`bUs SPECS: width: ${width}, length: ${length}, height: ${height}`)
                if(nbDepth * nbHeight * nbLength >= nb && maxHeight / part.specs.height >= nbHeight){
                    width = width
                    length = length
                    height = nbHeight * part.specs.height
                }
                else {
                    term.red('error\n')
                }    
            }
        }
        else {
            width = null
            height = null
            length = null
        }
        return {
            length: length,
            width: width,
            height: height
        }
    }
        

}

module.exports = bUs;