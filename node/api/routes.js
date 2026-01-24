const { Router } = require("express");
const router = Router();

const download_routes = require("./download/main");

router.use(`/download`, download_routes);

const files_routes = require("./files/main");

router.use(`/files`, files_routes);

module.exports = router;