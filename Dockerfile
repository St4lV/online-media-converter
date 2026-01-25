FROM node:trixie-slim

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY . .

RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
CMD ["./node/npm", "run", "start"]