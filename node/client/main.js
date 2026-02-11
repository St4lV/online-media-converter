// ─── Utility helpers ──────────────────────────────────

const SVGS = {
	cross: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>`,
	dl: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/></svg>`,
	check: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16"><path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/><path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/></svg>`,
};

function clearUrl(url) {
	return ((url.split("?si=")[0]).split("&si=")[0]).split("&list=")[0];
}

function formatSize(bytes) {
	if (bytes === 0) return '0 o';
	const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const size = bytes / Math.pow(1024, i);
	return (size % 1 === 0 ? size.toString() : size.toFixed(2).replace('.', ',')) + ' ' + units[i];
}

function isTemporaryFile(filename) {
	return filename.includes(".part") || filename.includes(".tmp") || filename.includes(".temp") || filename.endsWith(".ytdl");
}

// ─── HTTPRequest ──────────────────────────────────────

class HTTPRequest {
	constructor(url) {
		this.url = url;
	}

	async get() {
		const response = await fetch(this.url);
		const data = await response.json();
		return { status: response.status, data: data.data };
	}

	async getImage() {
		const response = await fetch(this.url);
		const contentType = response.headers.get('Content-Type');
		if (contentType && contentType.startsWith('image/')) {
			const blob = await response.blob();
			return { status: response.status, data: blob };
		}
		const data = await response.json();
		return { status: response.status, data: data.data };
	}

	async post(body = {}) {
		const response = await fetch(this.url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		const data = await response.json();
		return { status: response.status, data: data.data };
	}

	async postFile(formData) {
		const response = await fetch(this.url, {
			method: 'POST',
			body: formData,
		});
		const data = await response.json();
		return { status: response.status, data: data.data };
	}

	async delete() {
		const response = await fetch(this.url, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
		});
		const data = await response.json();
		return { status: response.status, data: data.data };
	}

	static get(url) { return new HTTPRequest(url).get(); }
	static getImage(url) { return new HTTPRequest(url).getImage(); }
	static post(url, body) { return new HTTPRequest(url).post(body); }
	static postFile(url, formData) { return new HTTPRequest(url).postFile(formData); }
	static delete(url) { return new HTTPRequest(url).delete(); }
}

// ─── GlobalData ───────────────────────────────────────

class GlobalData {
	constructor() {
		this.filesList = [];
		this.totalFilesSizeBytes = 0;
		this.totalFilesCount = 0;
		this.gracePeriodMs = 10_000;
		this.graceReloadUntil = 0;
	}

	resetCounters() {
		this.totalFilesSizeBytes = 0;
		this.totalFilesCount = 0;
	}

	triggerGrace() {
		this.graceReloadUntil = Date.now() + this.gracePeriodMs;
	}

	get isInGracePeriod() {
		return Date.now() < this.graceReloadUntil;
	}

	async fetchFiles() {
		const result = await HTTPRequest.get("/api/v1/files/list");
		this.filesList = result.data || [];
		return this.filesList;
	}
}

// ─── Reload ───────────────────────────────────────────

class Reload {
	constructor(data) {
		this.data = data;
		this.intervalId = null;
		this.isReloading = false;
	}

	async all() {
		if (this.isReloading) return;
		this.isReloading = true;
		try {
			await this.files();
			await this.storage();
		} finally {
			this.isReloading = false;
		}
	}

	async files() {
		const tbody = document.querySelector("#files-list");
		await this.data.fetchFiles();
		this.data.resetCounters();
		let dom = "";
		let hasTemporary = false;

		for (const file of this.data.filesList) {
			if (!file.name) continue;
			this.data.totalFilesSizeBytes += file.size;

			if (isTemporaryFile(file.name)) {
				hasTemporary = true;
			}

			if (!file.name.includes(".part") && !file.name.includes(".tmp") && !file.name.includes(".temp")) {
				this.data.totalFilesCount++;
				const ready = !file.name.endsWith(".ytdl")
					? `<a class="files-list-download-btn" href="/api/v1/files/download/${encodeURIComponent(file.name)}" download>${SVGS.dl}</a>`
					: `<span class="loader"></span>`;

				dom += `<tr class="files-list-table-filename-tr">
                    <th scope="row">${file.name}</th>
                    <td class="files-list-size-display">${formatSize(file.size)}</td>
                    <td class="files-list-table-options-btns">
                        ${ready}
                        <button data-filename="${file.name}" class="files-list-delete-btn">${SVGS.cross}</button>
                    </td>
                </tr>`;
			}
		}

		tbody.innerHTML = dom;

		this._bindDeleteButtons();

		if (hasTemporary || this.data.isInGracePeriod) {
			this.startAuto();
		} else {
			this.stopAuto();
		}
	}

