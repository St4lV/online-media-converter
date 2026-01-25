FROM node:trixie-slim

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY . .

RUN apt update && apt upgrade -y && apt install -y ffmpeg curl unzip python3 python3-pip
RUN curl -L -o ytdlp.zip https://github.com/yt-dlp/yt-dlp/archive/refs/heads/master.zip
RUN unzip ytdlp.zip
RUN rm ytdlp.zip
RUN pip install -U yt-dlp-ejs --break-system-packages

WORKDIR /app/node
RUN printf "EXPRESS_PORT=%s\nEXPRESS_PUBLIC_ROUTE=\"%s\"\n" 3000 "api/v1" > .env
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start"]