# Selfhosted multimedia downloader and converter

## Features :

### Complete web interface with file managment using [ffmpeg](https://github.com/FFmpeg/FFmpeg) and [yt-dlp](https://github.com/yt-dlp/yt-dlp).
- **Download** files and playlists from remote links
- **Convert** from server, from upload or directly from remote link 
- **QR Code generation**
- **yt-dlp** auto update *(everyday at 4:00 AM)*
- **Keep files** between app updates

**WARNING :** No account required to access file or use service, make sure the service is protected behind a VPN or is not exposed publicly.

---

## Installation (Debian/Ubuntu):

run on a Debian VM/LXC, no maintenance required.

### Install app

```bash
apt update
apt upgrade -y
apt install curl unzip -y
curl -L -o omc_app.zip https://github.com/St4lV/online-media-converter/archive/refs/heads/main.zip
unzip omc_app.zip -d /var/
rm omc_app.zip
cd /var/online-media-converter-main
chmod +x online-media-converter.sh
./online-media-converter.sh install
```

After build it should be available on your host on port `3000`

### Update app

Will update from repo, keeping hosted files.
This will also update **yt-dlp** but app update it automatically so you don't have run this command everytime a new update of **yt-dlp** is released

```bash
cd /var/online-media-converter-main
./online-media-converter.sh update
```
