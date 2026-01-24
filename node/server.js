const express = require('express');
const { express_values } = require("./express_utils/env-values-dictionnary");
const app = express();
const port = express_values.port;

app.use(express.json());
app.set('trust proxy', true);

const api_routes = require("./api/routes");
app.use(`/${express_values.public_route}`, api_routes);

app.get('/main.js', async (req, res) => {
    return res.status(200).sendFile('main.js', { root: __dirname + "/client/" });
});
app.get('/styles.css', async (req, res) => {
    return res.status(200).sendFile('styles.css', { root: __dirname + "/client/" });
});
app.get('/favicon.ico', async (req, res) => {
    return res.status(200).sendFile('favicon.ico', { root: __dirname + "/client/" });
});

app.get('/', async (req, res) => {
    return res.status(200).sendFile('index.html', { root: __dirname + "/client/" });
});

app.listen(port, async () => {
    console.log(`Server is running on port ${port}.`);
});