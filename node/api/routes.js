const { Router } = require("express");
const router = Router();

const convert_routes = require("./convert/main");

router.use(`/convert`, convert_routes);

const download_routes = require("./download/main");

router.use(`/download`, download_routes);

const files_routes = require("./files/main");

router.use(`/files`, files_routes);
/*
const qrcode_routes = require("./qrcode/main");

router.use(`/qrcode`, qrcode_routes);
*/
module.exports = router;