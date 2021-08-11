
/*
CustomContainer:
    contains all parts for an item, size is variable
*/
function handStorage(item, qte){
    let maxDepth = 1070; let thickness = 8;
    let maxHeight = 2 * item.specs.width > item.specs.height + 10 * thickness ? 2 * item.specs.width : 400;
    let nbDepth = 1; let nbWidth = 1;
    let nbHeight = Math.floor((maxHeight - item.specs.height) / thickness)
    let iter = 0;
    let currentNb = nbHeight
    while(currentNb < qte && iter < 1000){
        iter++
        if((nbDepth + 1) * item.specs.length < 3 * nbWidth * item.specs.width){
            nbDepth++            
        }
        else if((nbDepth + 1) * item.specs.length > 3 * nbWidth * item.specs.width){
            nbWidth++;
            nbDepth = 1
        }
        currentNb = nbHeight * nbDepth * nbWidth;

        //console.log('nbHeight, nbDepth, nbWidth')
        //console.log(`${nbHeight} x ${nbDepth} x ${nbWidth} = ${nbHeight*nbWidth*nbDepth}`)
        //console.log(`length: ${nbDepth * item.specs.length}, width: ${nbWidth * item.specs.width} `)
        //console.log('\n')
    }

    if(nbWidth > 1){
        nbDepth = Math.ceil(qte / (nbHeight * nbWidth))
    }
    if(nbHeight * nbDepth * nbWidth >= qte){        
        return {
            width: Math.ceil(nbWidth * item.specs.width * 1.05),
            height: nbHeight * thickness + item.specs.height * 2,
            length: Math.ceil(nbDepth * item.specs.length * 1.05)
        }
    }
    else return {
        width: false,
        height: false,
        length: false,
    }
}


class CustomContainer{
    constructor(name, type, part, qte){
        this.name = name;
        this.type = 'customContainer';
        this.contentType = type;
        this.itemcode = part.itemcode;
        this.itemSpecs = part.specs;
        this.length = this.getDimensions(part, type, qte).length;
        this.width = this.getDimensions(part, type, qte).width;
        this.height = this.getDimensions(part, type, qte).height
        this.count = this.confirmQte(part, qte).count;
        this.weight = this.confirmQte(part, qte).weight;

    }

    getDimensions(item, type, qte){
        let dimensions;
        console.log(type)
        if(type == 'main'){
            dimensions = handStorage(item, qte)
            console.log(dimensions)
        }
        else {
            dimensions = {
                length: null,
                width: null,
                height: null
            }
        }
        return dimensions
    }

    confirmQte = (item, qte) => {
        if(this.length !== false && this.width !== false && this.height !== false){
            return {
                count: qte,
                weight: qte * item.specs.weight
            }
        }
    }



}

module.exports = CustomContainer;