	_bindDeleteButtons() {
		const buttons = document.querySelectorAll(".files-list-delete-btn");
		for (const btn of buttons) {
			btn.addEventListener("click", async () => {
				const filename = btn.dataset.filename;
				await HTTPRequest.delete(`/api/v1/files/${encodeURIComponent(filename)}`);
				await this.all();
			});
		}
	}

	async storage() {
		const container = document.querySelector("#files-list-storage");
		const result = await HTTPRequest.get("/api/v1/files/storage");
		const { bsize, bavail, blocks } = result.data;

		const totalAvailable = bsize * bavail;
		const totalGb = blocks * bsize;
		const used = this.data.totalFilesSizeBytes;
		const pct = (used * 100 / totalGb).toFixed(2);

		container.innerHTML = `
            <p>${this.data.totalFilesCount} files — ${formatSize(used)} / ${formatSize(totalGb)} (${formatSize(totalAvailable)} available — ${pct}% used)</p>
            <progress id="file-list-storage-stockage-progress" max="${totalGb}" value="${used}"></progress>
        `;
	}

	async appData() {
		const el = document.querySelector("#footer-version-display");
		const app = await HTTPRequest.get("/api/v1/");
		el.innerText = `Made by ${app.data.dev} under ${app.data.license} License.\n${app.data.app}@${app.data.version}`;
	}

	startAuto() {
		if (this.intervalId !== null) return;
		this.data.triggerGrace();
		this.intervalId = setInterval(() => {
			this.all();
		}, 1000);
	}

	stopAuto() {
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}
}

// ─── ActionMenu ───────────────────────────────────────

class ActionMenu {
	constructor(data, reload) {
		this.data = data;
		this.reload = reload;
		this.panel = document.querySelector("#action-bar-v2-options");
		this.currentMode = "none";

		this._bindNavButtons();
	}

	_bindNavButtons() {
		const modes = {
			"#action-bar-v2-choice-download": "download",
			"#action-bar-v2-choice-convert": "convert",
			"#action-bar-v2-choice-qrcode": "qrcode",
		};

		for (const [selector, mode] of Object.entries(modes)) {
			document.querySelector(selector).addEventListener("click", () => {
				if (this.currentMode === mode) {
					this.close();
					return;
				}
				this.open(mode);
			});
		}
	}

	open(mode) {
		document.querySelectorAll(".nav-pill").forEach(el => el.classList.remove("active"));
		const pillMap = {
			download: "#action-bar-v2-choice-download",
			convert: "#action-bar-v2-choice-convert",
			qrcode: "#action-bar-v2-choice-qrcode",
		};
		if (pillMap[mode]) {
			document.querySelector(pillMap[mode]).classList.add("active");
		}

		this.currentMode = mode;

		switch (mode) {
			case "download":
				new Download(this.data, this.reload, this).render();
				break;
			case "convert":
				new Convert(this.data, this.reload, this).render();
				break;
			case "qrcode":
				new QRCode(this.data, this.reload, this).render();
				break;
		}

		this.setStep(1);
	}

	close() {
		this.currentMode = "none";
		document.querySelectorAll(".nav-pill").forEach(el => el.classList.remove("active"));
		this.setStep(0);
		setTimeout(() => {
			this.panel.innerHTML = "";
		}, 350);
	}

	setStep(step) {
		this.panel.dataset.step = step;
	}
}

// ─── Download ─────────────────────────────────────────

class Download {
	constructor(data, reload, menu) {
		this.data = data;
		this.reload = reload;
		this.menu = menu;
	}

