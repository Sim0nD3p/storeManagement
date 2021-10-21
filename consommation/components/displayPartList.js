const term = require('terminal-kit').terminal


/**
 * Permet l'affichage de listes de pieces
 *  - pieces fonction fournisseur
 *  - piece selon categories
 *  - piece selon donnes entreposage et localisation
 *  -
 */
class displayPartList{
    constructor(app){
        this.app = app
    }

    /**
     * Menu affiche
     */
    menu = () => {
        this.app.clearScreen();
        this.app.lastScreen.screen = 'home';
        let str = `Choisir mode d'affichage des pièces du PFEP`
        const menuItems = [
            'fdsfsd',
            'fdsfsd',
            'fds'
        ]

        term.moveTo(term.width/2 - str.length/2, 2); term.bold.underline(str)
        let menu = term.singleColumnMenu(menuItems, {cancelable: true, leftPadding: '\t', keyBindings: { ENTER: 'submit', CTRL_Z: 'escape', DOWN: 'next', UP: 'previous'}}).promise

        menu.then((res) => {
            if(!res.canceled){
                console.log(res)
                switch(res.selectedIndex){
                    default: break;

                }
            }

        }).catch((e) => console.log(e))
    }


}

module.exports = displayPartList