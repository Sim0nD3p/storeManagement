const samples = require('./useCasesEx');
const Fournisseur = require('./supplier');
const term = require('terminal-kit').terminal;
const DataAnalyser = require('./dataAnalyser');
const { timers } = require('jquery');

const dataAnalyser = new DataAnalyser()

function clearScreen(){
    process.stdout.write('\u001b[3J\u001b[1J');
    console.clear();
}
class Item{
    constructor(data, dataType){
        if(dataType == 'json'){
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
        else if(dataType == 'csv'){
            this.code = data.code;
            this.history = {};
            this.supplier;
            this.description = data.description;
            this.family = data.famille;
            this.class = data.class
            this.supplier = [];
            this.storage = [];
            this.consommation = {};
            this.utilite = data.utilite;
            this.emballage = {
                TF: {
                    type: data.typeEmballageTF,
                    nbPieces: data.nbPiecesEmballageTF
                },
                fournisseur: {
                    type: data.typeEmballageFournisseur,
                    nbPieces: data.nbPiecesEmballageFournisseur
                }
            }
            this.specs = {
                length: data.length,
                width: data.width,
                height: data.height,
                weight: data.weight,
            }
        }
    }

    getQteMax(data){
        let qteMax = 0;
        if(this.consommation.totalOrders.nbOrders >= 2){ qteMax = this.consommation.freqReappro * this.consommation.mensuelleMoy + this.stockSecurite }
        else if(data.qteMax){ qteMax = data.qteMax }
        else { qteMax = 'PAS ASSEZ DE DONNÉES' }
        return qteMax
    }
    getSS(data){
        let stockSecurite = 0;
        if(!data){ data = this }
        if(data.supplier[0] && data.consommation){
            if(data.consommation.totalOrders.nbOrders > 5){
                stockSecurite = (Number(data.supplier[0].leadTimeMax) * Number(data.consommation.mensuelleMax)) / (Number(data.supplier[0].leadTime) * Number(data.consommation.mensuelleMoy));
            }
            return stockSecurite
        }
        return stockSecurite
    }

    safetyStock(data){
        //let result = 'caliss'
        if(data.stockSecurite == '' || data.stockSecurite == undefined || data.stockSecurite == null || data.stockSecurite == 0){
            return this.getSS(data);
            //result = 'good place'
        }
        else {
            return data.stockSecurite;
        }
        //return result

    }

    setConsom(startYear){
        this.consommation = {
            annuelle: dataAnalyser.annualAve(this, startYear).moyenne_annuelle,
            mensuelleMoy: dataAnalyser.monthlyAve(this, {year: startYear, month: 1}, 'auto', true),
            mensuelleMax: dataAnalyser.maxMonthlyConsum(this, startYear, 'auto').maxConsom,
            commandeType: dataAnalyser.commandeTypique(this, startYear).commandeType,
            freqReappro: dataAnalyser.freqOrder(this, startYear).aveOrderFreq,
            totalOrders: dataAnalyser.totalOrderSize(this, startYear)

        }
    }

    checkHistory(){
        let yearsActive = 0
        for(const year in this.history){
            yearsActive++
        }
        return yearsActive
    }

    changeSupplier(oldSup, newSup){

    }



    


    //create year basis to add shit
    addOrder(qte, date){
        if (this.history[date.year] && this.history[date.year][date.month]) {
            this.history[date.year] = {
                ...this.history[date.year],
                [date.month]: {
                    ...this.history[date.year][date.month],
                    [date.day]: qte,
                }
            }
        }
        else {
            this.history[date.year] = {
                ...this.history[date.year],
                [date.month]: {
                    [date.day]: qte,
                }
            }
        } 
    }
    
    
    //in dev
    
    //usefull
    displayMonthlyAve(){
        let total = 0; let length = 0;
        for(const month in this.consommation.mensuelleMoy){
            total += this.consommation.mensuelleMoy[month];
            length++;
        }
        return Math.floor(total/length)
    }
}

module.exports = Item;