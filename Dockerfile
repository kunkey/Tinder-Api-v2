# Dockerfile cho Tinder Tool
FROM node:18-alpine

# Tạo thư mục app
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Expose cổng (dùng biến môi trường PORT, mặc định 3000)
EXPOSE ${PORT:-3000}

# Chạy app
CMD ["node", "src/server.js"] 