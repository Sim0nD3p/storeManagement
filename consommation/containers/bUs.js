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
        this.t = this.printDim()
    }


    printDim = () => {
        console.log(this.length, this.width, this.height)
    }
    //there's other ways to do it
    getDimensions = (part) => {
        let nb, height, width, length;
        if(part.qteMax || part.emballage.TF.nbPieces){
            nb = part.qteMax ? part.qteMax : part.emballage.TF.nbPieces
        } else { nb = 100 }
        if(part.specs.length && part.specs.width && part.specs.height){
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
            ]
            dimAnalyzer = dimAnalyzer.sort((a, b) => a.give - b.give)
            let orientation = dimAnalyzer.find((a) => a.give > 0).name; //which spec is perpendicular to FRONT
            let nbDepth = Math.floor(SHELF_WIDTH / dimAnalyzer.find((a) => a.name == orientation).spec)
            width = nbDepth * dimAnalyzer.find(a => a.name == orientation).spec
            if(orientation == 'width'){
                length = part.specs.length
                width = nbDepth * part.specs.width
                let maxHeight = Math.min(2 * width, 2 * length)
                let nbHeight = Math.ceil(nb / nbDepth) //maxHeight = Math.min(2*width, 2*length)
                if(maxHeight / part.specs.height >= nbHeight && nbDepth * nbHeight >= nb){
                    width = width
                    length = length
                    height = nbHeight * part.specs.height
                }
                else {
                    term.red('problem\n')
                }
            }
            else {  //if orientation == 'length'
                let nbLength, nbHeight;
                //max 2x plus haut que large (FRONT, length)
                //qteMax = nbDepth * nbLength * nbHeight
                //nbHeight = 2 * nbLength
                //qteMax = nbDepth * nbLength * (2 * nbLength)
                //qteMax / nbDepth = 2 * nbLength^2
                //qteMax / (2 * nbDepth) = nbLength^2
                //nbLength = sqrt(qteMax / (2 * nbDepth))
                nbLength = Math.ceil(Math.sqrt(nb / (2 * nbDepth)))
                length = nbLength * part.specs.width                
                let maxHeight = Math.min(2 * width, 2 * length)
                nbHeight = Math.ceil(nb / (nbDepth * nbLength))
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