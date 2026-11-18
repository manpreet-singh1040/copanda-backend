
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./

RUN npm ci --omit=dev \
    && npm cache clean --force

# Copy worker source
COPY index2.js ./worker.js

RUN mkdir -p /var/run/daemon

# Run as non-root
USER node

CMD ["node", "worker.js"]