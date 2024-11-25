# Projet Data-design

## Comment l'utiliser

Tout d'abord, assurez-vous d'avoir node.js (et npm).

Ensuite, clonez le projet, avec les sous-modules:

```bash
git clone https://github.com/TotoShampoin-IMAC3/datadesign-projet
git submodule update --init --recursive

cd datadesign-projet
```

et installez les dépendances avec:

```bash
npm install
```

Puis lancez le projet avec:

```bash
npm run dev
```

Et il sera hébergé sur [http://localhost:5173/](http://localhost:5173/).

Une recommendation:  
Si le compteur reste bloqué à x/1000, ouvrez l'inspecteur (F12), allez dans l'onglet "Network" ("Réseau"), et cochez "Disable cache" ("Désactiver le cache").
