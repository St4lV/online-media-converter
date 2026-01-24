const SSHCommand = require("./SSHCommand");

class Download {
    constructor(u,f,q){
        this.url = u || "none";
        this.format = f || "mp4";
        this.quality = q || "best";
    }

    async start(){
        const command = ("../yt-dlp-master/./yt-dlp.sh -P ../node/downloaded "+this.url).toString();
        const dl = new SSHCommand(command);
        const result = await dl.execute();
        return result;
    }
}

module.exports = Download;