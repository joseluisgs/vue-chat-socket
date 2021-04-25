# Imgen
FROM node:14-alpine

# Opcional Crear estos directorios garantizará que tengan los permisos deseados,
# lo que será importante al crear módulos de nodo locales en el contenedor con npm install.
# Además de crear estos directorios, estableceremos la propiedad sobre ellos a nuestro usuario node
# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# instalar un simple servidor http para servir nuestro contenido estático
RUN npm install -g http-server

# app como directorio de trabajo
WORKDIR /app

# copiar 'package.json' y 'package-lock.json' (si están disponibles)
COPY package*.json ./

# Instalamos las dependencias
RUN npm install
# Si es nuestro docker de producción, lo hacemos así
# RUN npm ci --only=production

# Bundle del código de la app, este es la parte opcional si no usar la línea posterior comentada
# COPY --chown=node:node . .
COPY . .

# Si queremos hacer el build aquí, si no deberíamos copiar solo el directorio /dist
RUN npm run build

# Exponemos el puerto del servidor
EXPOSE 8080

# Ejecutamos el comando en dist, pero en el resto del contenedor tenemos el resto de código (ver COPY)
CMD [ "http-server", "dist" ]

# Para subirla al registro, primero le ponemos una tag
# docker build -t joseluisgs/vue-chat-socket-client .
# Subirla:
# docker push joseluisgs/vue-chat-socket-client
# Ejecutarla: 
# docker run -it -p 8080:8080 --rm --name vue-chat-socket-client joseluisgs/vue-chat-socket-client