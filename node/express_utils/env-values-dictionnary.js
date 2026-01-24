require('dotenv').config();

// Values from .env file

const express_values = {
    port : process.env.EXPRESS_PORT,
    public_route : process.env.EXPRESS_PUBLIC_ROUTE
}

module.exports = { express_values }