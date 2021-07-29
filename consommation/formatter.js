function formatter(inventory, PFEP_partList){
    let PFEP = [];
    for(let i = 0; i < PFEP_partList.length; i++){
        if(parseInt(PFEP_partList[i].slice(3)) !== NaN && PFEP_partList[i].slice(0, 3) == 'SEP' && PFEP_partList[i].length == 7){ PFEP_partList[i] = 'SEP-' + PFEP_partList[i].slice(3)}
        for(j = 0; j < inventory.length; j++){
            if(PFEP_partList[i] == inventory[j].code){
                PFEP.push(inventory[j]);
            }
        }

    }
    return PFEP

}

module.exports = formatter