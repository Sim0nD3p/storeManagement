class Bundle{
    constructor(name, item){
        this.name = name;
        this.type = 'bundle';
        this.itemCode = item.code;
        this.bundleVersion = 2
        this.itemSpecs = item.specs;
        this.count = 0;
        this.maxCapacity;
        this.length;
        this.width;
        this.height;
        this.weight = 0
    }

    setDimensions = (dimensions) => {
        let keys = [ 'length', 'width', 'height' ]
        if(Object.keys(dimensions).toString() == keys.toString()){
            this.length = dimensions.length;
            this.width = dimensions.width;
            this.height = dimensions.height;
        } else console.error('error - invalid dimension given to setDimensions @bundle.js')
    }
    fillBundle = (qte) => {
        if(qte > 0){
            if(!isNaN(this.maxCapacity) && this.maxCapacity > 0){
                if(qte <= this.maxCapacity){
                    this.count = qte
                    this.weight = qte * this.itemSpecs.weight
                    qte = 0;
                }
                else if(qte > this.maxCapacity){
                    this.count = this.maxCapacity;
                    this.weight = this.maxCapacity * this.itemSpecs.weight;
                    qte = qte - this.maxCapacity;
                }

            } else console.error('Error - container.maxCapacity is not valid @bundle.js')
        } else console.error('Error - cannot fill bundle with negative qte @bundle.js')
        return qte
    }
}
module.exports = Bundle