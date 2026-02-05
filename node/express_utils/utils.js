function URLize(input){
  return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_")
}

const pjson = require('../package.json');
const log = {
    data(data){
      console.log(`[${pjson.name}@${pjson.version}] `+data)
    },
    error(data){
      console.error(`[${pjson.name}@${pjson.version}] `+data)
    }
}

const cron = require('node-cron');
const SSHCommand = require('./class/SSHCommand');
let app_updating = false;

async function cronTasks(){
  	app_updating = true;

	// Update of yt-dlp
	
	await cronCommand("0 4 * * *",async ()=>{
		log("Starting yt-dlp update..")
		const cmd  = "cd .. && apt update && apt upgrade -y && rm -rf yt-dlp-master && curl -L -o ytdlp.zip https://github.com/yt-dlp/yt-dlp/archive/refs/heads/master.zip && unzip ytdlp.zip && rm ytdlp.zip";
		const ssh = new SSHCommand(cmd);
		await ssh.execute();
		log("Done.")
	})
	

    app_updating = false;
}

async function cronCommand(schedule = "0 4 * * *", callback) {
	// Default run everyday at 4h,
    // https://crontab.guru/#0_4_*_*_*

    try {
        const task = cron.schedule(schedule, async () => {
            try {
                await callback();
            } catch (err) {
                log.error(err);
            }
        });
        return { code: 200, data: "Success", task };
    } catch (err) {
        return { code: 500, data: err };
    }
}

// Text formatting code coming from dotenv lib

function supportsAnsi () {
  return process.stdout.isTTY // && process.env.TERM !== 'dumb'
}
function dim (text) {
  return supportsAnsi() ? `\x1b[2m${text}\x1b[0m` : text
}

function parseYtDlpFormatQuery(data) {
    const lines = data.split('\n').map(l => l.trim()).filter(Boolean);
    
    const result = {
        source: null,
        mediaId: null,
        url: null,
        formats: []
    };

    for (const line of lines) {
        const sourceMatch = line.match(/^\[(\w+)\]/);
        if (sourceMatch && !result.source) {
			result.source = sourceMatch[1];
        }

        const urlMatch = line.match(/Extracting URL: (https?:\/\/[^\s]+)/);
        if (urlMatch) result.url = urlMatch[1];

        const idMatch = line.match(/^\[\w+\] ([^:]+): Downloading/);
        if (idMatch) result.mediaId = idMatch[1];
    }

    const separatorIndex = lines.findIndex(l => /^-{10,}$/.test(l));
    if (separatorIndex === -1) return result;

    for (let i = separatorIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.startsWith('[')) continue;

        const format = parseFormatLine(line);
        if (format) result.formats.push(format);
    }

    return result;

    
    function parseFormatLine(line) {
    const sections = line.split('|').map(s => s.trim());
    if (sections.length < 3) return null;

    const [info, sizeInfo, codecInfo] = sections;

    const infoParts = info.split(/\s+/).filter(Boolean);
    if (infoParts.length < 2) return null;

    const format = {
        id: infoParts[0],
        ext: infoParts[1],
        resolution: null,
        isAudioOnly: false,
        fps: null,
        channels: null,
        filesize: null,
        tbr: null,
        protocol: null,
        vcodec: null,
        acodec: null,
        abr: null,
        quality: null
    };

    const resIndex = infoParts.findIndex(p => /^\d+x\d+$/.test(p) || p === 'audio');
    if (resIndex !== -1) {
        if (infoParts[resIndex] === 'audio' && infoParts[resIndex + 1] === 'only') {
        	format.isAudioOnly = true;
        } else {
			format.resolution = infoParts[resIndex];
			if (infoParts[resIndex + 1] && /^\d+$/.test(infoParts[resIndex + 1])) {
				format.fps = parseInt(infoParts[resIndex + 1]);
			}
			if (infoParts[resIndex + 2] && /^\d+$/.test(infoParts[resIndex + 2])) {
				format.channels = parseInt(infoParts[resIndex + 2]);
			}
        }
    }

    const sizeParts = sizeInfo.split(/\s+/).filter(Boolean);
    for (let i = 0; i < sizeParts.length; i++) {
        const part = sizeParts[i];
        if (/^[\d.≈~]+[KMGT]iB$/i.test(part)) {
        	format.filesize = part.replace(/[≈~]/, '');
        } else if (/^\d+k$/i.test(part)) {
        	format.tbr = parseInt(part);
        } else if (/^(https?|m3u8|dash|http)$/i.test(part)) {
        	format.protocol = part;
        }
    }

    const codecParts = codecInfo.split(/\s+/).filter(Boolean);
    for (const part of codecParts) {
        if (/^(avc1|vp9|av01|hevc|h264)/i.test(part)) {
        	format.vcodec = part;
        } else if (/^(mp4a|opus|vorbis|mp3|aac)/i.test(part)) {
        	format.acodec = part;
        } else if (/^\d+k$/i.test(part) && !format.abr) {
        	format.abr = parseInt(part);
        } else if (/^\d+p$/.test(part)) {
        	format.quality = part;
        } else if (/^(low|medium|high)$/i.test(part)) {
        	format.quality = part;
        }
    }

    if (format.vcodec === 'audio') format.vcodec = null;

    return format;
    }
}



module.exports = { URLize, log, app_updating, cronTasks, dim, parseYtDlpFormatQuery };