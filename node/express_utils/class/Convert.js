const DownloadedFiles = require("./DownloadedFiles");
const SSHCommand = require("./SSHCommand");

const { log } = require("../utils")

class Convert {

    constructor(file_name){
        this.file_name = file_name
    }

    async start(new_format){
        
        const base_file_controller = new DownloadedFiles();
        const get_base_file = await base_file_controller.getByName(this.file_name);
        if (get_base_file.code!==200){
            return get_base_file;
        }

        const file = get_base_file.data.split("downloaded/")[-1];
        log.data(`Converting file : ${file} to ${new_format} ..`);

        const cmd = `ffmpeg -i downloaded/${this.file_name} -c ${this.file_name}.${new_format}`
        const ssh = new SSHCommand(cmd);
        const result = ssh.execute();
        
        return result;
    }

}

module.exports = Convert;