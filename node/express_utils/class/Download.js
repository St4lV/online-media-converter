const SSHCommand = require("./SSHCommand");

class Download {
    constructor(u,f,q){
        this.url = u || "none";
        this.format = f || "none";
        this.quality = q || "best";
    }

    async start(){
        const format = this.format !=="none"? "-t "+this.format:"-t best";
        const command = ("../yt-dlp-master/./yt-dlp.sh -P ../node/downloaded "+this.url+" --js-runtimes node --remote-components ejs:github --cookies-from-browser firefox "+format).toString();
        const dl = new SSHCommand(command);
        const result = await dl.execute();
        return result;
    }

    async getFormat(){
        const command = ("../yt-dlp-master/./yt-dlp.sh "+this.url+" --list-formats").toString();
        const dl = new SSHCommand(command);
        const result = await dl.execute();
        return result;
    }
}

module.exports = Download;