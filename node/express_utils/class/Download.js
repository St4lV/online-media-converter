const SSHCommand = require("./SSHCommand");
const { parseYtDlpFormatQuery } = require("../utils")
class Download {
	constructor(url, format = "none", quality = "best", audio_only = false) {
		this.url = url || "none";
		this.format = format || "none";
		this.quality = quality || "best";
		this.audio_only = audio_only || false;
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
			"--remote-components", "ejs:github",
			"-f", format,
			"-t", codec,
			"--embed-metadata",
			"--cookies-from-browser", "firefox"
		];
		const dl = new SSHCommand("../yt-dlp-master/yt-dlp.sh", args);
		const result = await dl.execute();
		return { code: 201, data: result.data };
	}
	async getFormat() {
		const args = [this.url, "--list-formats"];
		const dl = new SSHCommand("../yt-dlp-master/yt-dlp.sh", args);
		const result = await dl.execute();
		if (result.code !== 200) {
			return result
		} else {
			const to_send = parseYtDlpFormatQuery(result.data.stdout);
			return { code: (to_send?.formats?.length > 0 ? 200 : 500), data: to_send };
		}
	}
	async isPlaylist() {
		const args = ["--flat-playlist", "--dump-json", this.url];
		const cmd = new SSHCommand("../yt-dlp-master/yt-dlp.sh", args);
		const result = await cmd.execute();
		console.log(result)
		return result;
	}
}
module.exports = Download;