const QRCode = require('qrcode');
const { Router } = require("express");
const router = Router();

router.get("/:url", async (req, res) => {
    const { url } = req.params;
    try {
        const result = await genQRCode(url);
        return res.status(200).type("image/png").send(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate QR code" });
    }
});

async function genQRCode(url) {
    const qrCodeBuffer = await QRCode.toBuffer(url);
    return qrCodeBuffer;
}

module.exports = router;