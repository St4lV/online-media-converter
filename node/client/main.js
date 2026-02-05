const footer_version_display = document.querySelector("#footer-version-display")

const go_button = document.querySelector("#start-process");
const select_action = document.querySelector("#select-process");
const input_url = document.querySelector("#url-input");
const action_options_display = document.querySelector("#action-options-display");

const action_bar_v2_options = document.querySelector("#action-bar-v2-options");

const svgs = {
    cross:`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>`,
    dl:`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/></svg>`,
    check:`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16"><path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/><path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/></svg>`,
}

let intervalId = null;
let graceReloadUntil = 0;
const grace_period_ms = 10_000;
let files_list = []

async function refreshPage() {
    await reloadFilesList();
    await assignDelBtns();
    await updateStorageData();
    await updateAppData();
}

function loadFromCache(){

}

(async () => {
    loadFromCache();
    await refreshPage();
})()

function startAutoReload() {
    if (intervalId !== null) {
        return;
    }
    graceReloadUntil = Date.now() + grace_period_ms;
    // Adapted from :
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval#example_2_alternating_two_colors
    intervalId = setInterval(async function() {
        await refreshPage();
        console.log("auto reload")
    }, 1000);
}

function stopAutoReload() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

async function updateAppData() {
    const app = await getRequest("/api/v1/");
    footer_version_display.innerText = `Made by ${app.data.dev} under ${app.data.license} License.\n${app.data.app}@${app.data.version}`;/*${new Date().getFullYear()}*/
}
let total_files_size_bytes =0;
let total_files_count =0;
async function updateStorageData() {
    const storage_display = document.querySelector("#files-list-storage");
    const storage = await getRequest("/api/v1/files/storage")

    const bsize = storage.data.bsize;
    const bavail = storage.data.bavail;
    const blocks = storage.data.blocks;
    const total_available_size_bytes =  bsize * bavail;
    const total_gb = blocks * bsize
    let dom = `<p>${total_files_count} files - ${formatSize(total_files_size_bytes)} / ${formatSize(total_available_size_bytes)} (${formatSize(total_available_size_bytes)} - ${(total_files_size_bytes * 100 / total_gb).toFixed(2)} % )</p><progress id="file-list-storage-stockage-progress" max="${total_gb}" value="${total_files_size_bytes}">`
    storage_display.innerHTML = dom;
}

function formatSize(bytes) {
    if (bytes === 0) return '0 o';
    
    const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    
    return (size % 1 === 0 ? size.toString() : size.toFixed(2).replace('.', ',')) + ' ' + units[i];
}
// ACTION BAR V2


// Selectors events
const abv2_selectors_download = document.querySelector("#action-bar-v2-choice-download");
abv2_selectors_download.addEventListener("click",async function(){
    await updateActionBarOptions("download");
})
const abv2_selectors_convert = document.querySelector("#action-bar-v2-choice-convert");
abv2_selectors_convert.addEventListener("click",async function(){
    await updateActionBarOptions("convert");
})
const abv2_selectors_qrcode = document.querySelector("#action-bar-v2-choice-qrcode");
abv2_selectors_qrcode.addEventListener("click",async function(){
    await updateActionBarOptions("qrcode");
})

// Display action bar

const abv2_actions_holder_el = document.querySelector("#action-bar-v2-options");
let action_bar_step = 0;
let action_bar_max_step = 3;
let action_bar_mode = "none";

async function updateActionBarOptions(mode){

    switch (mode) {
        case "download":
            actionModeDownload()
            setActionBarStep(1);
            break

        case "convert":
            actionModeConvert();
            setActionBarStep(1);
            break

        case "qrcode":
            reset();
            break
        
        case "none" :
            reset();            
            return

        case "" :
            reset();
            return
    }

    function reset(){
        setActionBarStep(0);
        setTimeout(() => {
            abv2_actions_holder_el.innerHTML="";
        }, "300");
    }
}

function setActionBarStep(step=0){
    abv2_actions_holder_el.dataset.step=step;
}

// Display action bar mode :

