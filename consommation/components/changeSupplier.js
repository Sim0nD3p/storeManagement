const term = require('terminal-kit').terminal

class ChangeSupplier{
    constructor(app, part){
        this.app = app;
    }
    test = () => {
        console.log('test!')
    }

}
module.exports = ChangeSupplier