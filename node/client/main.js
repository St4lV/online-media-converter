const go_button = document.querySelector("#start-process");
const select_action = document.querySelector("#select-process");
const input_url = document.querySelector("#url-input");
const action_options_display = document.querySelector("#action-options-display")

const svgs = {
    cross:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>`
}

let intervalId = null;
let selected_format_dl = "mp4";
let graceReloadUntil = 0;
const GRACE_PERIOD_MS = 10000;

go_button.addEventListener("click", async function() {
    graceReloadUntil = Date.now() + GRACE_PERIOD_MS;
    startAutoReload();
    await selectActionMode();
    await refreshPage();
});
async function refreshPage() {
    await setActionsDisplay();
    await reloadFilesList();
    await assignDelBtns();
}

(async () => {
    await refreshPage();
})()

function startAutoReload() {
    if (intervalId !== null) {
        return;
    }
    // Adapted from :
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval#example_2_alternating_two_colors
    intervalId = setInterval(async function() {
        await refreshPage();
    }, 1000);
    console.log("Auto-reload started, intervalId:", intervalId);
}

function stopAutoReload() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
        console.log("Auto-reload stopped");
    }
}

async function selectActionMode() {
    switch (select_action.value) {

        case "download":
            const select_format_dl = document.querySelector("#select-download-format");
            await startDownload(input_url.value, select_format_dl.value, "none");
            break;


        case "convert":
            const input_file_convert = document.querySelector("#input-file-convert");
            const select_format_convert = document.querySelector("#select-convert-format");

            const convert_mode = input_file_convert.files.length > 0 ? "upload" : input_url.value != "" ? "download" : "error";
            if (convert_mode === "error") {
                console.error("No file or url to convert")
                return
            }
            await startConvert(convert_mode, input_file_convert.files, select_format_convert.value)
            break;


        case "qr-code":
            await startQRCode(input_url.value, false)
            break;


        case "":
            return

    }
}

async function getRequest(url) {
    const response = await fetch(url)
    const data = await response.json();
    console.log(data);
    return data;
}

async function postRequest(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log(data);
    return data;
}

async function postRequestFile(url, formData) {
    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    console.log(data);
    return data;
}

async function deleteRequest(url) {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();
    console.log(data);
    return data;
}

async function startDownload(url, format, quality) {
    const body = {
        url: url,
        format: format,
        quality: quality
    };
    const endpoint = '/api/v1/download'
    const result = await postRequest(endpoint, body);
    console.log(result)
}

async function startQRCode(url, keep_file) {
    const body = {
        url: url,
        keep_file: keep_file
    };
    const endpoint = '/api/v1/qrcode'
    const result = await postRequest(endpoint, body);
    console.log(result)
}

async function startConvert(mode, files, new_format) {
    if (mode === "upload") {
        for (let i of files) {
            const formData = new FormData();
            formData.append('file', i);
            const upload_endpoint = '/api/v1/files';
            const upload_result = await postRequestFile(upload_endpoint, formData);
            if (upload_result.data !== "Created") {
                return
            }

            const body = {
                file_name: i.name,
                new_format: new_format
            };
            console.log(body)
            const endpoint = '/api/v1/convert'
            const result = await postRequest(endpoint, body);
            console.log(result)
        }
    } else if (mode === "download") {
        const dl_result = await startDownload(input_url.value, selected_format_dl, "none");
        const body = {
            file_name: dl_result.data,
            new_format: new_format
        };
        const endpoint = '/api/v1/convert'
        const result = await postRequest(endpoint, body);
        console.log(result)
    }
    await refreshPage();

}

//FILES
/////////////////////////////////////////////////////////////////////////////

// Helper function to check if a file is temporary (downloading/converting)
function isTemporaryFile(filename) {
    return filename.includes(".part") || filename.includes(".tmp") || filename.includes(".temp") || filename.endsWith(".ytdl") ;
}

let files_list = []
async function getFiles() {
    files_list = await getRequest("/api/v1/files/list");
}
async function reloadFilesList() {
    const files_list_tag = document.querySelector("#files-list");

    await getFiles();

    let dom = ""
    let hasTemporaryFiles = false;

    for (let el of files_list.data) {
        // Check for temporary files (.part, .tmp) to track if we need auto-reload
        if (isTemporaryFile(el)) {
            hasTemporaryFiles = true;
        }

        // Skip temporary files in the display, as they appear multiple times and kinda spam files list
        if (!el.includes(".part") && !el.includes(".tmp")) {
            // If ffmpeg is correctly installed ytdlp generate a ".mp4.ytdl" which i suppose is the file converted to ".mp4" on download end
            // TLDR: *.ytdl -> file is downloading, else the file is probably ready
            const ready = (!el.endsWith(".ytdl"))
                ? `<a href="/api/v1/files/download/${encodeURIComponent(el)}" download> Download </a>`
                : `<span class="loader"></span>`;
            dom += `<li>${el}${ready}<button data-filename="${el}" class="files-list-delete-btn">${svgs.cross}</button></li>`
        }
    }

    files_list_tag.innerHTML = dom;
    const inGracePeriod = Date.now() < graceReloadUntil;
    
    if (hasTemporaryFiles || inGracePeriod) {
        startAutoReload();
        /*if (inGracePeriod && !hasTemporaryFiles) {
           
        }*/
    } else {
        stopAutoReload();
    }
}

async function assignDelBtns() {
    const files_list_delete_btn = document.querySelectorAll(".files-list-delete-btn");
    for (let el of files_list_delete_btn) {
        console.log(el.dataset)
        el.addEventListener("click", async function() {
            const file = el.dataset.filename;
            await deleteRequest(`/api/v1/files/${encodeURIComponent(file)}`)
            await refreshPage();
        })
    }
}

select_action.addEventListener("change", async function() {
    await setActionsDisplay()
})

async function setActionsDisplay() {
    action_options_display.innerHTML = "";
    switch (select_action.value) {

        case "download":
            await setActionsDisplayDownloadFormats();
            break;

        case "convert":
            await setActionsDisplayConvert();
            break;

        case "qrcode":
            await setActionsDisplayQRCode();
            break;
    }
}

async function setActionsDisplayDownloadFormats() {
    let dom = `<select id="select-download-format"><option value="mp4">MP4</option><option value="mp3">MP3</option></select>`
    action_options_display.innerHTML = dom;
}

async function setActionsDisplayConvert() {
    let dom = '<input type="file" id="input-file-convert">' + '<select id="select-convert-format"><option value="mp4">MP4</option><option value="mp3">MP3</option><option value="png">PNG</option></select>'
    action_options_display.innerHTML = dom;

}

async function setActionsDisplayQRCode() {
    let dom = ''
    action_options_display.innerHTML = dom;
}