	render() {
		this.menu.panel.innerHTML = `
            <menu id="action-bar-v2-options-dl-holder">
                <div id="action-bar-v2-options-input-url-holder" class="action-bar-v2-options-step">
                    <h3>Media URL :</h3>
                    <input type="text" id="action-bar-v2-options-input-url" class="action-bar-v2-options-input-url" placeholder="https://...">
                    <p id="action-bar-v2-options-dl-btn-next-holder">
                        <button id="action-bar-v2-options-url-start-fetch-format">Next</button>
                    </p>
                </div>
				<hr>
                <div id="action-bar-v2-options-select-and-btn" class="action-bar-v2-options-step">
                    <select id="action-bar-v2-options-select-format-dl">
                        <option value="none" selected disabled>Dynamic fetch</option>
                    </select>
                    <div id="action-bar-v2-options-btn-download-holder">
                        <button id="action-bar-v2-options-btn-download">Download</button>
                    </div>
                </div>
            </menu>
        `;

		this._bindEvents();
	}

	_bindEvents() {
		const urlInput = document.querySelector("#action-bar-v2-options-input-url");
		const fetchBtn = document.querySelector("#action-bar-v2-options-url-start-fetch-format");
		const formatSelect = document.querySelector("#action-bar-v2-options-select-format-dl");
		const nextHolder = document.querySelector("#action-bar-v2-options-dl-btn-next-holder");

		fetchBtn.addEventListener("click", async () => {
			if (urlInput.value.trim() === "") {
				return;
			}

			this._setHolder(nextHolder, "loading");
			const get_data = await HTTPRequest.get(`/api/v1/download/${encodeURIComponent(clearUrl(urlInput.value))}`);
			if (get_data.status !== 200) {
				nextHolder.innerHTML = `${SVGS.cross}<br><center><button id="action-bar-v2-options-select-format-dl-retry">Retry</button></center><br>Error : ${result.data}`;
				document.querySelector("#action-bar-v2-options-select-format-dl-retry").addEventListener("click", () => this.render());
				return;
			}

			const mode = get_data.data._type;
			let playlist_url_array = [];
			let formats_array = mode !== "playlist" ? get_data.data.formats : [];

			if (mode === "playlist") {
				const medias_data = await Promise.all(
					get_data.data.entries.map(entry =>
						HTTPRequest.get(`/api/v1/download/${encodeURIComponent(clearUrl(entry.url))}`)
					)
				);

				const failed = medias_data.find(r => r.status !== 200);
				if (failed) {
					nextHolder.innerHTML = `${SVGS.cross}<br><center><button id="action-bar-v2-options-select-format-dl-retry">Retry</button></center><br>Error : ${failed.data}`;
					document.querySelector("#action-bar-v2-options-select-format-dl-retry").addEventListener("click", () => this.render());
					return;
				}

				medias_data.forEach(result => {
					playlist_url_array.push(result.data.webpage_url);
					result.data.formats.forEach(fmt => {
						formats_array.push(fmt);
					});
				});
			}
			const seen = new Set();
			let dom = "";
			for (const fmt of formats_array) {
				if (!seen.has(fmt.ext)) {
					seen.add(fmt.ext);
					const selected = (fmt.ext === "mp3" || fmt.ext === "mp4") ? "selected" : "";
					dom += `<option value="${fmt.ext}" ${selected}>${fmt.ext}</option>`;
				}
			}
			formatSelect.innerHTML = dom;

			this._setHolder(nextHolder, "valid");
			this.menu.setStep(2);

			const dlHolder = document.querySelector("#action-bar-v2-options-btn-download-holder");
			const dlBtn = document.querySelector("#action-bar-v2-options-btn-download");

			dlBtn.addEventListener("click", async () => {
				this._setHolder(dlHolder, "loading");

				this.data.triggerGrace();
				await this.reload.all();
				this.reload.startAuto();
				const url_array = mode !== "playlist" ? [urlInput.value] : playlist_url_array
				const audioOnly = formatSelect.value !== "mp4";

				const dlResults = await Promise.all(
					url_array.map(url =>
						HTTPRequest.post('/api/v1/download', {
							url: clearUrl(url),
							format: formatSelect.value,
							quality: "best",
							audio_only: audioOnly,
						})
					)
				);

				const failed = dlResults.find(r => r.status !== 201);
				if (failed) {
					this._setHolder(dlHolder, "error");
					return;
				}

				this._setHolder(dlHolder, "valid");
				setTimeout(() => this.menu.close(), 2000);
			});
		});
	}

	_setHolder(el, state) {
		switch (state) {
			case "loading": el.innerHTML = '<span class="loader"></span>'; break;
			case "valid": el.innerHTML = SVGS.check; break;
			case "error": el.innerHTML = SVGS.cross; break;
		}
	}
}

// ─── Convert ──────────────────────────────────────────

