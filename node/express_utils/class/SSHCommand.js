class SSHCommand {

    constructor (c){
        this.command = c;
    }

    async execute(){
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
    }

}

module.exports = SSHCommand;