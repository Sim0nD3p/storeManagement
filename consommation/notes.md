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
