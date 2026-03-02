FROM node:20-bullseye

# Install Chromium dependencies
RUN apt-get update && \
    apt-get install -y libnss3 libatk1.0-0 libcups2 libxss1 libxcomposite1 \
    libxdamage1 libxrandr2 libasound2 libgbm1 \
    libpangocairo-1.0-0 libpango-1.0-0 libglib2.0-0 libgtk-3-0 \
    fonts-liberation libappindicator3-1 xdg-utils wget && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npx playwright install

COPY . .

EXPOSE 5000
CMD ["node", "server/server.js"]