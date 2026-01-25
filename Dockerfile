FROM debian:trixie

WORKDIR /app

COPY . .

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["./node/npm", "run", "start"]