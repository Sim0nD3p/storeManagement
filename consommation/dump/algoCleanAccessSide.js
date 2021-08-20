/*
           on veut convertir les shelf de maniere a avoir des groupes (OU PRESQUE) jusqua REACH_LIMIT pour les doubleSided
           on veut maximiser les stack de doubleSided

           1. pour chaque type (shelf length) on check
               - cmb d'étagères on a besoin de convertir en singleSided pour eliminer le surplus de doubleSided (jusqu'a REACH_LIMIT)
               - cmb d'étagères on a besoin de convertir en double sided pour completer un REACH_LIMIT
                       **on peux faire compter des single sided pour des doubleSided (pas optimisé)


           2. potentialShelves => nous dit qulles etageres sont possible de mettre la piece

           classer les shelf selon UP/DOWN (est-ce qu'on atteint REACH_LIMIT vers le haut ou vers le bas?)

           3. Parmi potentialShelves, on trouve s'il est preferable
               - d'envoyer la piece sur une shelf deja doubleSided(priority, length) => diminue nb pieces sur shelf en cours mais augmente sur une autre 
               - d'envoyer la piece sur une etagere singleSided afin qu'elle atteigne REACH_LIMIT
           3. On narrow down les options afin de
               conditions:
               - searchPlace
               - priority
               - doesnt fuckup shelf accessPoint


           */

const getShelves = () => {
    //gets all shelves, organized by length
    let initShelvesObj = {}
    for (let i = 0; i < this.app.store.shelves.length; i++) {
        initShelvesObj = {
            ...initShelvesObj,
            [this.app.store.shelves[i].length]: {
                ...initShelvesObj[this.app.store.shelves[i].length],
                [this.app.store.shelves[i].name]: this.app.store.shelves[i]
            }
        }
    }
    let finalObj = {}
    let types = Object.keys(initShelvesObj)
    for (let i = 0; i < types.length; i++) {
        let currentTypeArray = []
        for (const length in initShelvesObj[types[i]]) {
            currentTypeArray.push(initShelvesObj[types[i]][length])
        }
        finalObj = {
            ...finalObj,
            [types[i]]: currentTypeArray
        }
    }
    return finalObj
}


const bestLength = () => {
    let shelves = getShelves()
    let types = Object.keys(shelves);
    console.log(types)
    types.map((type, index) => {
        let doubleSidedShelves = shelves[type].filter((a) => a.isDoubleSided == true && a.tag == tag);
        let singleSidedShelves = shelves[type].filter((a) => a.isDoubleSided == false && a.tag == tag);
    })

}

const shelvesOptions = (part, shelves) => {
    console.log(part)
    console.log(bestLength())
    part = this.app.store.getItemFromPFEP(part)
    let categorisation = {
        consoMens: part.consommation ? part.consommation.mensuelleMoy : undefined,
        classe: part.class ? part.class : undefined,
        type: part.storage[0].type
    }

    let potentialShelves = this.shelfManager.findPotentialShelf(part, categorisation, tag).filter((a) => a !== null);
    let frontFacing = potentialShelves.filter((a) => a[1] !== false)
    if (frontFacing.length > 0) {

        console.log(frontFacing)
    }
    else {
        rearFacing = potentialShelves.filter((a) => a[2] !== false)
        if (rearFacing.length > 0) {
            console.log(rearFacing)
        }
    }
    console.log(potentialShelves.length)

    let doubleSidedShelves = this.app.store.shelves.filter((a) => a.isDoubleSided == true && a.tag == tag);
    let singleSidedShelves = this.app.store.shelves.filter((a) => a.isDoubleSided == false && a.tag == tag);
    singleSidedShelves.map((shelf, index) => {
        if (Math.abs(part.priority - shelf.priority) / shelf.priority <= 0.80) {
        }
        //check place FRONT
        //check if transformation would help
    })
    doubleSidedShelves.map((shelf, index) => {
        //check
    })
}
let shelves = getShelves()
let types = Object.keys(shelves)
let ref = types.map((type, index) => {
    let doubleSidedShelves = shelves[type].filter((a) => a.isDoubleSided == true && a.tag == tag);
    let singleSidedShelves = shelves[type].filter((a) => a.isDoubleSided == false && a.tag == tag);

    let dSSH = 0; let sSSH = 0;
    doubleSidedShelves.forEach((shelf, index) => { dSSH += shelf.height })
    singleSidedShelves.forEach((shelf, index) => { sSSH += shelf.height })
    let hBot = dSSH % REACH_LIMIT;  //hauteur entre currentHeight et 0
    let hTop = REACH_LIMIT - hBot;  //hauteur entre REACH_LIMIT et currentHeight
    return {
        type: type,
        convToSingle: (hBot < hTop) ? true : false,
        dSSH: dSSH,
        hBot: hBot,
        hTop: hTop,
        doubleSidedShelves: doubleSidedShelves,
        singleSidedShelves: singleSidedShelves
    }
})

