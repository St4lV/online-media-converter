const go_button = document.querySelector("#start-process");
const select_action = document.querySelector("#select-process");
const input_url = document.querySelector("#url-input");
const action_options_display = document.querySelector("#action-options-display")

go_button.addEventListener("click",async function() {
   await selectActionMode();
});

async function refreshPage() {
    await setActionsDisplay();
    await reloadFilesList();
}
(async()=>{
    await refreshPage();
})()
async function selectActionMode(){
    switch (select_action.value){
        
        case "download":
            const select_format_dl = document.querySelector("#select-download-format");
            await startDownload(input_url.value,select_format_dl.value,"none");
            break;
        
        
        case "convert":
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

let files_list = []
async function getFiles(){
    files_list = await getRequest("/api/v1/files/list");
}

async function reloadFilesList(){
    files_list_tag.innerHTML = '';
    await getFiles();
    const files_list_tag = document.querySelector("#files-list");
    let dom = ""
    console.log(files_list)
    for (el of files_list.data){
        if (!el.endsWith(".part")){
            dom+=`<li>${el}<a href="/api/v1/files/download/${el}" download>Download</a></li>`
        }
    }
    files_list_tag.innerHTML = dom;
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
    let dom = ''
    action_options_display.innerHTML=dom;

}

async function setActionsDisplayQRCode(){
    let dom = ''
    action_options_display.innerHTML=dom;

}