const { Router } = require("express");
const router = Router();
const DownloadedFiles = require("../../express_utils/class/DownloadedFiles")
const root = require("../../root")

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
        const uploadedFile = req.files.file;
        const uploadPath = root() + "/downloaded/" + uploadedFile.name;
        uploadedFile.mv(uploadPath, function (err) {
            if (err) {
                console.log(err);
                res.status(500).json({ data: err });
            } else {
                res.status(201).json({ data: "Created" });
            }
        });
    } else {
        res.status(400).json({ data: "Bad request" });
    }
});

module.exports = router;