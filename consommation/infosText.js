const infos = {
    consomMensuelleMax: "La consommation mensuelle maximale est calculée de la manière suivante: la moyenne des achats totaux mensuels est faite selon la fréquence de réapprovisionnement moyenne. La plus grande moyenne mensuelle basée sur cette fréquence de réapprovisionnement est ensuite prise comme consommation mensuelle maximale. La formule est la suivante: (nombre de pièce commandées pour la durée de fréquence de réapprovisionnement moyenne) / (fréquence de réapprovisionnement moyenne)",
    frequenceReapprovisionnement: 'La fréquence de réapprovisionnement est calculée de la manière suivante: la moyenne de la durée entre chaque mois de commande',
    commandeTypique: 'La commande typique est calculée de la manière suivante: la moyenne des quantitées commandées pour chaque commande',
    consomAnnuelleMoy: "La consommation annuelle moyenne est calculée de la manière suivante: le total de pièce commandé pour les années sélectionnées divisé par le nombre d'année (l'année en cours est prise en compte de manière à ce que une moyenne faite à la mi-année utilise une division par 0.5)",
    consomMensuelleMoy: "La consommation mensuelle moyenne est calculée de la manière suivante: pour la période donnée, chaques mois est représenté par un objet qui contient le total des achats pour le mois. Ces objets sont ensuite regroupés selon la période sur laquelle la moyenne est basée. Pour une moyenne basée sur 3 mois, la moyenne est calculée pour chaque bloc de 3 mois ce qui permet de voir l'évolution de celle-ci dans le temps.",
    instructionsPart1: "Le PFEP dans le présent programme peux être généré à partir de tableaux excel obtenus entre autre par Acomba."
}

module.exports = infos;