class Convert {
	constructor(data, reload, menu) {
		this.data = data;
		this.reload = reload;
		this.menu = menu;
		this.convertActionMode = "srv";
		this.filesToConvert = [];
		this.newFormat = "none";
		this.formatList = [".webp", ".mp3", ".mp4", ".png", ".jpg", ".ogg", ".aiff", ".mov", ".wav", ".flac", ".gif"];
	}

	render() {
		this.menu.panel.innerHTML = `
            <menu id="action-bar-v2-options-convert-holder">
                <div id="action-bar-v2-options-convert-step-1">
                    <select id="action-bar-v2-options-convert-input-select-options">
                        <option value="dl">Download file</option>
                        <option value="upl">Upload file</option>
                        <option value="srv" selected>From server</option>
                    </select>
                    <div id="action-bar-v2-options-convert-input-options-holder">
                        <select id="action-bar-v2-options-convert-file-select">
                            <option value="none" selected disabled>None</option>
                        </select>
                    </div>
                    <div id="action-bar-v2-options-next-btn-holder">
                        <button id="action-bar-v2-options-next-btn">Next</button>
                    </div>
                </div>
                <hr>
                <div id="action-bar-v2-options-convert-step-2">
                    <select id="action-bar-v2-options-convert-select-convert-format">
                        <option value="none" selected disabled>None</option>
                    </select>
                    <div id="action-bar-v2-options-convert-button-start-convert-holder">
                        <button id="action-bar-v2-options-convert-button-start-convert">Convert</button>
                    </div>
                </div>
            </menu>
        `;
		this._bindEvents();
	}

	async _bindEvents() {
		const optionsSelect = document.querySelector("#action-bar-v2-options-convert-input-select-options");
		const convertFormatSelect = document.querySelector("#action-bar-v2-options-convert-select-convert-format");
		const startConvertBtnHolder = document.querySelector("#action-bar-v2-options-convert-button-start-convert-holder");

		this._populateFormatSelect(convertFormatSelect);
		await this._setupActionMode(this.convertActionMode);

		optionsSelect.addEventListener("change", async () => {
			await this._setupActionMode(optionsSelect.value);
		});

		document.querySelector("#action-bar-v2-options-convert-button-start-convert").addEventListener("click", async () => {
			this._setHolder(startConvertBtnHolder, "loading");

			const cleaned = convertFormatSelect.value.split(".");
			this.newFormat = cleaned[cleaned.length - 1];
			localStorage.setItem("last_convert_format", convertFormatSelect.value);
			const convertResults = await Promise.all(
				this.filesToConvert.map(file => {
					return HTTPRequest.post('/api/v1/convert', {
						file_name: file,
						new_format: this.newFormat,
					});
				})
			);

			if (convertResults.find(r => r.status !== 200)) {
				this._setHolder(startConvertBtnHolder, "error");
				return;
			}

			const deleteResults = await Promise.all(
				this.filesToConvert.map(file => {
					return HTTPRequest.delete(`/api/v1/files/${encodeURIComponent(file)}`);
				})
			);

			if (deleteResults.find(r => r.status !== 200)) {
				this._setHolder(startConvertBtnHolder, "error");
				return;
			}

			this._setHolder(startConvertBtnHolder, "valid");
			await this.reload.all();
			this.menu.close();
		});
	}

	_populateFormatSelect(selectEl) {
		const lastSelected = localStorage.getItem("last_convert_format");
		let dom = "";
		for (const fmt of this.formatList) {
			const selected = lastSelected === fmt ? "selected" : "";
			dom += `<option value="${fmt}" ${selected}>${fmt}</option>`;
		}
		selectEl.innerHTML = dom;
	}

	async _setupActionMode(mode) {
		const optionsHolder = document.querySelector("#action-bar-v2-options-convert-input-options-holder");
		const nextBtnHolder = document.querySelector("#action-bar-v2-options-next-btn-holder");

		this._setHolder(nextBtnHolder, "loading");
		this.menu.setStep(1);
		this.convertActionMode = mode;

		switch (mode) {
			case "dl":
				optionsHolder.innerHTML = `<input id="action-bar-v2-options-convert-url-input" class="action-bar-v2-options-input-url" placeholder="https://..." type="text">`;
				break;
			case "upl":
				optionsHolder.innerHTML = `<input id="action-bar-v2-options-convert-file-input" type="file" multiple>`;
				break;
			case "srv":
				optionsHolder.innerHTML = `<select id="action-bar-v2-options-convert-file-select"><option selected disabled>None</option></select>`;
				await this._populateFilelistSelect();
				break;
			default:
				return;
		}

		nextBtnHolder.innerHTML = `<button id="action-bar-v2-options-next-btn">Next</button>`;
		document.querySelector("#action-bar-v2-options-next-btn")
			.addEventListener("click", async () => {
				await this._nextButtonAction();
			});
	}

