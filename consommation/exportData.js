const fs = require('fs')
const resolve = require(`path`).resolve;


class ExportData{
    constructor(){
        this.defaultPath = '../SORTIE'

    }


    exportJSON(data, fileName, path){
        if(!path){ path = this.defaultPath }
        let JSONstring = JSON.stringify(data);
        fs.writeFile(path + '/' + fileName + '.json', JSONstring, (err) => {
            if(err){ console.log('erreur ', err) }
            else{ console.log('Le fichier a été exporté')}
        })


    }
}

module.exports = ExportData;