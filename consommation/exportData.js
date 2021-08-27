const fs = require('fs')
const resolve = require(`path`).resolve;


class ExportData{
    constructor(){
        this.defaultPath = '../SORTIE'

    }

    exportTxt(data, fileName, path){
        fs.writeFile(path + '/' + fileName + '.txt', data, (err) => {
            if(err){ console.log('erreur ' + err) }
            else return 'Le fichier a été exporté avec succès'
        })
    }


    async exportJSON(data, fileName, path){
        if(!path){ path = this.defaultPath }
        let JSONstring = JSON.stringify(data);
        fs.writeFile(path + '/' + fileName + '.json', JSONstring, (err) => {
            if(err){ console.log('erreur ', err) }
            else{ return 'Le fichier a été exporté avec succès'}
        })


    }
}

module.exports = ExportData;