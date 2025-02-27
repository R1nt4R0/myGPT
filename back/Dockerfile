# Utilise Node.js comme image de base
FROM node:18

# Définir le dossier de travail
WORKDIR /app

# Copier les fichiers
COPY package.json package-lock.json ./
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port
EXPOSE 5000

# Commande pour lancer l'API
CMD ["npm", "start"]
