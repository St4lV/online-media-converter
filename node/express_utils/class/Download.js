const SSHCommand = require("./SSHCommand");

class Download {
    constructor(u,f,q){
        this.url = u || "none";
        this.format = f || "none";
        this.quality = q || "best";
    }

    async start(){
        const format = this.format !=="none"? "-f "+this.format:"-f best";
        const command = ("../yt-dlp-master/./yt-dlp.sh -P ../node/downloaded "+this.url+" --no-js-runtimes "+format).toString();
        const dl = new SSHCommand(command);
        const result = await dl.execute();
        return result;
    }

    async getFormat(){
        const command = ("../yt-dlp-master/./yt-dlp.sh "+this.url+"--list-formats").toString();
        const dl = new SSHCommand(command);
        const result = await dl.execute();
        return result;
    }
}

module.exports = Download;