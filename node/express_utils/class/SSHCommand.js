class SSHCommand {

    constructor (c){
        this.command = c;
    }

    async execute(){
        try {
            const subProcess = require('child_process')
            subProcess.exec(this.command, (err, stdout, stderr) => {
            if (err) {
                console.error(err)
                process.exit(1)
            } else {
                console.log(`The stdout Buffer from shell: ${stdout.toString()}`)
                console.log(`The stderr Buffer from shell: ${stderr.toString()}`)
            }
            })
            return {code:200,data:"Success"}
        } catch (err) {
            const pjson = require('../../package.json');
            console.error(`[${pjson.name}@${pjson.version}] `+data)
            return {code:500,data:err}
        }
        
    }
}

module.exports = SSHCommand;