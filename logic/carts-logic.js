const dao = require("../dao/carts-dao");
const productsLogic = require("../logic/products-logic");
const ErrorType = require("./../errors/error-type");
const cache = require("../cache/usersCache");
let ServerError = require("../errors/server-error");

async function checkIfCartAlreadyExists (user_id) { // Checks if a cart exists for the user.

    let checkIfCartExists = await dao.checkIfCartAlreadyExists(user_id);

    console.log(checkIfCartExists);

    if (!checkIfCartExists.creation_date) {

        return({

            cart_id: null,
            creation_date: null,
            order_date: null,
            cart_items: []

        });

    }

    else if (checkIfCartExists.order_date) {

        checkIfCartExists = {
            cart_id : checkIfCartExists.cart_id,
            creation_date : checkIfCartExists.creation_date,
            order_date : checkIfCartExists.order_date,
            cart_items: []
        }

    }

    else {

        let allItems = await getAllCartItems(checkIfCartExists.cart_id);

        checkIfCartExists = {
            cart_id : checkIfCartExists.cart_id,
            creation_date : checkIfCartExists.creation_date,
            order_date: null,
            cart_items: allItems
        }
    }

    return checkIfCartExists;

    // let cart_user_details = {
    //     user_id : userCache.user_id,
    //     first_name : userCache.first_name,
    //     last_name : userCache.last_name,
    //     username_email : userCache.username_email,
    //     id_number : userCache.id_number,
    //     city : userCache.city,
    //     street : userCache.street,
    //     role : userCache.role,
    //     cart: checkIfCartExists,
    // }
        
    // cache.deleteData(token);
    // cache.setData(token, cart_user_details);

}

async function createNewCart (token) { // Creates a new cart for the user if they doesn't have an available one.

    let userCache = await cache.getData(token);

    if (!userCache) { // Checks if the token sent already exists in the users map. If it doesn't, the client side will force said user to login again - this deals 
    // with the issue where the server is reset, while users remain logged-in from previous sessions.
        throw new ServerError (ErrorType.SERVER_RESET.message);
    }

    let user_id = userCache.user_id;

    if (userCache.cart.creation_date && userCache.cart.order_date || !userCache.cart.creation_date && !userCache.cart.order_date) {

        let date = new Date();
        date.setHours(0,0,0,0);

        let createNewCart = await dao.createNewCart(user_id, date);

        userCache.cart.cart_id = createNewCart.cart_id;
        userCache.cart.creation_date = date;
        userCache.cart.order_date = null;
        userCache.cart.cart_items = [];

        console.log(userCache);

        let cartData = {

            cart_id: userCache.cart.cart_id,
            creation_date: userCache.cart.creation_date,
            order_date: userCache.cart.order_date,
            cart_items: userCache.cart.cart_items

        }

        return cartData;

    }

    return ;
    // let user_id = userCache.user_id;

    // let checkIfCartExists = await dao.checkIfCartAlreadyExists(user_id);

    // if (checkIfCartExists.creation_date == null && checkIfCartExists.order_date == null || checkIfCartExists.creation_date != null && checkIfCartExists.order_date != null) {
    //     let createNewCart = await dao.createNewCart(user_id);

    //     let cart_user_details = {
    //         user_id : userCache.user_id,
    //         first_name : userCache.first_name,
    //         last_name : userCache.last_name,
    //         username_email : userCache.username_email,
    //         id_number : userCache.id_number,
    //         password : userCache.password,
    //         city : userCache.city,
    //         street : userCache.street,
    //         role : userCache.role,
    //         cart_id : createNewCart.cart_id,
    //     }
            
    //     cache.deleteData(token);
    //     cache.setData(token, cart_user_details);


    //     return (createNewCart);
    // }
    // else {
    //     throw new ServerError (ErrorType.CART_ALREADY_EXISTS.message);
    // }
    // return;
}

async function getAllCartItems (cart_id) { // Gets all cart items of the current cart.

    let allCartItems = await dao.getAllCartItems(cart_id);

    return(allCartItems);
}


