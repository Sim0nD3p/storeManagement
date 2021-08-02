

class Racking{
    constructor(name, length, type){
        this.name = name;
        this.length = length;
        this.type = type;  //assemblage ou MP
        this.shelves = []
        this.height = 0
        this.priority;
        this.class;
    }

    getTotalHeight(){
        let totalHeight = 0
        for(let i = 0; i < this.shelves.length; i++){ totalHeight += Number(this.shelves[i].height) }
        console.log(`totalHeight is ${totalHeight}`)
        return totalHeight;

    }
    addShelf = (shelf) => {
        this.shelves.push(shelf)
        this.height = this.getTotalHeight();
        console.log('add shelf to racking');

    }
}

module.exports = Racking;