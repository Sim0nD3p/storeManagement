const storage = [
    {
        profil: '5000',
        code: 'EXV018',
        width: 12,
        height: 6, 
    },
    {
        profil: '3000',
        code: 'EXV001',
        width:8,   //etait 18, changed for testing purpose -----------!!!!!!----------
        height:12,  //etait 12, changed for testing purpose -----------!!!!!!----------
    },
    {
        profil: '3000',
        code: 'EXV002',
        width: 18,
        height: 12, //A CHANGER
    },
    {
        profil:'Renfort',
        code: 'EXS002',
        width: 12, //A CHANGER
        height: 12, //A CHANGER
    },
    {
        profil: 'Guide',
        code: 'EXS003',
        width: 12,
        height: 12,
    },
    {
        profil: 'Bout de guide',
        code: 'EXS004',
        width:12, //A CHANGER
        height:12, //A CHANGER
    },
    {
        profil: 'Patte',
        code: 'EXS006',
        width: 12, //A CHANGER
        height: 12, //A CHANGER
    },
    {
        profil: 'Palier',
        code: 'EXV005',
        width: 8,   //etait 12, changed for testing purpose -----!!!!!-----
        height: 8,  //etait 12, changed for testing purpose -----!!!!!-----
    },
    {
        profil: 'Tube rond',
        code: 'EXV011',
        width: 12,
        height: 12, //A CHANGER
    },
    {
        profil: '1500',
        code: 'EXV013',
        width:12, //A CHANGER
        height: 12, //A CHANGER
    },
    {
        profil: '007_unknown',
        code: 'EXV007',
        width: 10,  //A CHANGER
        height: 10, //A CHANGER
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

//add weight pour morceaux de bois
class Bundle{
    constructor(contentData){
        this.name = contentData.name;
        this.type = 'bundle'
        this.itemCode = contentData.code ? contentData.code : 'unknownCode';
        this.itemSpecs = contentData.specs;
        this.count = 0;
        this.widthNb = this.getWidthNb(contentData.code)
        this.heightMaxNb = this.getHeightMaxNb(contentData.code)
        this.width = 80 + (contentData.specs.width * this.widthNb);
        this.height = 110;
        this.length = contentData.specs.length;
        this.weight = 0

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
            this.height =  110 + (this.itemSpecs.height * Math.ceil(this.count / this.widthNb));
            return qte - (this.widthNb * this.heightMaxNb)
        } else {
            this.count = qte;
            this.weight = this.itemSpecs.weight * this.count
            return 0
        }
    }

}

module.exports = Bundle;