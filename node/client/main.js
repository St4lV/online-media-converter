const go_button = document.querySelector("#start-process");
const select_action = document.querySelector("#select-process");
const input_url = document.querySelector("#url-input");
const action_options_display = document.querySelector("#action-options-display")

const svgs = {
    cross:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>`
}

go_button.addEventListener("click",async function() {
   await selectActionMode();
});

async function refreshPage() {
    await setActionsDisplay();
    await reloadFilesList();
    await assignDelBtns();
}
(async()=>{
    await refreshPage();
})()
async function selectActionMode(){
    const select_format_dl = document.querySelector("#select-download-format");
    switch (select_action.value){
        
        case "download":
            await startDownload(input_url.value,select_format_dl.value,"none");
            break;
        
        
        case "convert":
            const input_file_convert = document.querySelector("#input-file-convert");
            await startConvert(input_file_convert.files,select_format_dl.value)
            break;
        

        case "qr-code":
            await startQRCode(input_url.value,false)
            break;
        

        case "":
            return
        
    }
}

async function getRequest(url){
    const response = await fetch(url)
    const data = await response.json();
  console.log(data);
  return data;
}

async function postRequest(url,body){
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

async function deleteRequest(url){
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

async function startDownload(url,format,quality) {
    const body = {
        url:url,
        format:format,
        quality:quality
    };
    const endpoint = '/api/v1/download'
    const result = await postRequest(endpoint,body);
    console.log(result)
}

async function startQRCode(url,keep_file) {
    const body = {
        url:url,
        keep_file:keep_file
    };
    const endpoint = '/api/v1/qrcode'
    const result = await postRequest(endpoint,body);
    console.log(result)
}

async function startConvert(files,new_format) {
    
for (let i of files) {
    const formData = new FormData();
    formData.append('file', i);
    const upload_endpoint = '/api/v1/files';
    const upload_result = await postRequestFile(upload_endpoint, formData);
    if (upload_result.data!=="Created"){
        return
    }

    const body = {
        file_name:i.name,
        new_format:new_format
    };
    console.log(body)
    const endpoint = '/api/v1/convert'
    const result = await postRequest(endpoint,body);
    console.log(result)
    }   
}

//FILES
/////////////////////////////////////////////////////////////////////////////

let files_list = []
async function getFiles(){
    files_list = await getRequest("/api/v1/files/list");
}

async function reloadFilesList(){
    const files_list_tag = document.querySelector("#files-list");
    files_list_tag.innerHTML = '';
    await getFiles();
    let dom = ""
    for (el of files_list.data){
        if (!el.endsWith(".part")){
            dom+=`<li>${el}<a href="/api/v1/files/download/${encodeURIComponent(el)}" download> Download </a><button data-filename="${el}" class="files-list-delete-btn">${svgs.cross}</button></li>`
        }
    }
    files_list_tag.innerHTML = dom;
}

async function assignDelBtns() {
    const files_list_delete_btn = document.querySelectorAll(".files-list-delete-btn");
    for (let el of files_list_delete_btn){
        console.log(el.dataset)
        el.addEventListener("click", async function(){
            const file = el.dataset.filename;
            await deleteRequest(`/api/v1/files/${encodeURIComponent(file)}`)
            await refreshPage();
        })
    }
}

select_action.addEventListener("change",async function(){
    await setActionsDisplay()
})

async function setActionsDisplay(){
    action_options_display.innerHTML="";
    switch (select_action.value){
        
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

async function setActionsDisplayDownloadFormats(){
    let dom = `<select id="select-download-format"><option value="mp4">MP4</option><option value="mp3">MP3</option></select>`
    action_options_display.innerHTML=dom;
}

async function setActionsDisplayConvert(){
    let dom = '<input type="file" id="input-file-convert">' + '<select id="select-download-format"><option value="mp4">MP4</option><option value="mp3">MP3</option><option value="png">PNG</option></select>'
    action_options_display.innerHTML=dom;

}

async function setActionsDisplayQRCode(){
    let dom = ''
    action_options_display.innerHTML=dom;

}