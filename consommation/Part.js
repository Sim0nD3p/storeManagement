//2021-10-04 REMAKE OF PART.JS WILL WAIT DUE TO CONSIDERATION AND DECISIONS THAT WE WILL MAKE IN THE FUTURE

/* class pre {
    constructor() {
        this.code = data.code
        this.history = data.history;
        this.description = data.description;
        this.family = data.family;
        this.tag = data.tag ? data.tag : undefined;
        this.supplier = [];
        this.utilite = data.utilite;
        this.class = data.class;
        this.specs = {
            length: data.specs.length,
            width: data.specs.width,
            height: data.specs.height,
            weight: data.specs.weight,
        }
        this.emballage = {
            TF: {
                type: data.emballage.TF.type,
                nbPieces: data.emballage.TF.nbPieces
            },
            fournisseur: {
                type: data.emballage.fournisseur.type,
                nbPieces: data.emballage.fournisseur.nbPieces

            }
        }
        this.storage = [];
        this.consommation = {
            annuelle: data.consommation.annuelle,
            mensuelleMoy: data.consommation.mensuelleMoy,
            mensuelleMax: data.consommation.mensuelleMax,
            commandeType: data.consommation.commandeType,
            freqReappro: data.consommation.freqReappro,
            totalOrders: data.consommation.totalOrders,
        }
        this.stockSecurite = this.safetyStock(data)
        this.qteMax = this.getQteMax(data)
    }
} */


class Part{
    constructor(code) {
        this.code = code
        this.description;
        this.history;
        this.family;
        this.tag;
        this.supplier = [];
        this.utilite;
        this.class;
        this.specs = {
            length: undefined,
            width: undefined,
            height: undefined,
            weight: undefined,
        }
        this.emballage = {
            TF: {
                type: undefined,
                nbPieces: undefined
            },
            fournisseur: {
                type: undefined,
                nbPieces: undefined

            }
        }
        this.storage = [];
        this.consommation = {
            annuelle: undefined,
            mensuelleMoy: undefined,
            mensuelleMax: undefined,
            commandeType: undefined,
            freqReappro: undefined,
            totalOrders: undefined,
        }
        this.stockSecurite;
        this.qteMax;
    }
    setSafetyStock = () => {
        let safetyStock = null;
        if(this.supplier[0] && this.consommation){
            if(this.supplier[0].leadTimeMax && this.supplier[0].leadTime && this.consommation.mensuelleMoy && this.consommation.mensuelleMax){
                safetyStock = (Number(this.supplier[0].leadTimeMax) * Number(this.consommation.mensuelleMax)) / (Number(this.supplier[0].leadTime) * Number(this.consommation.mensuelleMoy));
            }
        }
        this.stockSecurite = safetyStock
    }
    setQteMax = () => {
        let qteMax = null;
        if(this.consommation && this.stockSecurite){
            if(this.consommation.freqReappro && this.consommation.mensuelleMoy){
                qteMax = this.consommation.freqReappro * this.consommation.mensuelleMoy + this.stockSecurite
            }
        }
        this.qteMax = qteMax
    }
}

module.exports = Part;