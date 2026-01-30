
const pjson = require('../../package.json');
class SSHCommand {

    constructor (c){
        this.command = c;
    }

    async execute(){
        return new Promise((resolve, reject) => {
            try {
                const subProcess = require('child_process')
                subProcess.exec(this.command, (err, stdout, stderr) => {
                if (err) {
                    console.log(`[${pjson.name}@${pjson.version}] `+err)
                    reject({ code: 500, data: err.message, stderr: stderr.toString() });
                } else {
                    resolve({ 
                        code: 200,
                        data : {
                            stdout: stdout.toString(), 
                            stderr: stderr.toString() 
                        }
                    });
                }
                });
                return {code:200,data:"Success"}
            } catch (err) {
                console.error(`[${pjson.name}@${pjson.version}] `+err)
                return {code:500,data:err}
            }
        
        })
    }

}
module.exports = SSHCommand;