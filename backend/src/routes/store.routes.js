const express = require("express");
const storeController = require("../controllers/store.controller");
const { authenticateUser, authorizeRoles } = require("../middleware/user.authentication.middleware");

const storeRouter = express.Router();

// Apply authentication and authorization middleware to all store routes
storeRouter.use(authenticateUser, authorizeRoles("USER")); 

//to get the list of all stores and to get a specific store by its ID
storeRouter.get("/", storeController.getStores);
storeRouter.get("/:id", storeController.getStoreById);

module.exports = storeRouter;