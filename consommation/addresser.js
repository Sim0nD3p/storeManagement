const term = require('terminal-kit').terminal

class Addresser{
    constructor(app){
        this.app = app;

    }

    setDefaultShelfAddress = () => {
        this.app.store.racking.forEach(rack => {
            if(rack.shelves.sort((a, b) => a.baseHeight - b.baseHeight) == rack.shelves){
                for(let i = 0; i < rack.shelves.length; i++){
                    rack.shelves[i].address = i+1
                }
            }

        })

    }


    /*
    racking adress: will be stored as [[rack.name, adress]]
    */
    setRackingAdress = (racking) => {

    }
}

module.exports = Addresser;