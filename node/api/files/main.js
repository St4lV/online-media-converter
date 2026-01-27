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

router.delete("/:file_name",async (req,res) => {
	const { file_name } = req.params;
	const dl_files = new DownloadedFiles();
	const files = await dl_files.removeByName(file_name);
	return res.status(files.code).json({ data: files.data });
})

module.exports = router;