async function addProductToCart (product, token) { // Adds a product to the cart.

    let userCache = await cache.getData(token);

    if (!userCache) { // Checks if the token sent already exists in the users map. If it doesn't, the client side will force said user to login again - this deals 
    // with the issue where the server is reset, while users remain logged-in from previous sessions.
        throw new ServerError (ErrorType.SERVER_RESET.message);
    }

    let cart_id = userCache.cart.cart_id;

    let checkProduct = await productsLogic.getProductByName(product.product_name);

    let currentProductPrice = product.price / product.amount;

    if (checkProduct.price == currentProductPrice) {

        let addProductToCart = await dao.addProductToCart(checkProduct.product_id, product, cart_id);

        userCache.cart.cart_items.push(product);

        return(addProductToCart);

    }
    else {

        throw new ServerError (ErrorType.PRICE_MISMATCH.message);

    }
}

async function updateProductInCart (product, token) { // Updates a product's values in the cart.

    let userCache = await cache.getData(token);

    if (userCache == null) { // Checks if the token sent already exists in the users map. If it doesn't, the client side will force said user to login again - this deals 
    // with the issue where the server is reset, while users remain logged-in from previous sessions.
        throw new ServerError (ErrorType.SERVER_RESET.message);
    }

    let cart_id = userCache.cart.cart_id;
    
    let checkProduct = await productsLogic.getProductByName(product.product_name);

    let currentProductPrice = product.price / product.amount;

    if (checkProduct.price == currentProductPrice) {

        let addProductToCart = await dao.updateProductInCart(checkProduct.product_id, product, cart_id);

        for (let i = 0; i < userCache.cart.cart_items.length; i++) {

            if (userCache.cart.cart_items[i].product_name == checkProduct.product_name) {

                userCache.cart.cart_items[i].price = product.price;
                userCache.cart.cart_items[i].amount = product.amount;

                break;

            }

        }

        return(addProductToCart);
    }
    else {
        throw new ServerError (ErrorType.PRICE_MISMATCH.message);
    }
}

async function removeProductFromCart (product, token) { // Removes a product from the cart.

    let userCache = await cache.getData(token);

    if (userCache == null) { // Checks if the token sent already exists in the users map. If it doesn't, the client side will force said user to login again - this deals 
    // with the issue where the server is reset, while users remain logged-in from previous sessions.
        throw new ServerError (ErrorType.SERVER_RESET.message);
    }

    let cart_id = userCache.cart.cart_id;

    let checkProduct = await productsLogic.getProductByName(product);

    if (checkProduct.product_id) {

        let removeProductFromCart = await dao.removeProductFromCart(checkProduct.product_id, cart_id);

        for (let i = 0; i < userCache.cart.cart_items.length; i++) {

            if (userCache.cart.cart_items[i].product_name == checkProduct.product_name) {

                userCache.cart.cart_items.splice(i, 1);
                break;

            }

        }

        return removeProductFromCart;

    }
    else {

        throw new ServerError (ErrorType.PRODUCT_NOT_FOUND.message);

    }

}


async function removeAllProductsFromCart (token) { // Removes all products from the cart.

    let userCache = await cache.getData(token);

    if (userCache == null) { // Checks if the token sent already exists in the users map. If it doesn't, the client side will force said user to login again - this deals 
    // with the issue where the server is reset, while users remain logged-in from previous sessions.
        throw new ServerError (ErrorType.SERVER_RESET.message);
    }

    let cart_id = userCache.cart.cart_id;

    let removeProductsFromCart = await dao.removeAllProductsFromCart(cart_id);

    userCache.cart.cart_items = [];

    return removeProductsFromCart;
}

module.exports ={
    checkIfCartAlreadyExists,
    createNewCart,
    getAllCartItems,
    addProductToCart,
    updateProductInCart,
    removeProductFromCart,
    removeAllProductsFromCart
} 