	async _nextButtonAction() {
		const nextBtnHolder = document.querySelector("#action-bar-v2-options-next-btn-holder");

		switch (this.convertActionMode) {
			case "dl": {
				const urlInput = document.querySelector("#action-bar-v2-options-convert-url-input");
				if (!urlInput.value) return;

				this._setHolder(nextBtnHolder, "loading");

				const get_data = await HTTPRequest.get(`/api/v1/download/${encodeURIComponent(clearUrl(urlInput.value))}`);
				if (get_data.status !== 200) {
					this._setHolder(nextBtnHolder, "error");
					return;
				}

				const mode = get_data.data._type;
				let url_array = [];
				let mediaIds = [];
				let medias_data = [];

				if (mode === "playlist") {
					medias_data = await Promise.all(
						get_data.data.entries.map(entry =>
							HTTPRequest.get(`/api/v1/download/${encodeURIComponent(clearUrl(entry.url))}`)
						)
					);

					const failedFetch = medias_data.find(r => r.status !== 200);
					if (failedFetch) {
						this._setHolder(nextBtnHolder, "error");
						return;
					}

					medias_data.forEach(result => {
						url_array.push(result.data.webpage_url);
						mediaIds.push(result.data.id);
					});
				} else {
					url_array = [urlInput.value];
					mediaIds = [get_data.data.id];
				}

				let dlFormat = "none";
				if (mode === "playlist") {
					for (const fmt of medias_data[0].data.formats) {
						if (fmt.ext === "mp4" || fmt.ext === "mp3") {
							dlFormat = fmt.ext;
							break;
						}
					}
				} else {
					for (const fmt of get_data.data.formats) {
						if (fmt.ext === "mp4" || fmt.ext === "mp3") {
							dlFormat = fmt.ext;
							break;
						}
					}
				}
				if (dlFormat === "none") {
					this._setHolder(nextBtnHolder, "error");
					return;
				}

				this.data.triggerGrace();
				await this.reload.all();
				this.reload.startAuto();

				const audioOnly = dlFormat !== "mp4";
				const dlResults = await Promise.all(
					url_array.map(url =>
						HTTPRequest.post('/api/v1/download', {
							url: clearUrl(url),
							format: dlFormat,
							quality: "best",
							audio_only: audioOnly,
						})
					)
				);

				if (dlResults.find(r => r.status !== 201)) {
					this._setHolder(nextBtnHolder, "error");
					return;
				}

				await this.reload.all();
				this.filesToConvert = [];

				for (const mediaId of mediaIds) {
					const found = this.data.filesList.find(f => f.name && f.name.includes(`[${mediaId}]`));
					if (found) {
						this.filesToConvert.push(found.name);
					}
				}


				if (this.filesToConvert.length === 0) {
					this._setHolder(nextBtnHolder, "error");
					return;
				}

				this._setHolder(nextBtnHolder, "valid");
				break;
			}

			case "upl": {
				const fileInput = document.querySelector("#action-bar-v2-options-convert-file-input");
				if (fileInput.files.length === 0) {
					this._setHolder(nextBtnHolder, "error");
					return;
				}

				this._setHolder(nextBtnHolder, "loading");

				const uploads = Array.from(fileInput.files).map(file => {
					const formData = new FormData();
					formData.append('file', file);
					return HTTPRequest.postFile('/api/v1/files', formData);
				});

				const uploadResults = await Promise.all(uploads);

				if (uploadResults.find(r => r.status !== 201)) {
					this._setHolder(nextBtnHolder, "error");
					return;
				}

				this.filesToConvert = Array.from(fileInput.files).map(f => f.name);
				await this.reload.all();
				this._setHolder(nextBtnHolder, "valid");
				break;
			}

			case "srv": {
				const selectFile = document.querySelector("#action-bar-v2-options-convert-file-select");
				if (selectFile.value === "none") return;

				this._setHolder(nextBtnHolder, "loading");
				this.filesToConvert = [selectFile.value];
				this._setHolder(nextBtnHolder, "valid");
				break;
			}

			default:
				this._setHolder(nextBtnHolder, "error");
				return;
		}

		this.menu.setStep(2);
	}

