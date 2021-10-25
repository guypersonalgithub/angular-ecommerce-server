const express = require("express");
const usersController = require("./controllers/users-controller");
const productsController = require("./controllers/products-controller");
const cartsController = require("./controllers/carts-controller");
const ordersController = require("./controllers/orders-controller");
const categoriesController = require("./controllers/categories-controller");
// const fileUpload = require("express-fileupload");
const errorHandler = require('./errors/error-handler');
const bodyParser = require("body-parser");
const server = express();

const cors = require("cors");
require("dotenv").config();

const corsOptions = {

    origin: process.env.URL,
    optionsSuccessStatus: 200 

}

server.use(cors(corsOptions));

server.use(express.static('uploads'));
// server.use(fileUpload());

const loginFilter = require("./middleware/login-filter");

server.use(express.json());
server.use(bodyParser.urlencoded( { extended: false}));
server.use(bodyParser.json());
server.use(loginFilter());

server.use("/api/users", usersController);
server.use("/api/products", productsController);
server.use("/api/carts", cartsController);
server.use("/api/orders", ordersController);
server.use("/api/categories", categoriesController);

server.use(errorHandler);

server.listen(process.env.PORT || 3000, () => {

    console.log(`Listening on ${process.env.PORT}`);
    
});