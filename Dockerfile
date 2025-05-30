# Dockerfile cho Tinder Tool
FROM node:18

# Tạo thư mục app
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install --production

# Copy toàn bộ mã nguồn
COPY . .

# Expose cổng (dùng biến môi trường PORT, mặc định 3000)
EXPOSE ${PORT:-3000}

# Chạy app
CMD ["sh", "-c", "node src/server.js"] 