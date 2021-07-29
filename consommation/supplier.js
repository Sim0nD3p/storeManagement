const term = require('terminal-kit').terminal;
const infosFournisseurs = require('./infosFournisseurs');

class Fournisseur{
    constructor(data, type){
        this.name = data.name;
        this.phone = data.phone;
        this.fax = data.fax;
        this.piecesFournies = [];
        if(type !== 'json'){

            this.nbPiecesFournies = 0;
            this.indiceConfiance;
            this.transporteur;
            this.tempsTransport;
        }
        else if(type == 'json'){
            this.leadTime = data.leadTime;
            this.leadTimeMax = data.leadTimeMax;
            this.nbPiecesFournies = data.nbPiecesFournies;
            this.adresse = {
                ville: data.adresse.ville,
                etat: data.adresse.etat,
                pays: data.adresse.pays,
            }


        }
    }
    //make list of supplier's parts
    checkForParts = (PFEP) => {
        let array = [];
        for(let i = 0; i < PFEP.length; i++){
            for(let j = 0; j < PFEP[i].supplier.length; j++){
                if(PFEP[i].supplier[j].phone == this.phone){
                    array.push(PFEP[i].code);
                }
            }

        }
        this.piecesFournies = array;
    }

    

    addDetailsFromList(){
        let adresse = {
            ville: null,
            etat: null,
            pays: null,
        }
        for(let i = 0; i < infosFournisseurs.length; i++){
            if(infosFournisseurs[i].telephone == this.phone){
                adresse = {
                    ville: infosFournisseurs[i].ville,
                    etat: infosFournisseurs[i].etat,
                    pays: infosFournisseurs[i].pays,
                }
            }
        }
        this.adresse = adresse;
        

    }
}

module.exports = Fournisseur;