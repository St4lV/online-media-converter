const { Router } = require("express");
const router = Router();

const Download = require("../../express_utils/class/Download");

router.post("/", async (req, res)=>{
    const { url, format, quality, audio_only} = req.body;
    const download = new Download(url,format,quality, audio_only);
    const result = await download.start();
    res.status(result.code).json({data:result.data});
})

router.get("/:url", async(req, res)=> {
	const { url  }= req.params;
	const link = new Download(url);
	const result = await link.getData();
	res.status(result.code).json({ data: result.data });

})

module.exports = router;