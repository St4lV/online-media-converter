FROM node:26-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY . .

RUN apt update && apt upgrade -y && apt install -y ffmpeg curl unzip python3 python3-pip
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app/node
RUN printf "EXPRESS_PORT=%s\nEXPRESS_PUBLIC_ROUTE=%s\nEXPRESS_API_VERSION=%s\nRUNTIME_ENV=%s" 3000 "api/v1" 1 PRODUCTION > .env
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start"]