class Functions{
    constructor(){

    }

    safetyStock = (leadTime, leadTimeMax, consomMoy, consomMax) => {
        leadTime = Number(leadTime);
        leadTimeMax = Number(leadTimeMax);
        consomMoy = Number(consomMoy);
        consomMax = Number(consomMax);
        return (leadTimeMax * consomMax) / (leadTime * consomMoy)
    }
    maxQty = (freqReappro, consomMoy, safetyStock) => {
        freqReappro = Number(freqReappro);
        consomMoy = Number(consomMoy);
        safetyStock = Number(safetyStock);
        return freqReappro * consomMoy + safetyStock
    }

}

module.exports = Functions