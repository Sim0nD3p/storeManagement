const cleanUp = require('./formatter');
const term = require('terminal-kit').terminal;
const ExportCSV = require('./exporter');
const convertSEP = require('./convertToSEP');


function addZero(n){
    if(n < 10){ return '0' + n.toString() }
    else return n.toString()
}

class DataAnalyser{
    constructor(app){
        if(app){
            this.app = app
            this.store = app.store;
        }
        this.currentYear = new Date().getFullYear();
        this.yearAdv = (new Date(new Date().getTime() - new Date(this.currentYear + '-1-1').getTime()) / 86400000) / 365;
        this.annualAve = this.annualAve.bind(this);
    }
    totalOrderSize(piece, startYear){
        let partQte = 0;
        let orderQte = 0;
        for(let year in piece.history){
            if(year >= startYear){
                for(const month in piece.history[year]){
                    for(const day in piece.history[year][month]){
                        partQte += Number(piece.history[year][month][day]);
                        orderQte++
                    }
                }
            }
        }
        return {
            nbPieces: partQte,
            nbOrders: orderQte,
        }
    }

    annualAve(piece, startYear) {
        let array = [];
        let yearsArray = [];
        let thisYear = new Date().getFullYear();
        for (let year = startYear; year < thisYear + 1; year++) { yearsArray.push(Number(year)) }
        let totalOrder = 0;
        for (let year = yearsArray[0]; year < yearsArray[yearsArray.length - 1] + 1; year++) {
            if (piece.history[year]) {
                for (const month in piece.history[year]) {
                    for (const day in piece.history[year][month]) {
                        totalOrder += Number(piece.history[year][month][day]);
                    }
                }
            }
        }
        let object = {
            piece: piece.code,
            moyenne_annuelle: totalOrder / (thisYear - startYear + this.yearAdv),
        }
        return object
    }

