FROM node:20.19.0

WORKDIR /app
COPY package*.json ./
RUN npm install --force --legacy-peer-deps && \
    chmod +x node_modules/.bin/next  # 显式添加 next 的执行权限

COPY . .
RUN npm run build
CMD ["npm", "start"]

EXPOSE 3000
