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
        this.weight;
    }
    fillBundle = (qte) => {
        if(qte > this.widthNb * this.heightMaxNb){
            this.count = this.widthNb * this.heightMaxNb
            this.weight = this.count * this.itemSpecs.weight;
            return qte - this.count
        }
        else {
            this.count = qte;
            this.weight = this.itemSpecs.weight * this.count
            return 0
        }
    }

}

module.exports = Bundle