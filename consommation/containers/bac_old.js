/*
        type: 'bac1',
        description: 'Petit bac bleu',
        inside: {
            length: 315,
            width: 280,
            height: 145,
        },
        outside: {
            length: 387,
            width: 305,
            height: 150,
        }

        PALETTE:
            - width et length fixes
            - height variable

        BUNDEL:
            - length base sur piece
            - width et height base sur qte

        pour les items sans bac, on a besoin de:
            - dimensions occupee
                - savoir les dimensions pour empiler les pieces
                - type d'empilement


*/

/*
booster bac pour pouvoir le remplir
*/

class Bac{
    constructor(containerData, name, part){
        this.name = name;
        this.itemSpecs = part.specs;
        this.itemCode = part.code;
        this.maxCapacity = this.maxCapacity(part);
        this.count = 0
        this.weight = containerData.weight;
        this.type = containerData.type;
        this.description = containerData.description;
        this.inside = {
            length: containerData.inside.length,
            width: containerData.inside.width,
            height: containerData.inside.height,
        }

        this.length = containerData.outside.length
        this.width = containerData.outside.width
        this.height = containerData.outside.height
        
        this.volumeInt = (this.inside.width * this.inside.length * this.inside.height) / 1000000000;
        this.volumeExt = (this.width * this.length * this.height) / 1000000000; 
    }


    //charge maximale 45kg (100 lbs)
    //https://laws.justice.gc.ca/fra/reglements/DORS-86-304/page-41.html#1163928-1175178
    // charge maximale retenue 25kg ou 55lbs (60lbs ok discute avec stephane 2021-07-08)
    maxCapacity(part){
        if(!isNaN(part.emballage.TF.nbPieces) && !isNaN(part.specs.weight)){
            if(25 / part.specs.weight < part.emballage.TF.nbPieces){
                part.emballage.TF.nbPieces = Math.floor(25 / part.specs.weight);
                return Math.floor(25 / part.specs.weight);
            } 
            else return isNaN(part.emballage.TF.nbPieces) == false ? Math.floor(part.emballage.TF.nbPieces) : undefined
        }
        else return isNaN(part.emballage.TF.nbPieces) == false ? Math.ceil(part.emballage.TF.nbPieces) : undefined
    }
    //on doit s'assurer d'avoir la capacité maximale sinon la fonction returne une erreur
    fillBac(qte){
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

//module.exports = Bac;