const { Router } = require("express");
const router = Router();

const Download = require("../../express_utils/class/Download");

router.post("/", async (req, res)=>{
    const { url, format, quality} = req.body;
    const download = new Download(url,format,quality);
    const result = await download.start();
    res.status(200).json({sent:"true"});
})

module.exports = router;