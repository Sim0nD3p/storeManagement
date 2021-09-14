const term = require(`terminal-kit`).terminal

class FichePiece{
    constructor(app){
        this.app = app


    }

    displayPart = (part) => {
        this.app.clearScreen()
        if(typeof part == 'string'){ part = this.app.store.getItemFromPFEP(part) }
        const tWidth = term.width;  //terminal width
        const tHeight = term.height;    //terminal height
        const leftMargin = 5

        const utilite = (partUtilite) => {
            let utiliteStr; 
            if(Array.isArray(part.utilite)){
                part.utilite.forEach(u => utiliteStr += u + ','); utiliteStr = utiliteStr.substring(0, utiliteStr.length - 1);  //format utilité
            } else utiliteStr = part.utilite
            return utiliteStr
        }
        const dimensions = (specs) => {
            let str = ''; let array = [];
            let dimensionsSpecs = ['length', 'width', 'height']
            for(const spec in specs){
                if(dimensionsSpecs.includes(spec)){
                    array.push(specs[spec])
                }
            }
            str += Math.ceil(array[0]).toString()
            for(let i = 1; i < array.length; i++){
                str += ` x ${Math.ceil(array[i]).toString()}`
            }
            return str += ` (mm)`
        }

        const address = (addressObject) => {
            return 'nothing yet'
        }
        const phoneNumber = (number) => {
            return number.substring(0, 3) + '-' + number.substring(3, 6) + '-' + number.substring(6, 11)
        }
        const supplierInfos = (supplier, leftMargin) => {
            return [
                term.column(leftMargin), term.bold.underline(`FOURNISSEUR PRINCIPAL\n`),
                term.column(leftMargin), term.bold(`Nom: `), term(supplier.name ? supplier.name.substring(0, 20) : filler), term('\n'),
                term.column(leftMargin), term.bold(`Téléphone: `), term(supplier.phone ? phoneNumber(supplier.phone).substring(0, 20) : filler), term('\n'),
                term.column(leftMargin), term.bold(`Fax: `), term(supplier.fax ? phoneNumber(supplier.fax).substring(0, 20) : filler), term('\n'),
                term.column(leftMargin), term.bold('Adresse: '), term(address(supplier.address).substring(0, 20)), term('\n'),
                term.column(leftMargin), term.bold(`Lead time moyen: `), term(supplier.leadTime ? supplier.leadTime.toString().substring(0, 10) : filler), term(` mois`), term('\n'),
                term.column(leftMargin), term.bold(`Lead time max: `), term(supplier.leadTimeMax ? supplier.leadTimeMax.toString().substring(0, 10) : filler), term(` mois`), term('\n'),
            ]
        }



        let filler = undefined
        let str = `FICHE DE PIÈCE: ${part.code}`
        term.moveTo(tWidth/2-str.length/2, 2).bold.underline(str); term('\n')
        term.column(leftMargin); term.bold.underline(`INFORMATIONS PRIMAIRES\n`)
        term.column(leftMargin); term.bold('Code: '); term(part.code ? part.code.substring(0, 20) : filler); term('\n');
        term.column(leftMargin); term.bold('Description: '); term(part.description ? part.description.substring(0, 20) : filler); term('\n');
        term.column(leftMargin); term.bold('Famille: '); term(part.family ? part.family.substring(0, 20) : filler); term('\n');
        term.column(leftMargin); term.bold('Utilité: '); term(utilite(part.utilite) ? utilite(part.utilite).substring(0, 20) : filler); term('\n')
        term.column(leftMargin); term.bold('Classe: '); term(part.class ? part.class.substring(0, 20) : filler); term('\n')
        term.column(leftMargin); term.bold('Dimensions: '); term(dimensions(part.specs) ? dimensions(part.specs).substring(0, 20) : filler); term('\n');
        term.column(leftMargin); term.bold(`Masse: `); term(part.specs.weight ? part.specs.weight.toString().substring(0, 10) : filler); term(` (kg)`); term('\n');

        term('\n')

        supplierInfos(part.supplier[0], leftMargin)

        let emballageTF = part.emballage.TF ? part.emballage.TF : null; 
        term.column(leftMargin); term.bold.underline(`INFORMATIONS D'EMBALLAGE\n`)
        term.column(leftMargin); term.bold(`Type: `); term(emballageTF.type ? emballageTF.type.substring(0, 10) : filler); term('\n');
        term.column(leftMargin); term.bold(`Nombre de pièces par contenant: `); term(emballageTF.nbPieces ? emballageTF.nbPieces.substring(0, 10) : filler); term('\n');
        term.column(leftMargin); term.bold(); term(); term('\n');
        term.column(leftMargin); term.bold(); term(); term('\n');
        term.column(leftMargin); term.bold(); term(); term('\n');
        term.column(leftMargin); term.bold()




        




        const fournisseur = (supplier) => {

        }


        /*
        MAINS INFOS
        code
        description
        family
        utilite
        class
        specs
        */




    }
}



module.exports = FichePiece