# Projet Data-design

## Comment l'utiliser

Tout d'abord, assurez-vous d'avoir node.js avec npm, ainsi que Python 3.

Ensuite, clonez le projet, avec les sous-modules:

```bash
git clone https://github.com/TotoShampoin-IMAC3/datadesign-projet
cd datadesign-projet
git submodule update --init --recursive
```

Ensuite, mettez en place l'environnement Python en exécutant ce fichier:

```bash
./install.sh
```

Puis téléchargez et traitez les données:

```bash
./script.sh
```

Enfin, installez les dépendances pour node:

```bash
npm install
```

Puis lancez le projet:

```bash
npm run dev
```

Et il sera hébergé sur [http://localhost:5173/](http://localhost:5173/).
