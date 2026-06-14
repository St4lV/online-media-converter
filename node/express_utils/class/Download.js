const SSHCommand = require("./SSHCommand");
const { runtime } = require("../env-values-dictionnary");
const os = require('os');
const path = require('path');

class Download {
	constructor(url, format = "none", quality = "best", audio_only = false) {
		this.url = url || "none";
		this.format = format || "none";
		this.quality = quality || "best";
		this.audio_only = audio_only || false;
		
		this._yt_dlp_exec_path = runtime.environment === "DEV" ? path.join(os.homedir(), '.local', 'bin', 'yt-dlp') : "/usr/local/bin/yt-dlp"
	}
	async start() {
		const format = this.format === "mp4" ? "b[ext=mp4]" : this.format;
		if (this.url === "none") {
			return { code: 400, data: "url field should not be empty" }
		}
		const codec = this.audio_only ? "mp3" : "mp4";
		const args = [
			"-P", "../node/downloaded",
			this.url,
			"--js-runtimes", "node",
			"-f", format,
			"-t", codec,
			"--embed-metadata",
		];
		if (runtime.environment === "DEV"){
			args.push("--cookies-from-browser", "firefox");
		}
		const dl = new SSHCommand(this._yt_dlp_exec_path, args);
		const result = await dl.execute();
		return { code: 201, data: result.data };
	}

	async getData() {
		const args = ["--flat-playlist", "--dump-single-json", "--js-runtimes", "node", this.url];
		const cmd = new SSHCommand(this._yt_dlp_exec_path, args);
		const result = await cmd.execute();
		return { code: result.code, data: JSON.parse(result.data.stdout.split('\n')[0])};
	}
}
module.exports = Download;