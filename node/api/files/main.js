const { Router } = require("express");
const router = Router();
const DownloadedFiles = require("../../express_utils/class/DownloadedFiles")

router.get("/list", async (req, res) => {
    const dl_files = new DownloadedFiles();
    const files = await dl_files.getFiles();
    res.status(files.code).json({ data: files.data });
});

router.get("/download/:file_name", async (req, res) => {
  
  const { file_name } = req.params;
  const dl_files = new DownloadedFiles();
  const files = await dl_files.getByName(file_name);
  if (files.code !== 200){
    res.status(files.code).json({ data: files.data });
  }
  res.status(200).sendFile(files.data);
});

router.delete("/:file_name",async (req,res) => {
  const { file_name } = req.params;
  const dl_files = new DownloadedFiles();
  const files = await dl_files.removeByName(file_name);
  res.status(files.code).json({ data: files.data });

})

module.exports = router;