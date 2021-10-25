const express = require("express");
const categoriesLogic = require("../logic/categories-logic");
const ErrorType = require("./../errors/error-type");
const router = express.Router();

router.get("/allcategories", async (request, response) => { // Gets all categories.

    try {
        const allCategories = await categoriesLogic.getAllCategories();
        response.send (allCategories);
    }
    catch (error) {
        response.status(ErrorType.GENERAL_ERROR.httpCode).send(ErrorType.GENERAL_ERROR.message);
    }
})

module.exports = router;