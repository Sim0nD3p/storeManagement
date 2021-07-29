//On veut add un achat à l'historique
//l'année n'existe pas
//l'année existe mais pas le mois
//l'année et le mois existent
const date = {
    year: 2021,
    month: 7,
    day: 23,
}
var sample1 = {
    2019: {
        1:{
            15:28
        }
    },
    2020:{
        5:{
            23:12,
            24:67,
        },
        6:{
            4:99
        }
    }
}

//------------------------------------------------------


var sample2 = {
    2019: {
        1:{
            15:28
        }
    },
    2020:{
        5:{
            23:12,
            24:67,
        },
        06:{
            4:99
        }
    },
    2021: {
        4:{
            12:67,
            14:88,
        },
        6:{
            7:24,
        }
    }
}

//-----------------------------------------------------------


var sample3 = {
    2019: {
        1:{
            15:28
        }
    },
    2020:{
        5:{
            23:12,
            24:67,
        },
        6:{
            4:99
        }
    },
    2021: {
        4:{
            12:67,
            14:88,
        },
        6:{
            7:24,
        },
        7:{
            15:62,
        }
    }
}

const samples = [sample1, sample2, sample3];
module.exports = samples;