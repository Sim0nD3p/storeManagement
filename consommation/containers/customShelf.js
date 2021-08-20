const shelves = require('./shelves')

const length = require('./shelves').map(s => s.length)
/**
 * CustomShelf for custom storage, when items dont fit on a standard shelf but still take place in racking
 */
class customShelf{
    constructor(name, type, minLength, height){
        this.name = name;
        this.height = height;
        this.priority;
        this.content;
    }

    putInShelf = () => {

    }
    getShelf(){
        
    }
    getLength(){
        let options = shelves.map((shelf, index) => {
            
        })
        let length = 1000;
        return length
    }
}

module.exports = customShelf;