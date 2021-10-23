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
        this.getSupplier = this.getSupplier.bind(this)
    }
    getSupplier = () => {
        console.log(this.code)
        console.log(this.specs)
        console.log(this.supplier == undefined, this.supplier.length)
    }
    getTest = () => {
        console.log(this.description)
    }
    
    setSafetyStock = (supplierIndex, set) => {
        if(!supplierIndex){ supplierIndex = 0 }
        if(set == undefined){ set = true }
        let safetyStock = null;
        console.log(supplierIndex)
        console.log(this.supplier[0])
        console.log(this.supplier[supplierIndex])
        if(this.supplier[supplierIndex] && this.consommation){
            console.log('allo')
            if(this.supplier[supplierIndex].leadTimeMax && this.supplier[supplierIndex].leadTime && this.consommation.mensuelleMoy && this.consommation.mensuelleMax){
                safetyStock = (Number(this.supplier[supplierIndex].leadTimeMax) * Number(this.consommation.mensuelleMax)) / (Number(this.supplier[supplierIndex].leadTime) * Number(this.consommation.mensuelleMoy));
            }
        }
        if(set == true){
            this.stockSecurite = safetyStock
        }
        return safetyStock
    }
    setQteMax = (stockSecurite, set) => {
        if(stockSecurite == undefined){ stockSecurite = this.stockSecurite }
        if(set == undefined){ set = true }
        let qteMax = null;
        if(this.consommation && stockSecurite){
            if(this.consommation.freqReappro && this.consommation.mensuelleMoy){
                qteMax = this.consommation.freqReappro * this.consommation.mensuelleMoy + stockSecurite
            }
        }
        if(set == true){
            this.qteMax = qteMax
        }
        return qteMax
    }
    setConsom(startYear){
        let consommation = {
            annuelle: dataAnalyser.annualAve(this, startYear).moyenne_annuelle,
            mensuelleMoy: dataAnalyser.monthlyAve(this, {year: startYear, month: 1}, 'auto', true),
            mensuelleMax: dataAnalyser.maxMonthlyConsum(this, startYear, 'auto').maxConsom,
            commandeType: dataAnalyser.commandeTypique(this, startYear).commandeType,
            freqReappro: dataAnalyser.freqOrder(this, startYear).aveOrderFreq,
            totalOrders: dataAnalyser.totalOrderSize(this, startYear)

        }
        return consommation
    }
}

module.exports = Part;