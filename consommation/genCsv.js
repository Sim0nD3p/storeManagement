const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function exportCSV(data){
    console.log('exporting to csv');
    let date = new Date();
    let path = 'verif3'; 
    console.log(path);

    const csvWriter = createCsvWriter({
        path: path + '.csv',
        fieldDelimiter: ';',
        header: [
            { id: 'piece', title: 'PIECE' },
            { id: 'date', title: 'DATE' },
            { id: 'qte', title: 'QTE' },
        ]
    });
    csvWriter
        .writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'));

}

/*
 8 pièces à 5 entrées
 5 pièces à 4 entrées
 6 pièces à 3 entrées
 8 pièces à 2 entrées
 6 pièces à 1 entrée
*/

let dateStart = new Date(Date.UTC(2020, 0, 2));
let dateEnd = new Date(Date.UTC(2021, 6, 2))

function genRandomDate(){
    let date = new Date(dateStart.getTime() + Math.random()*(dateEnd - dateStart));
    return date.toISOString().substring(0, 10);
}

let array = [];
let pcsN = [8, 5, 6, 8, 6];

for(let i = 0; i < pcsN.length; i++){
    let num = pcsN.length - i;
    for(let j = 0; j < num; j++){
        for(let k = 0; k < pcsN[i]; k++){
            let date = genRandomDate();
            let code = 'SEP10' + num + k;
            let object = {
                piece: code,
                date: date,
                qte: Math.ceil(Math.random()*100),
            }
            array.push(object)

        }
    }
}

console.dir(array, {'maxArrayLength': null});
console.log(`${array.length} elements`);
exportCSV(array);

