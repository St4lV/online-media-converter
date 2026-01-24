const { Router } = require("express");
const router = Router();
const fs = require("fs");
const { URLize } = require("../../express_utils/utils")

router.get("/list", async (req, res) => {
  const testFolder = './downloaded';
  
  fs.readdir(testFolder, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json({ data: files });
  });
});

router.get("/download/:file_name", async (req, res) => {
  
  const { file_name } = req.params;
  const testFolder = './downloaded';
  
  fs.readdir(testFolder, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    let file_found = false;
    for (el of files){
      if (URLize(el) === URLize(file_name)){
        const path = require('path');

        const file_path = path.resolve(__dirname, '../../downloaded', el);
        file_found=true;
        console.log(file_path)
        res.sendFile(file_path);
      }
    }
    if (!file_found){
      return res.status(404).json({data:"Not found !"})
    }
  });
});

module.exports = router;