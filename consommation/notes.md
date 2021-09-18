# On veut:
1. Consommation anuelle
2. Consommation mensuelle moyenne (court, moyen, long terme)
3. Consommation mensuelle maximale (quel mois pour chaque année)
4. Consommation mensuelle minimale (quel mois pour chaque année)

# Structure
- Input commande (pièces commandées, quantitée, date, fournisseur)
    - Plusieurs fichiers d'entrée
    

# SHIT TO DO
- systeme d'adressage
- changer dimensions customContainer et bUs

## MAGASIN
- menu magasin, voir shelf qte, etc
- definition adressage
    - menu pour entrer numero rack manuellement
    - A, B, C pour shelf
    - dist x=0
        ex.: 1A3.2
- placer pieces sur shelves fixes
- changer emplacement piece
- pre assign shelf racking priority, choseShelf would now chose shelf length base on priority
    - fill highest priority shelf (based on racking priority ans shelf height) then fill second highest priority shelf... etc.
    - keep shelf.type and racking.type in mind





## WHERE I AM
- find storage that have no dimensions
- adressage
- modifier adressage
- priorite fixe sur racking



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


# QUICK ALGO CHANGES
- matchPartToShelf || findPotentialShelf => only allow back if spaceRatio is over certain amount



## TO DO 2021-08-10
- optimizeRacking
- more control over accessSides
- RACK MANAGER ligner 457^^
- racking cornes
- VOIR rackManager ligne 370

--- DONE ---
- BUG PART NOT PLACED AFTER CREATING SHELF - DONE
- Check chose shelf height -> fix bug placeNewShelf() - DONE
- FUCKING BUNDLES - DONE
- racking BT - DONE
- entrer infos liste - DONE
- custom shelf - DONE
- racking mains - DONE

## FINAL LIST TO FINISH THE PROGRAM
- verif contenants - DONE -
- éliminer contentants sans dimensions (MAIN) 
- adressage - 10h clean - 
- export/import store to JSON - 8h semi clean - DONE - took like 3 days
- étagères fixes - 20h clean - 
- assign containers - 20h clean -
- possibilite d'ajouter une seule piece
- refaire fichePiece - 8h clean - 
- Fix bugs (see list below): - 16h clean -
    - creer piece -> afficher Piece = bug
    - still calling error when gen containers

- Notes on preassigned shelf priority
    - assign priority to racking and shelves
    - juste fill shelves first to priority
    On permet de bouger shelves dans racking ou pas


    







# Shelf algorithm improvement:
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
