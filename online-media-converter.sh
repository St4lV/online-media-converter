#!/bin/bash

case "$1" in
    update)
        echo "Updating..."
        find . -type f ! -name "*.sh" -delete
        curl -L -o omc_app.zip https://github.com/St4lV/online-media-converter/archive/refs/heads/main.zip
        rm online-media-converter.sh
        unzip omc_app.zip -d ../
        rm omc_app.zip
        chmod +x online-media-converter.sh
        docker compose down
        docker container prune -f
        docker image prune -f
        docker build -t online-media-converter . # --no-cache
        rm -rf node Dockerfile README.md .dockerignore .gitattributes .gitignore
        echo "Updated successfully"
        ./online-media-converter.sh start
        ;;

    start)
        echo "Starting..."
        docker compose up --detach
        ;;

    stop)
        echo "Stopping..."
        docker compose down
        ;;

    install)
        echo "Installing dependencies"
        apt update
        apt-get install ca-certificates
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
        chmod a+r /etc/apt/keyrings/docker.asc

        # Add the repository to Apt sources:
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
          $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
          tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update
        apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
        echo ""

        echo "Installing Online Media Converter App..."
        mkdir downloaded
        docker build -t online-media-converter . # --no-cache
        rm -rf node Dockerfile README.md .dockerignore .gitattributes .gitignore
        ./online-media-converter.sh start
        ;;

    *)
        echo "Usage: $0 {start|stop|install|update}"
        exit 1
        ;;
esac