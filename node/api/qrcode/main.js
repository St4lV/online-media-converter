const QRCode = require('qrcode');
const { Router } = require("express");
const router = Router();
const root = require("../../root");

router.get("/:url", async (req, res) => {
	const { url } = req.params;
	try {
		const result = await genQRCode(url);
		return res.status(200).type("image/png").send(result);
	} catch (error) {
		res.status(500).json({ error: "Failed to generate QR code" });
	}
});

router.post("/", async (req, res) => {
	const { url } = req.body;
	try {
		await saveQRCode(url);
		return res.status(201).json({ data: "Created." });
	} catch (error) {
		console.error("QR save error:", error);
		res.status(500).json({ error: "Failed to save QR code" });
	}
});

async function genQRCode(url) {
	const qrCodeBuffer = await QRCode.toBuffer(url);
	return qrCodeBuffer;
}

async function saveQRCode(url) {
	const safeName = url.split("https://")[1].replace(/[^a-zA-Z0-9_-]/g, "_");
	const filePath = root() + "/downloaded/" + safeName + ".png";
	await QRCode.toFile(filePath, url);
}

module.exports = router;