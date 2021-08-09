# On veut:
1. Consommation anuelle
2. Consommation mensuelle moyenne (court, moyen, long terme)
3. Consommation mensuelle maximale (quel mois pour chaque année)
4. Consommation mensuelle minimale (quel mois pour chaque année)

# Structure
- Input commande (pièces commandées, quantitée, date, fournisseur)
    - Plusieurs fichiers d'entrée
    

# Shit to do
- implement store, item pour organiser les choses


- Classification pour avoir le bac dans lequel chaque piece est placee

# BAC ET NOMBRE DE PIECES:
 - classe C, 1 seul bac (si faible consommation)
 - classer bac directement selon les dimensions des pieces pour bracket, ancrages, etc


    # TYPES DE CONTENANT STORAGE
    - bundle
    - palette
    - bac (1, 2)
    - boite fournisseur?
    - bundle BT et corne (dimensions??)
    - mains etageres
    - etageres!!!

## TO DO
- new shelf distribution
- fix bundle (bundle seems fiexd)
- palette
- fix double sided shelves with only 1 container on back side 
- priority category
- have same length shelf for same things



## TO DO 2021-08-09
- custom shelf
- entrer infos liste
- optimize bundle length vs shelf length for small bundle


CONTINER STORAGEDATA




## Optimization problem
max accessHeight for bac in racking
place bundle over bac
- variables height & accessHeight
const limitBac = number


FAIRE FICHIER CONSTANTES POUR REGLAGES CHARGE, HAUTEUR, VARIABLES ALGO

placeBundleOverBac(){
    si accessHeight du plus haut element > limit 
        checker le plus haut element (height + accessHeight) et place au dessus
    else
        placer au dessus de limit
}
placeBac(){
    checker place entre 0 et limite, comp avec height du shelf

}

deal with 2accessSides
accessSide
    - bac : 1 seul accessSide lorsque mainType === mixed
    - bundle: 1 seul access Side
    access shelf on different sides for bundle and bac on mixed racking

mainType form racking (bac, bundle)
    - mainType === bac : bac uniquement
    - mainType === bundle : bundle uniquement 
    - mainType === mixed : bac et bundle possible over la limite accessHeight



# Shelf algorithm improvement:
- return number left ans position when containers doesn't all fit in shelf
- fix single container on back

# Problèmes parts
- CAR (emballage)
- collants
- EXF extrusions
- EXS extrusions
- EXV extrusions
- MAIN
- SEA

## IMPORTANT RANDOM SHIT TO DO
- masse extrusions
- dessins manquants
- bundle size bundle
 class (nbWidth, nbHeight)
- normaliser bundles

## Things that might be interesting
- group container of same size on shelf




## OU JE SUIS RENDU
- shelf.searchPlaceForBac
    - probleme est que les bac n'ont pas les bonnes coordonnées
        - probleme semble etre dans optimizeBloc (line 526), le offsetLength est toujours egal a zero








## Ce qu'on veut:
- Placer les items (bacs, palettes, bundles, autres) sur les étagères
- Optimiser le placement selon les critères suivants:
    - Optimiser selon l'importance des items
    - Optimiser de manière à prendre le moins de place possible
- Comment?
    - On check si les importantes fittent sur les shelf 500, 4000, etc et on fait les racking par la suite

# TO DO:
- Revérifier algorithmes
- INCERTITUDES
- min nbPieces par bac sinon palette


# Placement des pièces dans les bacs (algorithme):
- Si la pièce entre dans bac 1 elle va dans bac 1, sinon si elle entre dans bac 2 elle va dans bac 2.
- Si la qte estimée qui entre dans un bac 1 est inférieure à la quantité maximale necéssaire, on choisi bac 2
- Extrusions vont directement dans bundles
- Extrusions usinée qui entrent pas dans bac 2 vont dans leur catégorie
- Nombre de bac est déterminé avec qte maximale et nombre de pièces par bac ou charge maximale. Sinon, pour classe C et assemblages on prend 1 seul bac



# Importer fichiers
- générer PFEP
- générer industry
- push order dans pieces
- assigner fourniseurs à piece avec order
- BUG LORS DE L'AJOUT DE PIÈCE LORS DU CHANGEMENT DE SUPPLIER

# Notes Tests :
- TEST monthlyAve:
    - utiliser fichier testmonthlyAve.csv avec date de début 06-2020
    - Résultats:
        2 mois: [0, 25, 25, 25, 25, 25, 20]
        3 mois: [25, 25, 35, 40, 20]
        4 mois: [25, 50, 50, 20]
        5 mois: [50, 50, 45]
        6 mois: [50, 75, 20]
