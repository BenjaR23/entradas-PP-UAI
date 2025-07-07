FROM node:20


WORKDIR /app

# 1️⃣ Instala dependencias del package.json que está en la raíz
COPY package.json package-lock.json ./
RUN npm install

# 2️⃣ Copia lo necesario desde /src
COPY src/components ./components
COPY src/pages ./pages
COPY vite.config.ts ./vite.config.ts
COPY src/vite-env.d.ts ./vite-env.d.ts
COPY src/styles.css ./styles.css
COPY src ./src
# Copiar config.js desde la raíz del proyecto
COPY config.js ./config.js


# 3️⃣ Si tienes public/ o index.html en raíz, ajusta si es necesario
COPY public ./public
COPY index.html ./

EXPOSE 5173

CMD ["npm", "run", "dev"]
