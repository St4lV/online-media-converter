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

        const file_name_dot_array = this.file_name.split(".")
        let new_file_name = "";
        for (let i = 0;i<file_name_dot_array.length-1;i++){
            new_file_name += file_name_dot_array[i]+"."
        }
        new_file_name+=new_format
        log.data(`Converting file : ${this.file_name} to ${new_format} ..`);

        const cmd = `ffmpeg -i "./downloaded/${this.file_name}" "./downloaded/${new_file_name}"`
        log.data(cmd)

        const ssh = new SSHCommand(cmd);
        const result = ssh.execute();
        
        return result;
    }

}

module.exports = Convert;