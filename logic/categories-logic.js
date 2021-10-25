const dao = require("../dao/categories-dao");

let allCategories = [];

async function getAllCategories () { // Gets all categories.

    if (allCategories.length == 0) {

        const getAllCategories = await dao.getAllCategories();

        allCategories = getAllCategories;

        return getAllCategories;

    }

    return allCategories;

}

getAllCategories();

module.exports = {
    getAllCategories
}