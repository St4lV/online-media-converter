# online-media-converter
 Selfhosted multimedia downloader and converter

Install & run app :
```bash
apt update
apt upgrade -y
apt install curl unzip
curl -L -o omc_app.zip https://github.com/St4lV/online-media-converter/archive/refs/heads/main.zip
unzip omc_app.zip -d /var/
rm omc_app.zip
cd /var/online-media-converter-main
chmod +x online-media-converter.sh
./online-media-converter.sh install
```