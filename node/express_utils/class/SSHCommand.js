const pjson = require('../../package.json');
const { execFile } = require('child_process');

class SSHCommand {
	/**
	 * @param {string} binary
	 * @param {string[]} args
	 * @param {object} [options]
	 */
	constructor(binary, args = [], options = {}) {
		this.binary = binary;
		this.args = args;
		this.options = {
			timeout: 120000,
			maxBuffer: 50 * 1024 * 1024,
			...options
		};
	}

	async execute() {
		return new Promise((resolve) => {
			execFile(this.binary, this.args, this.options, (err, stdout, stderr) => {
				if (err) {
					console.error(`[${pjson.name}@${pjson.version}] ${err.message}`);
					resolve({ code: 500, data: stderr?.toString() || err.message });
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