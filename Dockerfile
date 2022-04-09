FROM node
WORKDIR /app
COPY package.json /app/
RUN npm install --legacy-peer-deps
COPY . /app/
EXPOSE 5000
CMD ["npm", "start"]