const go_button = document.querySelector("#start-process");
const select_action = document.querySelector("#select-process");
const input_url = document.querySelector("#url-input");
const select_format_dl = document.querySelector("#select-download-format");

go_button.addEventListener("click",async function() {
    console.log(select_action.value,input_url.value,select_format_dl.value)
   await selectActionMode();
});

async function selectActionMode(){
    switch (select_action.value){
        
        case "download":
            await startDownload(input_url.value,select_format_dl.value,"none");
            break;
        
        
        case "convert":
            break;
        

        case "qr-code":
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

let files_list = []
async function getFiles(){
    files_list = await getRequest("/api/v1/files/list");
}

async function reloadFilesList(){
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

reloadFilesList();