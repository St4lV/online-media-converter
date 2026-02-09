
const pjson = require('../../package.json');
const subProcess = require('child_process');

class SSHCommand {

    constructor (c){
        this.command = c;
    }

    async execute(){
        return new Promise((resolve, reject) => {
            subProcess.exec(this.command, (err, stdout, stderr) => {
                if (err) {
                    console.error(`[${pjson.name}@${pjson.version}] ${err}`);
                    resolve({ code: 500, data: stderr.toString() });
                } else {
                    resolve({
                        code: 200,
                        data: {
                            stdout: stdout.toString(),
                            stderr: stderr.toString()
                        }
                    });
                }
            });
        });
    }

}
module.exports = SSHCommand;