	async _populateFilelistSelect() {
		const selectEl = document.querySelector("#action-bar-v2-options-convert-file-select");
		await this.data.fetchFiles();
		let dom = "";
		for (const file of this.data.filesList) {
			if (!file.name) continue;
			dom += `<option value="${file.name}">${file.name}</option>`;
		}
		selectEl.innerHTML = dom;
	}

	_setHolder(el, state) {
		switch (state) {
			case "loading": el.innerHTML = '<span class="loader"></span>'; break;
			case "valid": el.innerHTML = SVGS.check; break;
			case "error": el.innerHTML = SVGS.cross; break;
		}
	}
}

// ─── QRCode ───────────────────────────────────────────
class QRCode {
	constructor(data, reload, menu) {
		this.data = data;
		this.reload = reload;
		this.menu = menu;
		this.currentUrl = "";
	}

	render() {
		this.menu.panel.innerHTML = `
            <menu id="action-bar-v2-options-qrcode-holder">
                <div id="action-bar-v2-options-qrcode-step-1">
                    <h3>Media URL :</h3>
                    <input type="text" id="action-bar-v2-options-qrcode-input-url" class="action-bar-v2-options-input-url" placeholder="https://...">
                    <div id="action-bar-v2-options-qrcode-button-start-holder">
                        <button id="action-bar-v2-options-qrcode-button-start">Generate</button>
                    </div>
                </div>
                <hr>
                <div id="action-bar-v2-options-qrcode-step-2">
                    <div id="action-bar-v2-options-qrcode-img-holder"></div>
                    <div id="action-bar-v2-options-qrcode-button-save-holder">
                        <button id="action-bar-v2-options-qrcode-button-save">Save on server</button>
                    </div>
                </div>
            </menu>
        `;
		this._bindEvents();
	}

	_bindEvents() {
		const urlInput = document.querySelector("#action-bar-v2-options-qrcode-input-url");
		const btnHolder = document.querySelector("#action-bar-v2-options-qrcode-button-start-holder");
		const imgHolder = document.querySelector("#action-bar-v2-options-qrcode-img-holder");

		document.querySelector("#action-bar-v2-options-qrcode-button-start")
			.addEventListener("click", async () => {
				if (!urlInput.value.trim()) return;

				this._setHolder(btnHolder, "loading");

				const cleanedUrl = clearUrl(urlInput.value);
				const apiUrl = '/api/v1/qrcode/' + encodeURIComponent(cleanedUrl);
				const result = await HTTPRequest.getImage(apiUrl);

				if (result.status !== 200) {
					this._setHolder(btnHolder, "error");
					return;
				}

				this.currentUrl = cleanedUrl;
				imgHolder.innerHTML = `<img src="${apiUrl}" id="action-bar-v2-options-qrcode-img-display">`;
				this._setHolder(btnHolder, "valid");
				this.menu.setStep(3);
			});

		document.querySelector("#action-bar-v2-options-qrcode-button-save")
			.addEventListener("click", async () => {
				const saveHolder = document.querySelector("#action-bar-v2-options-qrcode-button-save-holder");

				if (!this.currentUrl) {
					this._setHolder(saveHolder, "error");
					return;
				}

				this._setHolder(saveHolder, "loading");

				const result = await HTTPRequest.post('/api/v1/qrcode', {
					url: this.currentUrl,
				});

				if (result.status !== 201) {
					this._setHolder(saveHolder, "error");
					return;
				}

				this._setHolder(saveHolder, "valid");
				await this.reload.all();
			});
	}

	_setHolder(el, state) {
		switch (state) {
			case "loading": el.innerHTML = '<span class="loader"></span>'; break;
			case "valid": el.innerHTML = SVGS.check; break;
			case "error": el.innerHTML = SVGS.cross; break;
		}
	}
}

// ─── IIFE ─────────────────────────────────────────────

(async () => {
	const data = new GlobalData();
	const reload = new Reload(data);
	const menu = new ActionMenu(data, reload);

	await reload.all();
	await reload.appData();
})();