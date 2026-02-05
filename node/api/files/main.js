const { Router } = require("express");
const router = Router();
const DownloadedFiles = require("../../express_utils/class/DownloadedFiles")

router.get("/list", async (req, res) => {
	const dl_files = new DownloadedFiles();
	const files = await dl_files.getFiles();
	return res.status(files.code).json({ data: files.data });
});

router.get("/download/:file_name", async (req, res) => {
	req.setTimeout(0);
	const { file_name } = req.params;
	const dl_files = new DownloadedFiles();
	const files = await dl_files.getByName(file_name);
	if (files.code !== 200){
		return res.status(files.code).json({ data: files.data });
	}
	return res.status(200).sendFile(files.data);
});

router.get("/storage", async (req, res) => {
	const dl_files = new DownloadedFiles();
	const result = await dl_files.getAvailableStorage();
	return res.status(result.code).json({ data: result.data });
});

router.delete("/:file_name",async (req, res) => {
	const { file_name } = req.params;
	const dl_files = new DownloadedFiles();
	const files = await dl_files.removeByName(file_name);
	return res.status(files.code).json({ data: files.data });
})

// Adapted from :
// https://www.geeksforgeeks.org/node-js/how-to-implement-file-uploading-and-downloading-with-express/

router.post("/", async (req, res) => {
    
    if (req.files && req.files.file) {
        const uploaded_file = req.files.file;
		const upload_file = new DownloadedFiles();
		const result = await upload_file.upload(uploaded_file)
        res.status(result.code).json({data:result.data})
    } else {
        res.status(400).json({ data: "Bad request" });
    }
});

module.exports = router;