const MAX_DEPTH = 1070;
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

function bundleStorage(item, qte){
    let nbBundle; 
    let container = {
        length: false,
        width: false,
        height: false,
    }
    console.log(qte)
    console.log(item.code)
    console.log(`part info height: ${item.specs.height}, width: ${item.specs.width}, length: ${item.specs.length}`);

    const bluePrints = (item, qte) => {
        let nbHeight = 1;
        let nbWidth = Math.floor(MAX_DEPTH / item.specs.width);
        if(item.specs.height * Math.ceil(qte / nbWidth) < item.specs.width * nbWidth){
            nbHeight = Math.ceil(qte / nbWidth)
        }
        else {
            nbHeight = Math.floor(item.specs.width * nbWidth / item.specs.height)
        }
        return {
            nbWidth: nbWidth,
            nbHeight: nbHeight,
        }
    }
    console.log(bluePrints(item, qte))

    if(bluePrints(item, qte).nbWidth * bluePrints(item, qte).nbHeight < qte){
        nbBundle = Math.ceil(qte / (bluePrints(item, qte).nbWidth * bluePrints(item, qte).nbHeight))
    } else nbBundle = 1

    console.log(nbBundle)
    
    let bundle = {
        width: bluePrints(item, qte).nbWidth * item.specs.width,
        height: bluePrints(item, qte).nbHeight * item.specs.height,
        length: item.specs.length

    }
   if(nbBundle == 1){
       container = {
           length: bundle.length,
           width: bundle.width,
           height: bundle.height,
       }
   } 
   else {
       if(nbBundle * bundle.width > MAX_DEPTH){
           container = {
               length: Math.ceil(nbBundle / (Math.floor(MAX_DEPTH / bundle.width) * bundle.width)) * bundle.length,
               width: Math.floor(MAX_DEPTH / bundle.width) * bundle.width,
               height: bundle.height,
           }
       }
       else {
           container = {
               length: bundle.length,
               width: nbBundle * bundle.width,
               height: bundle.height,
           }
       }

   }
   return container
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
        else if(type = 'bundleUsin'){
            dimensions = bundleStorage(item, qte);
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