    orderByMonth(piece, startDate){
        let object = {};
        for(const year in piece.history){
            if(Number(year) >= Number(startDate.year)){
                for(const month in piece.history[year]){
                    if(Number(year) == Number(startDate.year) && month >= Number(startDate.month) || year > Number(startDate.year)){
                        let monthOrderCount = 0;
                        let monthName = year.toString() + addZero(month.toString());
                        for(const day in piece.history[year][month]){
                            monthOrderCount = monthOrderCount + Number(piece.history[year][month][day]);
                            object = {
                                ...object,
                                [monthName]: monthOrderCount,
                            }
                        } 
                    }
                }
            }
        }
        return object
    }
    generateReport(type, startDate, options){
        if(type == 'monthlyAve'){
            let csvData = [];
            let headers = ['piece', 'moyenne'];
            for(let i = 0; i < this.store.PFEP.length; i++){
                let freq;
                if(options.timeframe == 'auto'){
                    freq = Math.ceil(this.freqOrder(this.store.PFEP[i], startDate.year).aveOrderFreq)
                } else { freq = options.timeframe }
                console.log(freq)
                let aves = this.monthlyAve(this.store.PFEP[i], startDate, freq, true);
                console.log(aves);
                aves = { piece: this.store.PFEP[i].code, moyenne: aves };
                csvData.push(aves)
            }
            let fileName = 'monthlyAve_from'+ startDate.year.toString() + '-' + startDate.month.toString() + '_basedOn_' + options.timeframe.toString() + 'months';
            ExportCSV(headers, csvData, fileName);
        }
        else if(type == 'maxMonthlyConsom'){
            let csvData = [];
            let headers = ['piece', 'maxConsom'];
            for(let i = 0; i < this.store.PFEP.length; i++){
                console.log('amx monthly consom')
                let freq = Math.ceil(this.freqOrder(this.store.PFEP[i], startDate).aveOrderFreq);
                console.log(freq) 
                csvData.push(this.maxMonthlyConsum(this.store.PFEP[i], startDate, freq));
            }
            let fileName = 'maxMonthlyConsom_from' + startDate.toString()
            ExportCSV(headers, csvData, fileName);
        }
        else if(type === 'annualAve'){
            let csvData = [];
            let headers = ['piece', 'moyenne_annuelle'];
            for(let i = 0; i < this.store.PFEP.length; i++){
                csvData.push(this.annualAve(this.store.PFEP[i], startDate))
            }
            let fileName = 'annualAve_from' + startDate.toString();
            ExportCSV(headers, csvData, fileName);
        }
        else if(type === 'commandeType'){
            let csvData = [];
            console.log('commane typique');
            let headers = ['piece', 'commandeType'];
            for(let i = 0; i < this.store.PFEP.length; i++){
                csvData.push(this.commandeTypique(this.store.PFEP[i], startDate));
            }
            let fileName = 'commandeType_from' + startDate.toString();
            ExportCSV(headers, csvData, fileName);
        }
        else if(type === 'freqOrders'){
            let csvData = [];
            let headers = ['piece', 'aveOrderFreq'];
            for(let i = 0; i < this.store.PFEP.length; i++){
                csvData.push(this.freqOrder(this.store.PFEP[i], startDate))
            }
            let fileName = 'freqOrder_from' + startDate;
            ExportCSV(headers, csvData, fileName);
        }
        else if(type === 'fournisseurs'){
            let csvData = [];
            let headers = ['piece', 'fournisseur', 'telephone', 'ville', 'etat', 'pays'];
            for(let i = 0; i < this.store.PFEP.length; i++){
                let part = this.store.PFEP[i];
                let object = {
                    piece: part.code,
                }
                if(part.supplier[0]){
                    object = {
                        ...object,
                        fournisseur: part.supplier[0].name,
                        telephone: part.supplier[0].phone,
                    }
                    if(part.supplier.adresse){
                        object = {
                            ...object,
                            ville: part.supplier[0].adresse.ville ? part.supplier[0].adresse.ville : null,
                            etat: part.supplier[0].adresse.etat ? part.supplier[0].adresse.etat : null,
                            pays: part.supplier[0].adresse.pays ? part.supplier[0].adresse.pays : null,
                        }
                    }
                }
                console.log(object)
                csvData.push(object)
            }
            let fileName = 'suppliersReport';
            ExportCSV(headers, csvData, fileName);
        }
    }

    monthlyAve(piece, startDate, timeframe, singleAve) {
        if(timeframe == 'auto'){ timeframe = Math.ceil(this.freqOrder(piece, startDate.year).aveOrderFreq)}
        let object = this.orderByMonth(piece, startDate);
        let j = true;
        let currentMonth = new Date().getFullYear() + addZero(new Date().getMonth() + 1);
        let groupCounter = 0;
        let groupSum = 0;
        let groupSumArray = {};

        while (j == true) {
            if (object[currentMonth]) { groupSum = groupSum + object[currentMonth] }
            groupCounter++
            if (groupCounter == timeframe) {
                if (groupSum) {
                    groupSumArray = {
                        ...groupSumArray,
                        [currentMonth]: groupSum / timeframe
                    }
                }
                else {
                    groupSumArray = {
                        ...groupSumArray,
                        [currentMonth]: 0
                    }
                }
                groupCounter = 0;
                groupSum = 0;
            }
            if (Number(currentMonth.slice(4)) == startDate.month && Number(currentMonth.slice(0, 4) == startDate.year)) {
                j = false;
                if (groupCounter !== timeframe) {
                    groupSumArray = {
                        ...groupSumArray,
                        [currentMonth]: groupSum / groupCounter
                    };
                }
            }

            if (Number(currentMonth.slice(4)) == 1) {
                let year = Number(currentMonth.slice(0, 4)) - 1;
                currentMonth = year.toString() + '12'
            }
            else if (currentMonth.slice(4) !== 1) {
                let month = Number(currentMonth.slice(4)) - 1;
                currentMonth = currentMonth.slice(0, 4) + addZero(month.toString());
            }
        }
        
        if(singleAve == false){ return groupSumArray}
        else if(singleAve == true){

            let total = 0
            let length = 0
            for(const month in groupSumArray){
                let current = Number(groupSumArray[month]);
                if(isNaN(current) == false){
                    total += current;
                    length++
                }
            }
            console.log(`this is total ${total}`);
            console.log(`this is length ${length}`)
            return Number(total/length)
        }
    }

