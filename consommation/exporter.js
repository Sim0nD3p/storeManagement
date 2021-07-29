const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const resolve = require(`path`).resolve;


function addZero(n){
    if(n < 10){ return '0' + n.toString() }
    else return n.toString()
}

function exportCSV(headers, object, fileName){
    console.log('\nexporting to csv');
    let date = new Date();
    let path = '../SORTIE/'

    if(fileName == 'default'){ fileName = 'report_' + date.toISOString().substring(0, 10) + '-' + addZero(date.getHours()) + addZero(date.getMinutes()) }
    else{
        fileName = fileName + '_genOn' + date.toISOString().substring(0, 10) + '-' + addZero(date.getHours()) + addZero(date.getMinutes())
    }
    let headerArray = [];
    for(let i = 0; i < headers.length; i++){
        headerArray.push({
            id: headers[i],
            title: headers[i]
        })

    }


    const csvWriter = createCsvWriter({
        path: path + fileName + '.csv',
        fieldDelimiter: ';',
        header: headerArray
    });

    csvWriter.writeRecords(object).then((error, response) => { console.log('\n\nLe fichier demandé a été exporté à:'); console.log(resolve(path) + "\\" + fileName + '.csv') })
    return 'yoo'
}

module.exports = exportCSV;