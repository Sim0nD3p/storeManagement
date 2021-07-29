const term = require('terminal-kit').terminal

class partTable{
    constructor(app){
        this.app = app;

    }
    clearScreen(){ this.app.clearScreen() }

    quantity(){
        this.clearScreen();
        let nb = 0; let nbFA = 0; let nbA = 0; let nbF = 0;
        term('code');
        term.column(20); term('mensuMoy');
        term.column(35); term('mensuMax');
        term.column(50); term('leadMoy');
        term.column(65); term('leadMax');
        term.column(80); term('freq reappro');
        term.column(95); term('SS');
        term.column(110); term('consom');
        term.column(125); term('Qte Max');
        term('\n');
        this.app.store.PFEP.map((part, index) => {
            if(part.class == 'A'){ term.green() }
            if(part.qteMax){ nb++; if(part.class == 'A'){ nbA++ } }
            if(!part.qteMax){ nbF++; if(part.class == 'A'){ nbFA++ } }
            term(part.code);
            term.column(20); term(part.consommation.mensuelleMoy ? Math.ceil(part.consommation.mensuelleMoy) : '');
            term.column(35); term(part.consommation.mensuelleMax ? Math.ceil(part.consommation.mensuelleMax) : '');
            term.column(50); term(part.supplier[0] ? part.supplier[0].leadTime : '');
            term.column(65); term(part.supplier[0] ? part.supplier[0].leadTimeMax : '');
            term.column(80); term(part.consommation.freqReappro ? Math.ceil(part.consommation.freqReappro) : '');
            term.column(95); term(Math.ceil(part.stockSecurite));
            term.column(110); term(Math.ceil(part.consommation.freqReappro * part.consommation.mensuelleMoy));
            term.column(125); term(Math.ceil(part.qteMax))
            term.styleReset();
            term('\n-------------------------------------------------------------------------------------------------------------------\n');
        })
        term(`${nb} pièces ont une quantité maximale\n`);
        term(`${nbF} pièces n'ont pas une quantité maximale\n`);
        term(`${nbA} pièces de classe A ont une quantité maximale\n`);
        term(`${nbFA} pièces de classe A N'ONT PAS une quantité maximale\n`);
        
    }

    containerData(){
        this.clearScreen();
        let nb = 0; let nbF = 0; let bac1Nb = 0; let bac2Nb = 0;
        term('code');
        term.column(20); term('masse');
        term.column(40); term('container');
        term.column(55); term('P');
        term.column(62); term('L');
        term.column(69); term('H');
        term.column(75); term('nb');
        term('\n')
        this.app.store.PFEP.map((part, index) => {
            if(!part.emballage.type || !part.emballage.type.type){
                if(part.class == 'A'){
                    nbF++;
                }
            }
            if(part.emballage.TF.type && part.emballage.TF.type.type){
                if(part.emballage.TF.type.type == 'bac1'){ bac1Nb++ }
                if(part.emballage.TF.type.type == 'bac2'){ bac2Nb++ }
                nb++;
                term(part.code);
                term.column(20); term(part.specs.weight);
                term.column(40); term(part.emballage.TF.type.type);
                term.column(55); term(part.emballage.TF.type.outside.length);
                term.column(62); term(part.emballage.TF.type.outside.width);
                term.column(69); term(part.emballage.TF.type.outside.height);
                term.column(75); term(part.emballage.TF.nbPieces);
                term('\n');
            }
        })
        term(`${nb} pièces sont placées dans des bacs\n`)
        term(`${nbF} pièces devraient être placées dans des bacs\n`);
        term(`${bac1Nb} pieces dans bac de type 1\n`)
        term(`${bac2Nb} pieces dans bac de type 2\n`)
    }
        
