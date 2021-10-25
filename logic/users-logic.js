const dao = require("../dao/users-dao");
const ErrorType = require("./../errors/error-type");
const cache = require("../cache/usersCache");
const config = require("../config.json")
const jwt = require("jsonwebtoken");
let ServerError = require("../errors/server-error");
const productsLogic = require("../logic/products-logic");
const ordersLogic = require("../logic/orders-logic");
const categoriesLogic = require("../logic/categories-logic");
const cartsLogic = require("../logic/carts-logic");

async function login (user) { // login

    let email = user.email;
    let password = user.password;

    if(email.slice(email.length-4) == ".com") {
        let check = email.indexOf("@");
        if (check == -1) {
            throw new ServerError (ErrorType.INCORRECT_INPUT.message);
        }
    }
    else {
        throw new ServerError (ErrorType.INCORRECT_INPUT.message);
    }

    if (password.length < 3 || password.length > 20) {
        throw new ServerError (ErrorType.INCORRECT_INPUT.message);
    }

    let loginUser = await dao.login(user);

    // post login

    const token = jwt.sign( { sub: loginUser.username_email }, config.secret);

    let categories = await categoriesLogic.getAllCategories();

    let products = await productsLogic.getAllProducts();

    let ordersStatistics = await ordersLogic.getAmountOfOrders();

    let cartExists = await cartsLogic.checkIfCartAlreadyExists(loginUser.user_id);

    let userData = {
        user_id : loginUser.user_id,
        first_name: loginUser.first_name,
        last_name : loginUser.last_name,
        username_email : loginUser.username_email,
        id_number : loginUser.id_number,
        city : loginUser.city,
        street : loginUser.street,
        role : loginUser.role,
        cart: cartExists
    }

    cache.setData(token, userData);

    let response = {
        token: token, 
        username_email: loginUser.username_email,
        id_number: loginUser.id_number,
        city: loginUser.city,
        street: loginUser.street,
        first_name: loginUser.first_name,
        last_name: loginUser.last_name,
        role: loginUser.role,
        categories: categories,
        products: products,
        orderStats: ordersStatistics,
        cart: cartExists
    };

    return response;
}

async function register (user) { // register

    let firstName = user.name;
    let lastName = user.lastName;
    let username = user.email + user.endingEmail;
    let id_number = user.id;
    let password = user.password;
    let city = user.city;
    let street = user.street;

    if (onlyLetters(firstName) == null) {
        throw new ServerError (ErrorType.INCORRECT_INPUT.message);
    }

    if (onlyLetters(lastName) == null) {
        throw new ServerError (ErrorType.INCORRECT_INPUT.message);
    }

    if(username.slice(username.length-4) == ".com") {
        let check = username.indexOf("@");
        if (check == -1) {
            throw new ServerError (ErrorType.INCORRECT_INPUT.message);
        }
    }
    else {
        throw new ServerError (ErrorType.INCORRECT_INPUT.message);
    }

    if (onlyDigits(id_number) == null) {
        throw new ServerError (ErrorType.INCORRECT_INPUT.message);
    }
    else {
        if (id_number.length != 9) {
            throw new ServerError (ErrorType.INCORRECT_INPUT.message);
        }
    }

    if (password.length < 3 || password.length > 20) {
        throw new ServerError (ErrorType.INCORRECT_INPUT.message);
    }

    if (onlyLettersAndSpaces(city) == null) {
        throw new ServerError (ErrorType.INCORRECT_INPUT.message);
    }

    if (onlyLettersSpacesAndDigits(street) == null) {
        throw new ServerError (ErrorType.INCORRECT_INPUT.message);
    }


    let registerUser = await dao.register(user);
    return registerUser;
}

async function getUserDetails (token) { // Gets all user details for a client-sided cache.

    let userCache = await cache.getData(token);
    if (userCache == null) { // Checks if the token sent already exists in the users map. If it doesn't, the client side will force said user to login again - this deals 
    // with the issue where the server is reset, while users remain logged-in from previous sessions.
        throw new ServerError (ErrorType.SERVER_RESET.message);
    }

    let categories = await categoriesLogic.getAllCategories();

    let products = await productsLogic.getAllProducts();

    let ordersStatistics = await ordersLogic.getAmountOfOrders();
    
    // console.log(userCache);

    // let user_id = userCache.user_id;

    // let userDetails = await dao.getUserDetails(user_id);
    return ([userCache, categories, products, ordersStatistics]);
}

async function getAllIDs () { // Gets all IDs.

    let getAllIDs = await dao.getAllIDs();
    return(getAllIDs);
}


function onlyLetters(str) { // Checks if the input is of only letters.
    return str.match("^[A-Za-z]+$");
}

function onlyLettersAndSpaces(str) { // Checks if the input is of only letters and spaces.
    return str.match("^[ A-Za-z]+$");
}

function onlyLettersSpacesAndDigits(str) { // Checks if the input is of only letters, spaces and digits.
    return str.match("^[ A-Za-z0-9]+$");
}

function onlyDigits(str) { // Checks if the input is of only digits.
    return str.match("^[0-9]+$");
}



module.exports = {
    login,
    register,
    getUserDetails,
    getAllIDs
}