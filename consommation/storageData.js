//Pour storage, on a besoin de container et nbPiece
const storageData = {
    "AG-0001-IC": {
        container: "bac1",
        nbPieces: 14.285714285714286,
        storage: true
    },
    "AG-0002-IC": {
        container: "bac1",
        nbPieces: 14.285714285714286,
        storage: true
    },
    "AP01-0004": {
        container: "bac1",
        nbPieces: 83,
        storage: true
    },
    "AP01-0012": {
        container: "bac1",
        nbPieces: 29.571428571428573,
        storage: true
    },
    "AP01-0013": {
        container: "bac1",
        nbPieces: 83,
        storage: true
    },
    "AP01-0014": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "ARM-SA3": {
        container: "TABLETTE RACKING TE",
        nbPieces: "180",
        storage: false
    },
    "AS-0001D": {
        container: "bac1",
        nbPieces: 15.625,
        storage: true
    },
    "AS-0001G": {
        container: "bac1",
        nbPieces: 15.625,
        storage: true
    },
    //tube usine, long
    //----------------------------------------------------------
    "BA1B-2975A64": {
        container: "bUs",
        nbPieces: 10,
        storage: false
    },
    "BX01-0015C": {
        container: "bac1",
        nbPieces: 28.571428571428573,
        storage: true
    },
    "BX02-0420C": {
        container: "bac2",
        nbPieces: 42.857142857142854,
        storage: true
    },
    //emballage
    "car-10x10x10": {
        container: "RACKING EMBALLAGE",
        nbPieces: "100 PAR ANNEE",
        storage: false
    },
    //emballage
    "CAR-9x7x4": {
        container: "RACKING EMBALLAGE",
        nbPieces: "100 PAR ANNEE",
        storage: false
    },
    //emballage
    "CAR-OND": {
        container: "EMBALLAGE",
        nbPieces: "1,5",
        storage: false
    },
    //emballage
    "CAR-SAV-117/P": {
        container: "EMBALLAGE",
        nbPieces: "600",
        storage: true
    },
    //emballage
    "CAR-SC9 (PRINT)": {
        container: "EMBALLAGE",
        nbPieces: "400",
        storage: false
    },
    //emballage
    "CAR-SC9 (PRINT) BOTTOM": {
        container: "",
        nbPieces: "",
        storage: true
    },
    //emballage
    "CAR-SC9 (PRINT) TOP": {
        container: "",
        nbPieces: "",
        storage: true
    },
    //emballage
    "CAR-SEP": {
        container: "EMBALLAGE",
        nbPieces: "600",
        storage: false
    },
    //emballage
    "coin-car": {
        container: "EMBALLAGE",
        nbPieces: "1900",
        storage: false
    },
    "COL-CADENAS": {
        container: "collant",
        nbPieces: "",
        storage: false
    },
    "COL-LONG-2": {
        container: "collant",
        nbPieces: "",
        storage: false
    },
    "EMB-S3048": {
        container: "BOITE RACKING",
        nbPieces: "3750",
        storage: false
    },
    "EXF001-0190": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "EXF011-0375": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "EXF012-0200": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "EXS002-1910": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXS002-2425": {
        container: "bundle",
        nbPieces: "MINIMUM 500 LONG",
        storage: true
    },
    "EXS003-2775": {
        container: "bundle",
        nbPieces: "MAX 150 RACK",
        storage: true
    },
    "EXV001-1500": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV001-1720": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV001-1850": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV001-2600": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV001-3000": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV001-3703": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV005-3000": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV007-2810": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV007-2940": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV008-3000": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV011-6096": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "EXV012-3309": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV013-2048": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV013-2805": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV018-0960": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV018-2993": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV018-3250": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV029-2500": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "EXV029-2800": {
        container: "bundle",
        nbPieces: "",
        storage: true
    },
    "FA60-0001LA": {
        container: "bac1",
        nbPieces: 70.1511387163561,
        storage: true
    },
    "FI00-0004LA": {
        container: "bac1",
        nbPieces: 70.1511387163561,
        storage: true
    },
    "FI00-0005LA": {
        container: "bac1",
        nbPieces: 70.1511387163561,
        storage: true
    },
    "FI00-0006LA": {
        container: "bac1",
        nbPieces: 158.86542443064184,
        storage: true
    },
    "FI10-0015LP": {
        container: "bac1",
        nbPieces: 57.22505126452495,
        storage: true
    },
    "FI20-0002LP": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "FI20-0003LA": {
        container: "bac1",
        nbPieces: 70.1511387163561,
        storage: true
    },
    "FI20-0004LA": {
        container: "bac1",
        nbPieces: 26,
        storage: true
    },
    "FI20-0011LP": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "FI20-0012LP": {
        container: "bac1",
        nbPieces: 31,
        storage: true
    },
    "FI20-0013LP": {
        container: "bac1",
        nbPieces: 57.42857142857143,
        storage: true
    },
    "FI20-0015LP": {
        container: "bac1",
        nbPieces: 55,
        storage: true
    },
    "FI60-0009LP": {
        container: "bac1",
        nbPieces: 53.8961038961039,
        storage: true
    },
    "FI60-0011LP": {
        container: "bac1",
        nbPieces: 55,
        storage: true
    },
    "FI60-0012LP": {
        container: "bac1",
        nbPieces: 25,
        storage: true
    },
    "FI60-0013LP": {
        container: "bac1",
        nbPieces: 21,
        storage: true
    },
    "FI80-0005LP": {
        container: "bac1",
        nbPieces: 79.05430528375733,
        storage: true
    },
    "FI80-0006LP": {
        container: "bac1",
        nbPieces: 55,
        storage: true
    },
    "FI80-0007LP": {
        container: "bac1",
        nbPieces: 40,
        storage: true
    },
    "FI80-0008LP": {
        container: "bac1",
        nbPieces: 50,
        storage: true
    },
    "FI80-0009LP": {
        container: "bac2",
        nbPieces: 22,
        storage: true
    },
    "FI80-0010LP": {
        container: "bac1",
        nbPieces: 43,
        storage: true
    },
    "FI80-0011LP": {
        container: "bac2",
        nbPieces: 25,
        storage: true
    },
    "FI80-0012LP": {
        container: "bac1",
        nbPieces: 79.05430528375733,
        storage: true
    },
    "FI80-0013LP": {
        container: "bac1",
        nbPieces: 23,
        storage: true
    },
    "FI80-0014LA": {
        container: "bac1",
        nbPieces: 97.62672811059907,
        storage: true
    },
    "FI80-0015LA": {
        container: "bac1",
        nbPieces: 87.18578408562121,
        storage: true
    },
    "FOAM-P2": {
        container: "TABLE TS",
        nbPieces: "NA",
        storage: false
    },
    "FP01-0012M": {
        container: "bac1",
        nbPieces: 12.9375,
        storage: true
    },
    "FP01-0015": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "FP01-0016": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "FX01-0001M": {
        container: "bac1",
        nbPieces: 28.571428571428573,
        storage: true
    },
    "MAIN150A-LA": {
        container: "customContainer",
        nbPieces: "unlimited",
        storage: false
    },
    "MAIN150A-RU": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "MAIN215B-LA": {
        container: "customContainer",
        nbPieces: "unlimited",
        storage: false
    },
    "MAIN215B-RU": {
        container: "customContainer",
        nbPieces: "unlimited",
        storage: false
    },
    "MAIN215C-LA": {
        container: "customContainer",
        nbPieces: "unlimited",
        storage: false
    },
    "MAIN215C-RU": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "MAIN215D-LA": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "MAIN215D-RU": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "MAIN261A-LA": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "MAIN261A-RU": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "MAIN261B-LA": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "MAIN261B-RU": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "MAIN295A-LA": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "MAIN295A-RU": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "NEOSOLID": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "NEOSOLID-2''x1/16''": {
        container: "RACKING A BOLT",
        nbPieces: "35",
        storage: false
    },
    //emballage
    "PAPIER-EMB": {
        container: "EMBALLAGE",
        nbPieces: "40",
        storage: false
    },
    "PA-YYLP-001U": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: false,
        checkup: true,
    },
    "PI-FXLP-009U": {
        container: "",
        nbPieces: "",
        storage: false,
        checkup: true,
    },
    "POICA-5''": {
        container: "RACKING",
        nbPieces: "1000",
        storage: false,
        checkup: true,
    },
    "PU-0001S-2": {
        container: "collant",
        nbPieces: "",
        storage: false,
        checkup: true,
    },
    "PU-0001SC": {
        container: "",
        nbPieces: "",
        storage: false,
        checkup: true,
    },
    "QPYY-4.0-001": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "QPYY-4.0-003": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "RUBAN-BELL2": {
        container: "",
        nbPieces: "",
        storage: false,
        checkup: true
    },
    "SAC-3X5": {
        container: "AU DESUS DU RACK A BOULON",
        nbPieces: "600",
        storage: false
    },
    "SAC-EMB-ZIP": {
        container: "AU DESUS DU RACK A BOULON",
        nbPieces: "600",
        storage: false
    },
    "SAC-SEO": {
        container: "AU DESUS DU RACK A BOULON",
        nbPieces: "1100",
        storage: false
    },
    "SEA205-004323": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEA205-005012": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEA205-005036": {
        container: "bac1",
        nbPieces: "singlebac",
        storage: false
    },
    "SEA205-005147": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: false
    },
    "SEA210-004226": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    //axe avec bras pivot (long)
    "SEA210-004249": {
        container: "customShelf",
        nbPieces: "",
        storage: false,
        checkup: true
    },
    "SEA210-004262": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEA210-0D3031": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    //axe avec bras pivot TE
    "SEA210-0D4244": {
        container: "customShelf",
        nbPieces: "",
        storage: false,
        checkup: true,
    },
    "SEA215-003011": {
        container: "customShelf",
        nbPieces: "",
        storage: false,
        checkup: true,
    },
    "SEA215-005048": {
        container: "customShelf",
        nbPieces: "",
        storage: false,
        checkup: true,
    },
    "SEA215-005071": {
        container: "customshelf",
        nbPieces: "",
        storage: false,
        checkup: true,
    },
    "SEA215-0D3012": {
        container: "customShelf",
        nbPieces: "",
        storage: false,
        checkup: true,
    },
    "SEA215-0G3012": {
        container: "customShelf",
        nbPieces: "",
        storage: false,
        checkup: true
    },
    "SEA220-003288": {
        container: "bUs",
        nbPieces: "",
        storage: false,
        drop: true
    },
    "SEA220-003291": {
        container: "bUs",
        nbPieces: "",
        storage: false,
        drop: true
    },
    "SEA220-003292": {
        container: "bUs",
        nbPieces: "",
        storage: false,
        drop: true
    },
    "SEA225-003793": {
        container: "customShelf",
        nbPieces: "",
        storage: false,
        checkup: true
    },
    "SEA240-002499": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEA240-002500": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEA240-002501": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEA240-002502": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEA240-002503": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEA240-002504": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEA240-005047": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEA245-0D3051": {
        container: "extrusionUsine",
        nbPieces: "",
        storage: false,
        checkup: true,
    },
    "SEA245-0G3051": {
        container: "extrusionUsine",
        nbPieces: "",
        storage: false,
        checkup: true,
    },
    "SEA250-005100": {
        container: "extrusionUsine",
        nbPieces: "",
        storage: false
    },
    "SEA255-004301": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEA255-E04301": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEA260-005081": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    //TS-59 fini? 
    "SEA270-003644": {
        container: "",
        nbPieces: "",
        storage: false,
        checkup: true
    },
    "SEA285-005074": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEA285-0D3597": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEA285-0G3597": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEMV-3000A": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO205-001530": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO205-004420": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO205-004690": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO205-004840": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO205-004960": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO205-005018": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO205-005019": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO205-005111": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO205-005123": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO205-005128": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO205-005131": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO205-005132": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO-3490-A": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO-3490-B": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO-3830": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO-4010": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO-4010-M": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO-4030": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEO-4090": {
        container: "bac2",
        nbPieces: "singlebac",
        storage: false
    },
    "SEO-4180": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO-4190": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO-4190-M": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO-4200": {
        container: "PALETTE",
        nbPieces: "10 KIT",
        storage: false
    },
    "SEO-4250": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO-4292": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO-4300": {
        container: "",
        nbPieces: "10 KIT",
        storage: false
    },
    "SEO-4360": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO-4430": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO-4470": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO-4480": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO-4580": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO-4590": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO-4650": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO-4650-M": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEO-4660": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEP110-001002": {
        container: "collant",
        nbPieces: "",
        storage: false
    },
    "SEP110-001004": {
        container: "collant",
        nbPieces: "",
        storage: false
    },
    "SEP110-001009": {
        container: "collant",
        nbPieces: "",
        storage: false
    },
    "SEP110-001015": {
        container: "collant",
        nbPieces: "",
        storage: false
    },
    "SEP110-001016": {
        container: "collant",
        nbPieces: "",
        storage: false
    },
    "SEP110-001018": {
        container: "collant",
        nbPieces: "",
        storage: false
    },
    "SEP120-180640": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP130-004261": {
        container: "bac1",
        nbPieces: 225,
        storage: false
    },
    "SEP130-004262": {
        container: "bac1",
        nbPieces: "singlebac",
        storage: false
    },
    "SEP130-0L4272": {
        container: "bac1",
        nbPieces: 1250,
        storage: true
    },
    "SEP200-004297": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP200-004301": {
        container: "bac1",
        nbPieces: 75,
        storage: true
    },
    "SEP205-004316": {
        container: "bac1",
        nbPieces: 357,
        storage: true
    },
    "SEP205-004344": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP205-004375": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP205-004376": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP205-004381": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP205-004382": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP205-004384": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP205-004385": {
        container: "bUs",
        nbPieces: 10,
        storage: false
    },
    "SEP205-004387": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP205-004404": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP205-004407": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP205-004411": {
        container: "bac1",
        nbPieces: 250,
        storage: true
    },
    "SEP205-004453": {
        container: "bac1",
        nbPieces: 59,
        storage: true
    },
    "SEP205-004459": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP205-004460": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP205-004461": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP205-004477": {
        container: "bac1",
        nbPieces: "250",
        storage: true
    },
    "SEP205-005013": {
        container: "bac1",
        nbPieces: 92,
        storage: true
    },
    "SEP205-005014": {
        container: "bac1",
        nbPieces: 357,
        storage: true
    },
    "SEP205-005015": {
        container: "bac1",
        nbPieces: 833,
        storage: true
    },
    "SEP205-005016": {
        container: "bac1",
        nbPieces: 84,
        storage: true
    },
    "SEP205-005031": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP205-005154": {
        container: "bac1",
        nbPieces: "singlebac",
        storage: false
    },
    "SEP205-0L4430": {
        container: "bac1",
        nbPieces: "400",
        storage: true
    },
    "SEP210-004306": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP210-004311": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP210-004313": {
        container: "bac1",
        nbPieces: 54,
        storage: true
    },
    "SEP210-004316": {
        container: "bac1",
        nbPieces: 56,
        storage: true
    },
    "SEP210-004332": {
        container: "bac2",
        nbPieces: 17,
        storage: false,
        checkup: true
    },
    "SEP210-004345": {
        container: "bUs",
        nbPieces: 100,
        storage: false
    },
    "SEP210-005058": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP215-004308": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP215-004309": {
        container: "",
        nbPieces: "",
        storage: false,
        checkup: true,
    },
    "SEP220-004292": {
        container: "",
        nbPieces: "",
        storage: false,
        chcekcup: true,
    },
    //cover porte supper escabeau arriere
    "SEP230-003659": {
        container: "customContainer",
        nbPieces: "",
        storage: false,
        checkup: true
    },
    "SEP240-004293": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP240-004297": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP240-004308": {
        container: "bac1",
        nbPieces: 62,
        storage: true
    },
    "SEP240-004309": {
        container: "bac1",
        nbPieces: 52,
        storage: true
    },
    "SEP240-004310": {
        container: "bac1",
        nbPieces: 55,
        storage: true
    },
    "SEP240-004312": {
        container: "bac1",
        nbPieces: 26,
        storage: true
    },
    "SEP240-004313": {
        container: "bac1",
        nbPieces: 31,
        storage: true
    },
    "SEP250-004354": {
        container: "bUs",
        nbPieces: 200,
        storage: false
    },
    "SEP250-004360": {
        container: "bUs",
        nbPieces: 100,
        storage: false
    },
    "SEP250-004362": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP2502": {
        container: "bac1",
        nbPieces: 335,
        storage: true
    },
    "SEP2503": {
        container: "bac1",
        nbPieces: 442,
        storage: true
    },
    "SEP2504": {
        container: "bac2",
        nbPieces: 42,
        storage: true
    },
    "SEP2505": {
        container: "bac2",
        nbPieces: 28,
        storage: true
    },
    "SEP2506": {
        container: "customContainer",
        nbPieces: "130",
        storage: false
    },
    "SEP2507": {
        container: "customContainer",
        nbPieces: "130",
        storage: false
    },
    "SEP2508": {
        container: "bac1",
        nbPieces: 71,
        storage: true
    },
    "SEP2509-LA": {
        container: "bac1",
        nbPieces: 129,
        storage: true
    },
    "SEP2511-LA": {
        container: "bac1",
        nbPieces: "130",
        storage: true
    },
    "SEP2512": {
        container: "bac1",
        nbPieces: 999,
        storage: true
    },
    "SEP2513-LA": {
        container: "bac1",
        nbPieces: 116,
        storage: true
    },
    "SEP2514-LA": {
        container: "customContainer",
        nbPieces: "130",
        storage: false
    },
    "SEP2515": {
        container: "bac1",
        nbPieces: 75,
        storage: true
    },
    "SEP2516": {
        container: "bUs",
        nbPieces: 40,
        storage: false
    },
    "SEP2517": {
        container: "bac1",
        nbPieces: 31,
        storage: true
    },
    "SEP2521": {
        container: "customContainer",
        nbPieces: "60",
        storage: false
    },
    "SEP2522": {
        container: "bUs",
        nbPieces: 15,
        storage: false
    },
    "SEP2523": {
        container: "bac1",
        nbPieces: "60",
        storage: true
    },
    "SEP2526": {
        container: "bac1",
        nbPieces: 220.2,
        storage: true
    },
    "SEP2527": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP2533": {
        container: "bac2",
        nbPieces: 36,
        storage: true
    },
    "SEP2534": {
        container: "bac1",
        nbPieces: 56,
        storage: true
    },
    "SEP2538": {
        container: "bac2",
        nbPieces: 11.366666666666667,
        storage: true
    },
    "SEP2543": {
        container: "bUs",
        nbPieces: 10,
        storage: false
    },
    "SEP255-004263": {
        container: "RACKING ORANGE",
        nbPieces: "",
        storage: false,
        checkup: true,
    },
    "SEP255-004337": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP255-004338": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP255-004339": {
        container: "customContainer",
        nbPieces: "600",
        storage: false
    },
    "SEP255-004377": {
        container: "bac1",
        nbPieces: "30",
        storage: true
    },
    "SEP260-004341": {
        container: "bac1",
        nbPieces: "220",
        storage: true
    },
    "SEP260-004376": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP260-004378": {
        container: "bac2",
        nbPieces: 102.4315151556212,
        storage: true
    },
    "SEP260-004394": {
        container: "bac2",
        nbPieces: 46,
        storage: true
    },
    "SEP260-004396": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP260-004398": {
        container: "customContainer",
        nbPieces: "600",
        storage: false
    },
    "SEP260-004415": {
        container: "bac1",
        nbPieces: 523.1076254826255,
        storage: true
    },
    "SEP260-004436": {
        container: "bac1",
        nbPieces: 54.80848409232689,
        storage: true
    },
    "SEP260-005039": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP260-005041": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP260-005042": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP260-005052": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP260-005053": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP260-005054": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP260-005089": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP260-0D4354": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP260-0D4379": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP260-0D4456": {
        container: "bac2",
        nbPieces: 22,
        storage: true
    },
    "SEP260-0D4459": {
        container: "bac2",
        nbPieces: 20,
        storage: false
    },
    "SEP260-0G4379": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP260-0G4456": {
        container: "bac2",
        nbPieces: 22,
        storage: true
    },
    "SEP260-0G4459": {
        container: "bac2",
        nbPieces: 20,
        storage: false
    },
    "SEP260-0L4429": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP260-0L4435": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP270-005059": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP270-005062": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP275-004264": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP275-004266": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP280-004228": {
        container: "bac1",
        nbPieces: 2264,
        storage: true
    },
    "SEP280-004344": {
        container: "bac1",
        nbPieces: "4500",
        storage: false
    },
    "SEP280-004357": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP280-004358": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP280-004369": {
        container: "bac2",
        nbPieces: "250",
        storage: true
    },
    "SEP280-004382": {
        container: "bac1",
        nbPieces: "250",
        storage: false
    },
    "SEP280-005043": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP280-005051": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP280-005061": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP280-005063": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP285-004291": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP285-004292": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "SEP285-004296": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP285-005055": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP285-0L4289": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3001": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP3002": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP3005": {
        container: "bUs",
        nbPieces: 40,
        storage: false
    },
    "SEP3012": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP3013": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP3018-LA": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3027": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3049": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3069-LA": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3071": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3073": {
        container: "bac2",
        nbPieces: 113,
        storage: true
    },
    "SEP3074": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3134": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3135": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3154": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP3175": {
        container: "bac1",
        nbPieces: "",
        storage: false
    },
    "SEP3207": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3208": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3215": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3217": {
        container: "bac2",
        nbPieces: 26,
        storage: false
    },
    "SEP3218": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3232": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3261": {
        container: "bac1",
        nbPieces: 72,
        storage: true
    },
    "SEP3275": {
        container: "bac1",
        nbPieces: "5500",
        storage: false
    },
    "SEP3276": {
        container: "bUs",
        nbPieces: 100,
        storage: false
    },
    "SEP3281": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3282": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3287": {
        container: "bac1",
        nbPieces: 200,
        storage: true
    },
    "SEP3295": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3297": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3306": {
        container: "restant",
        nbPieces: "",
        storage: false
    },
    "SEP3322": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP3323-LA": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3324": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3326": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3327": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3329": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3359": {
        container: "bac1",
        nbPieces: 126,
        storage: true
    },
    "SEP3411": {
        container: "bac1",
        nbPieces: 51,
        storage: true
    },
    "SEP3441": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3442": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3451": {
        container: "bac1",
        nbPieces: "125",
        storage: true
    },
    "SEP3457": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3458": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3459": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3461": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3464-LA": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3467": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP3469-LA": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3471": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP3472": {
        container: "bac1",
        nbPieces: "10500",
        storage: true
    },
    "SEP3476": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP3491": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3516": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3518": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3519": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3520": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3523": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3525": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP3526": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3529": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3531": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3534": {
        container: "bac2",
        nbPieces: 999,
        storage: false
    },
    "SEP3537": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP3538": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3539": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3541": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3542": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3544": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3550": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3553": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3554": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3555": {
        container: "bac1",
        nbPieces: 120,
        storage: true
    },
    "SEP3556": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3558": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3559D": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3559G": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3560": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3561": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3562": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3568": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3573": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3574": {
        container: "bac2",
        nbPieces: 'singleBac',
        storage: false
    },
    "SEP3591": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3595": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3601": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3602": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3603": {
        container: "bUs",
        nbPieces: 25,
        storage: false
    },
    "SEP3604": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3608": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP3614G": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3658": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3745": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3746": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3747": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP3761": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP3761M6": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP3762": {
        container: "bac1",
        nbPieces: 43,
        storage: true
    },
    "SEP3763": {
        container: "bac1",
        nbPieces: 50,
        storage: true
    },
    "SEP3765": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3773": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP3774": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP3776": {
        container: "bac1",
        nbPieces: 108,
        storage: true
    },
    "SEP3777": {
        container: "bac2",
        nbPieces: 20,
        storage: true
    },
    "SEP3779": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3779D": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3779G": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3781D": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3781G": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3781-LA": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3782": {
        container: "bac1",
        nbPieces: 64,
        storage: true
    },
    "SEP3783": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3784": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3786": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3788": {
        container: "bac1",
        nbPieces: 216,
        storage: false
    },
    "SEP3793": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP3794": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3795": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3796": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3797": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3798": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3799": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3801": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3803": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3807-LA": {
        container: "bac1",
        nbPieces: "250",
        storage: true
    },
    "SEP3808": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3822": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3828": {
        container: "bac1",
        nbPieces: 22,
        storage: true
    },
    "SEP3829": {
        container: "bac1",
        nbPieces: "24",
        storage: true
    },
    "SEP3834": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3838": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3839G": {
        container: "bac2",
        nbPieces: 999,
        storage: false
    },
    "SEP3839-LA": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3847": {
        container: "bac1",
        nbPieces: "24",
        storage: true
    },
    "SEP3848": {
        container: "bac1",
        nbPieces: "125",
        storage: true
    },
    "SEP3853": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3854": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3855": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3856": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3857": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3858": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3863": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3865": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP3866": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP3871": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP3903": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3904": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3905": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3918": {
        container: "bac1",
        nbPieces: 122,
        storage: true
    },
    "SEP3919": {
        container: "bac1",
        nbPieces: "125",
        storage: true
    },
    "SEP3920": {
        container: "bac1",
        nbPieces: 66,
        storage: true
    },
    "SEP3921D": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3921G": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3922": {
        container: "bac1",
        nbPieces: 27,
        storage: true
    },
    "SEP3922-LA": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3923": {
        container: "customContainer",
        nbPieces: "",
        storage: false
    },
    "SEP3926": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3934": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3935": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3936": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3944": {
        container: "bac1",
        nbPieces: 50,
        storage: true
    },
    "SEP3945": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3946-LA": {
        container: "bac1",
        nbPieces: "175",
        storage: true
    },
    "SEP3948": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3953": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3954": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3955-LA": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP3961-LA": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3962": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3963": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3964-LA": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3972": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3978": {
        container: "bac1",
        nbPieces: 128,
        storage: true
    },
    "SEP3979": {
        container: "bac1",
        nbPieces: 161,
        storage: true
    },
    "SEP3980": {
        container: "bac1",
        nbPieces: 62,
        storage: true
    },
    "SEP3981": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: false
    },
    "SEP3982": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP3986": {
        container: "bac1",
        nbPieces: 66,
        storage: true
    },
    "SEP3987": {
        container: "bac1",
        nbPieces: 93,
        storage: true
    },
    "SEP4021": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4022": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4034": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4036-D": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4036-G": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4038": {
        container: "bac1",
        nbPieces: "",
        storage: false
    },
    "SEP4040": {
        container: "bac1",
        nbPieces: 96,
        storage: false
    },
    "SEP4043-LA": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4046": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4056": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP4057": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4058": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4059": {
        container: "bac1",
        nbPieces: "1500",
        storage: true
    },
    "SEP4061-D": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4061-G": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4061-LA": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4063": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4064": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4065": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4067": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4068": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4070": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4075": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4077": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4078": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4079": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4083": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4084": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4085": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4088": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4092": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4093": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4095": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4114": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP4114M6": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP4114M6A": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP4118": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4119-LA": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4120": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4121": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP4135": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4136": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4137": {
        container: "bac1",
        nbPieces: 120,
        storage: true
    },
    "SEP4138": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4139": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4147-LA": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4178": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4179": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4181-LA": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4182G": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4183": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP4187": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4188": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4189": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4193": {
        container: "bac2",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4195": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4198": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4199": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4201": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4202-D": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4202-G": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4212-M3": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP4213": {
        container: "bUs",
        nbPieces: 20,
        storage: false
    },
    "SEP4251": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP4262": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4263": {
        container: "bUs",
        nbPieces: "",
        storage: false
    },
    "SEP4266": {
        container: "bac1",
        nbPieces: 71,
        storage: true
    },
    "SEP4287": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4294": {
        container: "bac1",
        nbPieces: "singleBac",
        storage: true
    },
    "SEP4305": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4321-D": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4321-G": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4323-D": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4323-G": {
        container: "bac2",
        nbPieces: "bac2FromBac1",
        storage: true
    },
    "SEP4325": {
        container: "bac1",
        nbPieces: 84.94910337552741,
        storage: true
    },
    "SEP4333-D": {
        container: "bUs",
        nbPieces: 20,
        storage: false
    },
    "SEP4333-G": {
        container: "bUs",
        nbPieces: 20,
        storage: false
    },
    "SEP4636": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "TAPEVENOM": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "TAP-VHB": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "TD4 PVC": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "TD6 PVC": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "TIGEUHMW": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "TO-CT-2": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "TO-ET-2": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "TO-ET-3": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "WRAP 14\"": {
        container: "",
        nbPieces: "",
        storage: false
    },
    "WRAP 3\"": {
        container: "",
        nbPieces: "",
        storage: false
    }
}

module.exports = storageData