const fs = require("fs");
const path = require('path');
const { URLize, log } = require("../utils");
const root = require("../../root")

class DownloadedFiles {
    constructor(){
        this._folder = './downloaded';
        this._files;
    }

    async getFiles(){
        await this.getAvailableStorage()
        try {
            const files = await fs.promises.readdir(this._folder);
            const filesWithSize = await Promise.all(
                files.map(async (name) => {
                    const stats = await fs.promises.stat(path.join(this._folder, name));
                    return { name, size: stats.size };
                })
            );
            return { code: 200, data: filesWithSize };
        } catch (err) {
            log.error(err);
            return { code: 500, data: 'Error while reading downloaded files' };
        }
    }

    async getByName(file_name){
        const file_response= await this.getFiles();
        this._files = file_response.data;
        let file_found = false;
        let file_path = "";
        for (let el of this._files){
            if (URLize(el.name) === URLize(file_name)){
                const path = require('path');
                file_path = path.resolve(root()+'/downloaded/'+el.name);
                file_found=true;
                log.data("Found | ",file_path)
                return { code:200, data:file_path}
            }
        }

        if (!file_found){
            log.data(`File ${file_name} not found !`)
            return {code:404,data:`File ${file_name} not found !`}
        }
    }

    async removeByName(file_name){
        const exist = await this.getByName(file_name);
        if (exist.code!==200){
            return exist;
        }
        try {
            const result = await fs.promises.rm(exist.data)
            return {code: 200, data: result};
        } catch (err) {
            log.error(err);
            return {code: 500, data: 'Error while reading downloaded files'};
        }
    }

    async upload(file){
        const uploadPath = root() + "/downloaded/" + file.name;
        file.mv(uploadPath, function (err) {
            if (err) {
                console.log(err);
                return {code:500,data:err};
            } else {
                return {code:201,data:"Created"}
            }
        });
    }

    async rename(file_name,new_name){

    }

    async getAvailableStorage() {
    const stats = await fs.promises.statfs(root() + "/downloaded/");
    return {code: 200, data: stats };
    }
}

module.exports = DownloadedFiles;