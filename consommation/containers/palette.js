/*
contentData should be like this:
contentData = {
    maxWidthNb,
    maxLenghtNb,
    maxHeightNb,
    Nb
}
method to fill palette

props of palette
length
width
height
piece
nbWidth
nbLength
nbHeight
weight
nbOfPart
*/

/*
MESURES PALETTE:
interieur(min):
    width: 100
    length: 130 ou 300
    height: 15
exterieur (max):
    width: 130
    length: 130 ou 305
    height: 15

*/

/*
UTILITE PALETTE:
- boites
- cartons
- items 'carre'
*/
const lengthOptions = [1300, 3000]
class Palette{
    constructor(part, name, data){
        this.name = name;
        this.itemCode = part.code;
        this.type = 'palette';
        this.itemSpecs = part.specs;
        this.count = 0;
        this.weight = 0;
        this.contentHeight = 0;
        this.maxHeight = data.maxHeight ? data.maxHeight : 1300;
        this.height = 150;
        this.isOversize = [false, false]; //length, width
        this.width = this.getPaletteWidth(data);
        this.length = this.getPaletteLength(data)
        this.nbItemWidth = this.isOversize[1] ? Math.ceil(this.width / this.itemSpecs.width) : Math.floor(this.width / this.itemSpecs.width);   //max
        this.nbItemLength = this.isOversize[0] ? Math.ceil(this.length / this.itemSpecs.length) : Math.floor(this.length / this.itemSpecs.length)   //max
        this.nbItemHeight = Math.floor(this.maxHeight / this.itemSpecs.height); //max

        


    }
    getPaletteWidth(data){
        let paletteWidth = -1;
        if(!data.width){
            if(this.itemSpecs){
                let dimensions = [Number(this.itemSpecs.length), Number(this.itemSpecs.width), Number(this.itemSpecs.height)]
                dimensions = dimensions.sort((a, b) => { return a - b })
                if(dimensions[1] > 1300){ this.isOversize[1] = true }
                if((dimensions[1] / 1300) - 1 < 0.10){ paletteWidth = 1300 }
            }
        } else paletteWidth = data.width
        return paletteWidth
    }
    getPaletteLength(data){
        let length = -1;
        if(!data.length){
            if(this.itemSpecs){
                let dimensions = [Number(this.itemSpecs.length), Number(this.itemSpecs.width), Number(this.itemSpecs.height)];
                let max = Math.max(dimensions[0], dimensions[1], dimensions[2]);    //trouver max
                for(let i = 0; i < lengthOptions.length; i++){
                    if(max < lengthOptions[i]){ length = lengthOptions[i]; break }  //trouver longueur palette minimale
                }
                if(length == -1){   //si il n'y a pas de palette plus longue que la piece
                    //on verifie si la piece depasse de plus de 10% de la plus longue palette 
                    if((max / lengthOptions[lengthOptions.length]) - 1 < 0.10){ length = this.itemSpecs.length; this.isOversize[0] = true }
                }
            }
        }
        else length = Number(data.length)
        return length
    }

    fillPalette(qte){
        if(this.width !== -1 && this.length !== -1){
            let maxPoss = this.nbItemLength * this.nbItemWidth * this.nbItemHeight;
            if(qte < maxPoss){
                this.count = qte;
                this.height += Math.ceil(qte /(this.nbItemLength * this.nbItemWidth))
                this.weight = this.itemSpecs.weight * qte;
                qte = 0
            }
            else {
                this.count = maxPoss;
                this.height += this.nbItemHeight * this.itemSpecs.height
                this.weight = this.itemSpecs.weight * maxPoss
                qte -= maxPoss
            }
        } else return 'DIMENSIONS NON DEFINIES'
        return qte

    }

}

module.exports = Palette;