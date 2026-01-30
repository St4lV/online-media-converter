const { Router } = require("express");
const router = Router();

const Download = require("../../express_utils/class/Download");

router.post("/", async (req, res)=>{
    const { url, format, quality} = req.body;
    const download = new Download(url,format,quality);
    const result = await download.start();
    res.status(result.code).json({data:result.data});
})

module.exports = router;