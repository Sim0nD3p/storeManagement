const storage = [
    {
        profil: '5000',
        code: 'EXV018',
        width: 12,
        height: 6, 
        orientation: 'vertical'

    },
    {
        profil: '3000',
        code: 'EXV001',
        width:8,   //etait 18, changed for testing purpose -----------!!!!!!----------
        height:12,  //etait 12, changed for testing purpose -----------!!!!!!----------
        orientation: 'horizontal'

    },
    {
        profil: '3000',
        code: 'EXV002',
        width: 18,
        height: 12, //A CHANGER
        orientation: 'horizontal'

    },
    {
        profil:'Renfort',
        code: 'EXS002',
        width: 12, //A CHANGER
        height: 12, //A CHANGER
        orientation: 'horizontal'

    },
    {
        profil: 'Guide',
        code: 'EXS003',
        width: 12,
        height: 12,
        orientation: 'horizontal'

    },
    {
        profil: 'Bout de guide',
        code: 'EXS004',
        width:12, //A CHANGER
        height:12, //A CHANGER
        orientation: 'horizontal'

    },
    {
        profil: 'Patte',
        code: 'EXS006',
        width: 12, //A CHANGER
        height: 12, //A CHANGER
        orientation: 'horizontal'

    },
    {
        profil: 'Palier',
        code: 'EXV005',
        width: 8,   //etait 12, changed for testing purpose -----!!!!!-----
        height: 8,  //etait 12, changed for testing purpose -----!!!!!-----
        orientation: 'horizontal'

    },
    {
        profil: 'Tube rond',
        code: 'EXV011',
        width: 12,
        height: 12, //A CHANGER
        orientation: 'horizontal'

    },
    {
        profil: '1500',
        code: 'EXV013',
        width:12, //A CHANGER
        height: 12, //A CHANGER
        orientation: 'horizontal'

    },
    {
        profil: '007_unknown',
        code: 'EXV007',
        width: 10,  //A CHANGER
        height: 10, //A CHANGER
        orientation: 'horizontal'

    },
    {
        profil: 'EXV029',
        code: 'EXV029',
        width: 10,
        height: 10,
        orientation: 'horizontal'
    }

]




/*

BUNDLE USINE

hauteurTotale + epaisseurPiece(nbPieces)

types = BT, cornes, extrusionsUsine



*/

/*
contentData should be:
-piece from PFEP (will fuck everything up) JUST GIVE SPECS AND CODE

contentData = {
    name; name of the bundle
    code; code of the part placed
    specs; specs of the part placed
    qte; qte placed
}


*/
//changer approche gen bundle

//add weight pour morceaux de bois
class Bundle{
    constructor(contentData){
        this.name = contentData.name;
        this.type = 'bundle'
        this.bundleVersion = 1
        this.itemCode = contentData.code ? contentData.code : 'unknownCode';
        this.itemSpecs = contentData.specs;
        this.count = 0;
        this.width = this.getWidth(contentData.code)//80
        this.height = this.getHeight(contentData.code)//110
        this.length = contentData.specs.length;
        this.weight = 0
        
        this.extrusionOrientation = this.getExtrusionOrientation(contentData.code)
        this.widthNb = this.getWidthNb(contentData.code)
        this.heightMaxNb = this.getHeightMaxNb(contentData.code)

    }

    getWidth(){
        if(this.extrusionOrientation == 'vertical'){
            return (this.itemSpecs.height * this.widthNb) > 1070 / 2 ? (1070 / 2) : this.itemSpecs.height * this.widthNb 
        }
        else return (this.itemSpecs.width * this.widthNb) > 1070 / 2 ? (1070 / 2) : this.itemSpecs.width * this.widthNb 
    }
    getHeight(){
        if(this.extrusionOrientation == 'vertical'){
            return this.itemSpecs.width * this.heightMaxNb
        }
        else return this.itemSpecs.height * this.heightMaxNb
    }

    getExtrusionOrientation(code){
        let index = -1
        for(let i = 0; i < storage.length; i++){
            if(code.includes(storage[i].code)){ index = i; break; }
        }
        if(index !== -1){
            return storage[index].orientation
        } else return 'ERROR'

    }

    getWidthNb(code) {
        let width = 10
        storage.map((bundle, index) => {
            if (code.includes(bundle.code)) {
                width = bundle.width
            }
        })
        return width
    }
    getHeightMaxNb(code) {
        let height = 10
        storage.map((bundle, index) => {
            if (code.includes(bundle.code)) {
                height = bundle.height
            }
        })
        return height
    }


    //external call to be able to return number of part left to place on other bundles 
    fillBundle(qte){
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

module.exports = Bundle;