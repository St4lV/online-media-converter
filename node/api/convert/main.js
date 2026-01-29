const Convert = require("../../express_utils/class/Convert");

const { Router } = require("express");
const router = Router();

router.post("/", async(req,res)=>{
    const { file_name, new_format } = req.body;
    const convert_controller = new Convert(file_name);
    const result = await convert_controller.start(new_format);
    return res.status(result.code).json({data:result.data})

});

module.exports = router;