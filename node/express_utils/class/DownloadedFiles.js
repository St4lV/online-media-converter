const fs = require("fs");
const { URLize } = require("../utils");
const root = require("../../root") 

class DownloadedFiles {
    constructor(){
        this.folder = './downloaded';
    }

    async getFiles(){
        try {
            const files = await fs.promises.readdir(this.folder);
            return {code: 200, data: files};
        } catch (err) {
            console.error(err);
            return {code: 500, data: 'Error while reading downloaded files'};
        }
    }

    async getByName(file_name){
        const files = await this.getFiles();
        let file_found = false;
        let file_path = "";
        for (let el of files.data){
            if (URLize(el) === URLize(file_name)){
                const path = require('path');
                file_path = path.resolve(root()+'/downloaded/'+el);
                file_found=true;
                console.log("Found | ",file_path)
                return { code:200, data:file_path}
            }
        }

        if (!file_found){
            console.log(`File ${file_name} not found !`)
            return {code:404,data:`File ${file_name} not found !`}
        }
    }
}

module.exports = DownloadedFiles;