    storeData() {    //0  1   2   3   4   5   6   7   8   9    10   11 
        let spacing = [0, 20, 35, 55, 60, 70, 75, 83, 88, 100, 105, 115]
        let consomMens = 0; let container = 0; let SS = 0;
        let consomMensA = 0; let containerA = 0; let SSA = 0;
        let PFEPLength = 0;
        this.clearScreen();
        term.underline()
        term.column(spacing[0]); term('Code');
        term.column(spacing[1]); term('Famille');
        term.column(spacing[2]); term('Dimensions');
        term.column(spacing[3]); term('mensMoy|Max');
        //term.column(spacing[4]); term('mensMax');
        term.column(spacing[5]); term('LT moy|max');
        term.column(spacing[7]); term('SS|QteMax');
        term.column(spacing[9]); term('Nb|Cont');
        term.column(spacing[11]); term('NbCont');
        term.styleReset(); term('\n\n------------------------------------------------------------------------------------------')

        this.app.store.PFEP.map((part, index) => {
            if (part.family !== 'Consommable') {



                PFEPLength++
                if (part.consommation.mensuelleMoy && part.consommation.mensuelleMax) { consomMens++ }
                if (part.emballage.TF.type && part.emballage.TF.type.type) { container++ }
                if (part.qteMax) { SS++ }

                let dimensionsString = ''
                if (part.specs) {
                    let length = part.specs.length ? Math.ceil(part.specs.length) : 'ND';
                    let width = part.specs.width ? Math.ceil(part.specs.width) : 'ND';
                    let height = part.specs.height ? Math.ceil(part.specs.height) : 'ND'
                    dimensionsString = length + ' x ' + width + ' x ' + height;

                }
                if(part.class){

                    if(part.class == 'B'){ term.yellow() };
                    if(part.class.includes('C')){ term.red() };
                    if (part.class == 'A') {
                        term.green()
                        if (part.consommation.mensuelleMoy) { consomMensA++ }
                        if (part.emballage.TF.type && part.emballage.TF.type.type) { containerA++ }
                        if (part.stockSecurite) { SSA++ }
                    }
                }
                term.column(spacing[0]); term(part.code.substring(0, 18));
                term.column(spacing[1]); term(`${part.family ? part.family.substring(0, 12) : ''}`)
                term.column(spacing[2]); term(dimensionsString);
                term.column(spacing[3]); term(part.consommation ? Math.ceil(part.consommation.mensuelleMoy) : '')
                term.column(spacing[4]); term(part.consommation ? Math.ceil(part.consommation.mensuelleMax) : '')
                term.column(spacing[5]); term(part.supplier[0] ? part.supplier[0].leadTime : '');
                term.column(spacing[6]); term(part.supplier[0] ? part.supplier[0].leadTimeMax : '');
                term.column(spacing[7]); term(isNaN(part.stockSecurite) ? 'NA' : Math.ceil(part.stockSecurite));
                term.column(spacing[8]); term(isNaN(part.qteMax) ? 'NA' : Math.ceil(part.qteMax));
                term.column(spacing[9]); term(part.emballage.TF.nbPieces ? part.emballage.TF.nbPieces.toString().substring(0, 4) : '')
                term.column(spacing[10]); term(part.emballage.TF.type ? part.emballage.TF.type.substring(0, 8) : '');
                term.column(spacing[11]); term(part.storage.length);

                term.styleReset();
                term('\n--------------------------------------------------------------------------------------------------------------------\n')
            }
        })
        term(`${PFEPLength} pièces sont répertoriée dans le suivi\n`)
        term(`${SS} pièces ont une quantité cible\n`);
        term(`${consomMens} pièces ont une consommation mensuelle\n`);
        term(`${container} pièces ont un contenant\n`)
        term('\n')
        term(`${SSA} pièces de classe A ont un stock de sécurité\n`);
        term(`${consomMensA} pièces de classe A ont une consommation mensuelle\n`);
        term(`${containerA} pièces de classe A ont un contenant\n`)
    }
}


module.exports = partTable;