    maxMonthlyConsum(piece, startYear, timeframe) {
        let startDate = {
            year: startYear,
            month: 1
        }
        if(timeframe == 'auto'){ timeframe = Math.ceil(this.freqOrder(piece, startYear).aveOrderFreq)}
        let array = [];
        let monthlyOrders = this.monthlyAve(piece, startDate, 1, false);
        let groupCount = 0;
        let groupSumArray = [];
        let currentGroupSum = 0;
        for (const month in monthlyOrders) {
            currentGroupSum += monthlyOrders[month];
            groupCount++;
            if(groupCount === timeframe){
                if(isNaN(currentGroupSum) === true){ currentGroupSum = 0 }
                groupSumArray.push(currentGroupSum / groupCount);
                groupCount = 0;
                currentGroupSum = 0;
            }
        }
        if(groupCount < timeframe && groupCount !== 0){
            groupSumArray.push(currentGroupSum / groupCount);
        }
        let object = {
            piece: piece.code,
            maxConsom: Math.max(...groupSumArray)
        }

        return object
    }

    commandeTypique(piece, startYear) {
        let totalOrdered = 0;
        let orderCount = 0;
        for (const year in piece.history) {
            if (year >= startYear) {
                for (const month in piece.history[year]) {
                    for (const day in piece.history[year][month]) {
                        totalOrdered += Number(piece.history[year][month][day]);
                        orderCount++;
                    }
                }
            }
        }
        let object = {
            piece: piece.code,
            commandeType: totalOrdered / orderCount,
        }
        return object
    }

    


    //enlever le premier element de array car si seulement 1 commande on a une reponse qui est fausse
    freqOrder(piece, startYear){
        let startDate = {
            year: startYear,
            month: 1
        }
        let array = [];
        let monthlyOrders = this.monthlyAve(piece, startDate, 1, false);
            let orderDates = [];
            let lastOrder = 0;
            let month = 0;
            for(const title in monthlyOrders){
                month++
                if(Number(title) !== NaN){
                    if(Number(monthlyOrders[title]) !== 0 && isNaN(Number(monthlyOrders[title])) == false){
                        if(lastOrder !== 0 && isNaN(lastOrder) === false){
                            orderDates.push(month - lastOrder);
                        }
                        lastOrder = month;
                    }


                }
            }
            let sum = 0;
            let length = 0;
            orderDates.map((element, index) => {
                sum += element;
                length++;
            })            
            let object = {
                piece: piece.code,
                aveOrderFreq: sum/length

            }
            return object
    }    



    
    options(){
        
    }
    findMissingOrder(){
        let array = [];
        for(let i = 0; i < this.store.PFEP_partList.length; i++){
            let present = false;
            for(let j = 0; j < this.store.inventory.length; j++){
                if(this.store.PFEP_partList[i] == this.store.inventory[j].code){
                    present = true;
                }
                
            }
            if(present == false){
                array.push({
                    piece: convertSEP(this.store.PFEP_partList[i]),
                    present: present,
                })
            }

        }
        ExportCSV(['piece', 'present'], array, 'missingPartsInAchats');
        console.dir(array, {maxArrayLength:null});
    }

    initiate(){
        console.clear();
        term.bold("\nAnalyse des données\n");
        //replace by addInventoryToPFEP
        this.store.PFEP = cleanUp(this.store.inventory, this.store.PFEP_partList); 
        console.log(this.store.PFEP.length + "pieces du PFEP ont été retrouvées dans l'historique des achats");
        this.app.home()

        /* let headers = ['piece'];
        let array = [];
        for(let i = 0; i < this.store.inventory.length; i++){
            array.push({ piece: convertSEP(this.store.inventory[i].code) })
        } */
        //this.findMissingOrder();
        
    }

}

module.exports = DataAnalyser;

