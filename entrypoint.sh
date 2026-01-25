#!/bin/bash
express_port=3000
express_public_route="api/v1"

apt update && apt upgrade -y && apt install -y nodejs npm ffmpeg curl unzip

curl -L -o ytdlp.zip https://github.com/yt-dlp/yt-dlp/archive/refs/heads/master.zip
unzip ytdlp.zip
rm ytdlp.zip

printf "EXPRESS_PORT=%s\nEXPRESS_PUBLIC_ROUTE=\"%s\"\n" "$express_port" "$express_public_route" > node/.env
cd node && npm run start
exec "$@"