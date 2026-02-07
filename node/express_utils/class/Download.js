const SSHCommand = require("./SSHCommand");
const { parseYtDlpFormatQuery } = require("../utils")
class Download {
    constructor(url,format="none",quality="best",audio_only=false){
        this.url = url || "none";
        this.format = format || "none";
        this.quality = quality || "best";
        this.audio_only = audio_only || false;
    }

    async start(){
        const format = this.format === "mp4" ? "b[ext=mp4]" : this.format;
        //console.log(this.url,this.format,this.quality,this.audio_only)
        if (this.url === "none"){
            return {code : 400,data:"url field should not be empty"}
        }
        const codec = this.audio_only ? "mp3" : "mp4";
        const command = (`../yt-dlp-master/./yt-dlp.sh -P ../node/downloaded ${this.url} --js-runtimes node --remote-components ejs:github -f ${format} -t ${codec}`/*+" --cookies-from-browser firefox"*/).toString();
        const dl = new SSHCommand(command);
        const result = await dl.execute();
        return {code:201,data:result.data};
    }

    async getFormat(){
        const command = ("../yt-dlp-master/./yt-dlp.sh "+this.url+" --list-formats").toString();

        const dl = new SSHCommand(command);
        const result = await dl.execute();
        if (result.code!==200){
            return result
        } else {
            const to_send = parseYtDlpFormatQuery(result.data.stdout);
            return {code:(to_send?.formats?.length>0 ? 200 : 500),data:to_send};
        }
            
        
    }
}

module.exports = Download;