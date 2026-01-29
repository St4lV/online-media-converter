const fs = require("fs");
const { URLize, log } = require("../utils");
const root = require("../../root")

class DownloadedFiles {
    constructor(){
        this._folder = './downloaded';
        this._files;
    }

    async getFiles(){
        try {
            const files = await fs.promises.readdir(this._folder);
            return {code: 200, data: files};
        } catch (err) {
            log.error(err)
            return {code: 500, data: 'Error while reading downloaded files'};
        }
    }

    async getByName(file_name){
        const file_response= await this.getFiles();
        this._files = file_response.data;
        let file_found = false;
        let file_path = "";
        for (let el of this._files){
            if (URLize(el) === URLize(file_name)){
                const path = require('path');
                file_path = path.resolve(root()+'/downloaded/'+el);
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

    }

    async rename(file){

    }
}

module.exports = DownloadedFiles;