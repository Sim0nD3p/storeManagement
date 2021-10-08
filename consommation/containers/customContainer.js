

/*
this.name = name;
        this.type = 'cus';
        this.contentType = type;
        this.itemcode = part.itemcode;
        this.itemSpecs = part.specs;
        this.length = this.getDimensions(part, type, qte).length;
        this.width = this.getDimensions(part, type, qte).width;
        this.height = this.getDimensions(part, type, qte).height
        this.count = this.confirmQte(part, qte).count;
        this.weight = this.confirmQte(part, qte).weight;
*/

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
        if((nbDepth + 1) * item.specs.length < 3 * nbWidth * item.specs.width && Math.ceil((nbDepth + 1) * item.specs.length) * 1.10 < maxDepth){
            nbDepth++            
        }
        else{
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
        //nbDepth = Math.ceil(qte / (nbHeight * nbWidth))
    }
    if(nbHeight * nbDepth * nbWidth >= qte){        
        return {
            width: Math.ceil(nbWidth * item.specs.width * 1.0),
            height: nbHeight * thickness + item.specs.height * 2,
            length: Math.ceil(nbDepth * item.specs.length * 1.0)
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
           width: bundle.length,
           length: bundle.width,
           height: bundle.height,
       }
   } 
   else {
       if(nbBundle * bundle.width > MAX_DEPTH){
           container = {
               width: Math.ceil(nbBundle / (Math.floor(MAX_DEPTH / bundle.width) * bundle.width)) * bundle.length,
               length: Math.floor(MAX_DEPTH / bundle.width) * bundle.width,
               height: bundle.height,
           }
       }
       else {
           container = {
               width: bundle.length,
               length: nbBundle * bundle.width,
               height: bundle.height,
           }
       }

   }
   return container
}

function bundleBT(item, qte){
    let dimensions = {
        length: item.specs.length,
        height: 500,
        width: 10 * item.specs.width
    }
    return dimensions


}

class customContainer{
    constructor(name, item){
        this.name = name;
        this.type = 'cus';
        this.itemCode = item.code;
        this.itemSpecs = item.specs;
        this.length;
        this.width;
        this.height;
        this.maxCapacity;
        this.weight = 0;
        this.count = 0;
    }

    setAutoDimensions = (item, type, qte) => {
        let dimensions;
        console.log(type)

        if (type == 'Main') {
            dimensions = handStorage(item, qte)
            console.log(dimensions)
        }
        else if (type == 'bUs') {
            if (item.family == 'Barre transversale') {
                dimensions = bundleBT(item, qte)
                console.log('\n\n\n\n\n------BT!!!-----\n\n\n')
            }
            else {
                dimensions = bundleStorage(item, qte);

            }
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


    fillCus = (qte) => {

    }

}
module.exports = customContainer