function actionModeDownload(){
    const dom_init = `
<menu id ="action-bar-v2-options-dl-holder">
    <div id="action-bar-v2-options-input-url-holder" class="action-bar-v2-options-step">
        <h3>Media URL :</h3>
        <input type="text" id="action-bar-v2-options-input-url" class="action-bar-v2-options-input-url" placeholder="URL">
        <p id="action-bar-v2-options-dl-btn-next-holder">
            <button id="action-bar-v2-options-url-start-fetch-format">Next</button>
        </p>
    </div>
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
    action_bar_v2_options.innerHTML = dom_init;
    
    const url_input = document.querySelector("#action-bar-v2-options-input-url");
    const start_fetch_btn = document.querySelector("#action-bar-v2-options-url-start-fetch-format");
    const available_formats_select = document.querySelector("#action-bar-v2-options-select-format-dl");
    const next_btn = document.querySelector("#action-bar-v2-options-dl-btn-next-holder");

    start_fetch_btn.addEventListener("click",async function(){
        next_btn.innerHTML=`<span class="loader"></span>`;
        const result = await fetchAvailableFormats();

        if (result.status!==200){
            next_btn.innerHTML=`<center><button id="action-bar-v2-options-select-format-dl-retry">Retry</button></center><br>Error : ${result.data}`;
            const retry_btn = document.querySelector("#action-bar-v2-options-select-format-dl-retry");
            retry_btn.addEventListener("click", async function(){
                await updateActionBarOptions("download");
            })
            return
        }

        const formats_list = result.data.formats;
        let dom = "";

        for (let el of formats_list){
            if (!dom.includes(`value="${el.ext}"`)){
                dom += `<option value="${el.ext}" ${(el.ext === "mp3" || el.ext === "mp4") ? "selected" : ""}>${el.ext}</option>`
            }
        }

        available_formats_select.innerHTML=dom;
        next_btn.innerHTML=svgs.check;
        const btn_dl_holder = document.querySelector("#action-bar-v2-options-btn-download-holder")
        const btn_dl = document.querySelector("#action-bar-v2-options-btn-download");
        btn_dl.addEventListener("click",async function() {
            btn_dl_holder.innerHTML='<span class="loader"></span>';
            await downloadFile();
            updateActionBarOptions("none")
        });
        setActionBarStep(2);
    })
    
    async function fetchAvailableFormats(){
        const result = await getRequest(`/api/v1/download/${encodeURIComponent(clearUrl(url_input.value))}`);
        return result;
    }

    async function downloadFile() {

        graceReloadUntil = Date.now() + grace_period_ms;
        await refreshPage();
        startAutoReload();

        const audio_only = !(available_formats_select.value === "mp4");
        const result = await startDownload(clearUrl(url_input.value),available_formats_select.value,"best",audio_only);
        console.log(result);
    }

    function clearUrl(url){
        const result = ((url.split("?si=")[0]).split("&si=")[0]).split("&list=")[0];
        return result;
    }
    
}

function actionModeConvert(){
/* ID template = id="action-bar-v2-options-convert" */
    const dom_init = `
<menu id ="action-bar-v2-options-convert-holder">
    <div id ="action-bar-v2-options-convert-step-1">
        <select id ="action-bar-v2-options-convert-input-select-options">
            <option value="dl">Download file</option>
            <option value="upl">Upload file</option>
            <option value="srv" selected>From server</option>
        </select>
        <div id ="action-bar-v2-options-convert-input-options-holder">
            <select id="action-bar-v2-options-convert-file-select"><option selected disabled>None</option></select>
        </div>
        <div id ="action-bar-v2-options-next-btn-holder">
            <button id="action-bar-v2-options-next-btn">Next</button>
        </div>
    </div>
</menu>
`;
    action_bar_v2_options.innerHTML = dom_init;
    populateFilelistSelect()
    const options_select = document.querySelector("#action-bar-v2-options-convert-input-select-options");
    const options_holder = document.querySelector("#action-bar-v2-options-convert-input-options-holder");

    options_select.addEventListener("change",async function(){
        switch (this.value){
            case "dl":
                options_holder.innerHTML=`<input id="action-bar-v2-options-convert-url-input" type="text">`;
                break;
            case "upl":
                options_holder.innerHTML=`<input id="action-bar-v2-options-convert-file-input" type="file">`;
                break;
            case "srv":
                options_holder.innerHTML=`<select id="action-bar-v2-options-convert-file-select"><option selected disabled>None</option></select>`;
                await populateFilelistSelect();
                break;
        };
        goToStep2(this.value);
    })

    const url_input_element = document.querySelector("#action-bar-v2-options-convert-url-input");
    const file_input_element = document.querySelector("#action-bar-v2-options-convert-file-input");
    
    const next_btn_step_1 = document.querySelector("#action-bar-v2-options-next-btn");
    
    async function populateFilelistSelect(){
        
        const files_select_element = document.querySelector("#action-bar-v2-options-convert-file-select");
        await getFiles();
        let dom = "";
        for (let el of files_list.data){
            dom+=`<option value="${el.name}">${el.name}</option>`
        }
        files_select_element.innerHTML=dom;
    }

    async function goToStep2(mode){

    }

}
// ACTION BAR V1

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

// HTTP REQUESTS FUNCTIONs

async function getRequest(url) {
    const response = await fetch(url)
    const data = await response.json();
    const code = response.status;
    console.log({status:code,data:data.data});
    return {status:code,data:data.data};
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
    const code = response.status;
    console.log({status:code,data:data.data});
    return {status:code,data:data.data};
}

async function postRequestFile(url, formData) {
    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    const code = response.status;
    console.log({status:code,data:data.data});
    return {status:code,data:data.data};
}

async function deleteRequest(url) {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();
    const code = response.status;
    console.log({status:code,data:data.data});
    return {status:code,data:data.data};
}

// REQUEST SENDERS

async function startDownload(url, format, quality, audio_only) {
    const body = {
        url: url,
        format: format,
        quality: quality,
        audio_only: audio_only,
    };
    const endpoint = '/api/v1/download'
    const result = await postRequest(endpoint, body);
    return result;
    //console.log(result)
}

async function startQRCode(url, keep_file) {
    const body = {
        url: url,
        keep_file: keep_file
    };
    const endpoint = '/api/v1/qrcode'
    const result = await postRequest(endpoint, body);
    //console.log(result)
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
            //console.log(body)
            const endpoint = '/api/v1/convert'
            const result = await postRequest(endpoint, body);
            //console.log(result)
        }
    } else if (mode === "download") {

        const file_url = input_url.value
        const dl_result = await startDownload(file_url, "none", "none");
        console.log(dl_result)
        await reloadFilesList();

        let selected_file_name = "none";
        const file_url_id_array = file_url.split("/")
        let file_url_id = file_url_id_array[file_url_id_array.length-1]

        if (file_url_id.includes("?v=")){
            file_url_id = file_url_id.split("?v=")[file_url_id.split("?v=").length-1]
        }
        //console.log(file_url_id)
        file_url_id = file_url_id.split("?")[0];
        //console.log(file_url_id)
        for (let i of files_list.data){
            console.log(i)
            if (i.name.includes(file_url_id)){
                selected_file_name=i.name
            }

        }
        
        if (selected_file_name==="none"){
            return
        }
        const body = {
            file_name: selected_file_name,
            new_format: new_format
        };
        const endpoint = '/api/v1/convert'
        const result = await postRequest(endpoint, body);
        //console.log(result)

        const del_result = await deleteRequest(`/api/v1/files/${encodeURIComponent(selected_file_name)}`);
        //console.log(del_result)
    }
    await refreshPage();

}

//FILES
/////////////////////////////////////////////////////////////////////////////

// Helper function to check if a file is temporary (downloading/converting)
function isTemporaryFile(filename) {
    return filename.includes(".part") || filename.includes(".tmp") || filename.includes(".temp") || filename.endsWith(".ytdl") ;
}

async function getFiles() {
    files_list = await getRequest("/api/v1/files/list");
}
async function reloadFilesList() {
    const files_list_tag = document.querySelector("#files-list");

    await getFiles();
    total_files_size_bytes = 0;
    total_files_count =0;
    let dom = "";
    let hasTemporaryFiles = false;

    for (let el of files_list.data) {
        total_files_size_bytes+=el.size;
        // Check for temporary files (.part, .tmp) to track if auto-reload is required
        if (isTemporaryFile(el.name)) {
            hasTemporaryFiles = true;
        }

        // Skip temporary files in the display, as they appear multiple times and kinda spam files list
        if (!el.name.includes(".part") && !el.name.includes(".tmp") && !el.name.includes(".temp")) {
            total_files_count++;
            // If ffmpeg is correctly installed ytdlp generate a ".mp4.ytdl" which i suppose is the file converted to ".mp4" on download end
            // TLDR: *.ytdl -> file is downloading, else the file is probably ready
            const ready = (!el.name.endsWith(".ytdl"))
                ? `<a class="files-list-download-btn" href="/api/v1/files/download/${encodeURIComponent(el.name)}" download>${svgs.dl}</a>`
                : `<span class="loader"></span>`;
            dom += `<tr class="files-list-table-filename-tr"><th scope="row">${el.name}</th><td class="files-list-size-display">${formatSize(el.size)}</td><td class="files-list-table-options-btns">${ready}<button data-filename="${el.name}" class="files-list-delete-btn">${svgs.cross}</button></td></tr>`
        }
    }

    files_list_tag.innerHTML = dom;
    const inGracePeriod = Date.now() < graceReloadUntil;
    console.log(inGracePeriod)
    if (hasTemporaryFiles || inGracePeriod) {
        startAutoReload();
    } else {
        stopAutoReload();
    }
}

async function assignDelBtns() {
    const files_list_delete_btn = document.querySelectorAll(".files-list-delete-btn");
    for (let el of files_list_delete_btn) {
        //console.log(el.dataset)
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