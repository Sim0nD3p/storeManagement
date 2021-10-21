const BacData = require('./containerData');

class Bac{
    constructor(name, item, variant_name){
        this.name = name;
        this.itemCode = item.code;
        this.itemSpecs = item.specs;
        this.type = 'bac';
        this.variant = variant_name; //variant de bac
        this.description = this.getVariantInfos(variant_name).description;
        this.length = this.getVariantInfos(variant_name).length;
        this.width = this.getVariantInfos(variant_name).width;
        this.height = this.getVariantInfos(variant_name).height;
        this.weight = 0;
        this.count = 0;
        this.maxCapacity = this.getMaxCapacity(item)
    }

    getVariantInfos = (variant_name) => {
        if(BacData.findIndex((a) => a.type == variant_name) !== -1){
            let variant = BacData.find((a) => a.type == variant_name)
            return {
                description: variant.description,
                length: variant.outside.length,
                width: variant.outside.width,
                height: variant.outside.height,
            }
        }
        else{
            return { description: null, length: null, width: null, height: null, }
        } 
    }
    //charge maximale 45kg (100 lbs)
    //https://laws.justice.gc.ca/fra/reglements/DORS-86-304/page-41.html#1163928-1175178
    // charge maximale retenue 25kg ou 55lbs (60lbs ok discute avec stephane 2021-07-08)
    getMaxCapacity = (part) => {
        if(!isNaN(part.emballage.TF.nbPieces) && !isNaN(part.specs.weight)){
            if(25 / part.specs.weight < part.emballage.TF.nbPieces){
                part.emballage.TF.nbPieces = Math.floor(25 / part.specs.weight);
                return Math.floor(25 / part.specs.weight);
            } 
            else return isNaN(part.emballage.TF.nbPieces) == false ? Math.floor(part.emballage.TF.nbPieces) : undefined
        }
        else return isNaN(part.emballage.TF.nbPieces) == false ? Math.ceil(part.emballage.TF.nbPieces) : undefined
    }

    fillBac = (qte) => {
        if(this.maxCapacity){
            if(qte > this.maxCapacity){
                qte -= this.maxCapacity;
                this.weight += this.maxCapacity * this.itemSpecs.weight;
                this.count = this.maxCapacity;
            }
            else{
                //this.weight = this.partSpecs.weight * qte;
                this.weight += this.itemSpecs.weight * qte;
                this.count = qte;
                qte = 0;
            }
        }
        else{
            this.count = 'ERREUR - MANQUE CAPACITE MAX';
            qte = 0;
        }
        return qte

    }
}
module.exports = Bac;