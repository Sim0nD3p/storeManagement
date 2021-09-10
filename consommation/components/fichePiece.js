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
        const specifications = (specs) => {
            let str;
            for(const spec in specs){
                if(spec && !isNaN(spec) && spec !== 'weight'){
                    if(str.length !== 0 || spec !== 'height'){ str += ' x ' }
                    str += Math.ceil(specs.spec).toString()
                    
                }
            }

            return str

        }



        let filler = undefined
        let str = `FICHE DE PIÈCE: ${part.code}`
        term.moveTo(tWidth/2-str.length/2, 2).bold.underline(str); term('\n')
        term.column(leftMargin); term.bold('Code: '); term(part.code ? part.code.substring(0, 20) : filler); term('\n');
        term.column(leftMargin); term.bold('Description: '); term(part.description ? part.description.substring(0, 20) : filler); term('\n');
        term.column(leftMargin); term.bold('Famille: '); term(part.family ? part.family.substring(0, 20) : filler); term('\n');
        term.column(leftMargin); term.bold('Utilité: '); term(utilite(part.utilite) ? utilite(part.utilite).substring(0, 20) : filler); term('\n')
        term.column(leftMargin); term.bold('Classe: '); term(part.class ? part.class.substring(0, 20) : filler); term('\n')
        term.column(leftMargin); term('Dimensions: '); term(specifications(part.specs) ? specifications(part.specs).substring(0, 20) : filler); term('\n')


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