FROM node:trixie-slim

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY . .

RUN apt update && apt upgrade -y && apt install -y ffmpeg curl unzip python3 pipx

RUN curl -L -o ytdlp.zip https://github.com/yt-dlp/yt-dlp/archive/refs/heads/master.zip
RUN unzip ytdlp.zip
RUN rm ytdlp.zip
RUN printf "EXPRESS_PORT=%s\nEXPRESS_PUBLIC_ROUTE=\"%s\"\n" 3000 "api/v1" > node/.env
RUN pipx install yt-dlp-ejs

WORKDIR /app/node
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start"]