console.log(ref)
let partsToPlace = []
let targetDoubleShelves = [];
let targetSingleShelves = []
ref.forEach((type, index) => {
    if (type.convToSingle == true) {
        targetSingleShelves = targetSingleShelves.concat(type.singleSidedShelves)
        let pool = type.doubleSidedShelves.sort((a, b) => a.accessRatio - b.accessRatio)
        let currentDSSH = type.dSSH
        let i = 0;
        while (currentDSSH > 0 && i < pool.length) {
            currentDSSH -= pool[i].height;
            let localParts = []
            pool[i].content.filter((a) => a.accessPoint == BACK).map((cont, index) => {
                if (localParts.indexOf(cont.name.split('_')[1]) == -1) {
                    localParts.push(cont.name.split('_')[1])
                }
            })
            partsToPlace = partsToPlace.concat(localParts);
            i++
        }
    }
    else if (type.convToSingle !== true) {

    }

})
console.log(partsToPlace.length)


for (let i = 0; i < types.length; i++) {
    let totalHeight = 0;
    let doubleSidedShelves = shelves[types[i]].filter((a) => a.isDoubleSided == true && a.tag == tag);
    let singleSidedShelves = shelves[types[i]].filter((a) => a.isDoubleSided == false && a.tag == tag);

    doubleSidedShelves.map((shelf, index) => totalHeight += shelf.height);    //gets total height of double sided shelves
    let heightToBot = totalHeight % REACH_LIMIT;   //height to take off to have full racking
    let heightToTop = REACH_LIMIT - (totalHeight % REACH_LIMIT)
    let shelfPool = doubleSidedShelves.sort((a, b) => a.accessRatio - b.accessRatio)  //shelves with low accessRatio to convert
    let shelfToConvert = []
    let shelfIndex = 0;
    let currentHeight = 0;
    while (currentHeight < heightToBot && shelfIndex < shelfPool.length) {   //getting shelves to convert
        currentHeight += shelfPool[shelfIndex].height
        shelfToConvert.push(shelfPool[shelfIndex])
        shelfIndex++
    }

    console.log(`shelves to remove ${shelfToConvert.length}`)
    let partsToRemove = shelfToConvert.map((shelf, index) => {
        let targetParts = shelf.content.filter((a) => a.accessPoint == BACK)
        return targetParts.map(part => part.name.split('_')[1])

    })


    console.log(partsToRemove)
    partsToRemove.forEach((typeParts) => {
        typeParts.map((part, index) => {
            console.log(shelvesOptions(part, shelves))

        })

    })
}

for (let i = 0; i < types.length; i++) {
    let totalHeight = 0;
    let doubleSidedShelves = shelves[types[i]].filter((a) => a.isDoubleSided == true && a.tag == tag);
    let singleSidedShelves = shelves[types[i]].filter((a) => a.isDoubleSided == false && a.tag == tag);

    doubleSidedShelves.map((shelf, index) => totalHeight += shelf.height);    //gets total height of double sided shelves
    let heightToBot = totalHeight % REACH_LIMIT;   //height to take off to have full racking
    let heightToTop = REACH_LIMIT - (totalHeight % REACH_LIMIT)
    let shelfPool = doubleSidedShelves.sort((a, b) => a.accessRatio - b.accessRatio)  //shelves with low accessRatio to convert
    let shelfToConvert = []
    let shelfIndex = 0;
    let currentHeight = 0;
    while (currentHeight < heightToBot && shelfIndex < shelfPool.length) {   //getting shelves to convert
        currentHeight += shelfPool[shelfIndex].height
        shelfToConvert.push(shelfPool[shelfIndex])
        shelfIndex++
    }

    console.log(`shelves to remove ${shelfToConvert.length}`)
    let partsToRemove = shelfToConvert.map((shelf, index) => {
        let targetParts = shelf.content.filter((a) => a.accessPoint == BACK)
        return targetParts.map(part => part.name.split('_')[1])

    })


    console.log(partsToRemove)
    partsToRemove.forEach((typeParts) => {
        typeParts.map((part, index) => {
            console.log(shelvesOptions(part, shelves))

        })

    })
}