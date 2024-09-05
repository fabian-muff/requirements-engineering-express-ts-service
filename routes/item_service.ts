import express from "express";

import { IItem } from "../model/iitem";
import { Item } from "../model/item";
import { User } from "../model/user";
import { ItemDataController } from "../control/item_data_controller";

const PATH_PREFIX = '/api/v1/';

let router = express.Router();

// API v1
// Post a new item to the collection resource "items"
// POST request
router.post(PATH_PREFIX + "items", (req, res) => {
    const { item_id, title, is_active } = req.body;
    console.log(req.method, req.url, item_id, title, is_active);
    console.log(req.headers);

    // authenticate with token sent along in the header
    let token_data;
    try {
        const token = req.headers["x-access-token"] as string;
        token_data = User.verifyJwtToken(token);
        console.log(token_data.user_id);
    } catch(error) {
        res.status(403).send("Authentication failed");
        return;
    }

    if (!(item_id != null && title != null && is_active != null)) {
        // response with status code 400 ("bad request")
        res.status(400).send("Missing input values");
        return;
    }

    let item: IItem = new Item();
    item.item_id = item_id;
    item.title = title;
    item.is_active = is_active;
    item.user_id = token_data.user_id;

    // respond with status code 201 ("created")
    let prom = ItemDataController.insertItem(token_data.user_id, item);
    prom.then(result => {
        res.status(201).send();
    }).catch(error => {
        console.log(error);
        res.status(400).send(error.toString());
    });
});

// Get the collection resource "items"
// GET request
router.get(PATH_PREFIX + "items", (req, res) => {
    console.log(req.method, req.url);
    
    // authenticate with token sent along in the header
    let token_data;
    try {
        const token = req.headers["x-access-token"] as string;
        token_data = User.verifyJwtToken(token);
    } catch(error) {
        res.status(403).send("Authentication failed");
        return;
    }

    let prom = ItemDataController.selectItems(token_data.user_id);
    prom.then(items => {
        console.log(items);
        res.status(200).json(items);
    }).catch(error => {
        console.log(error);
        res.status(400).send(error.toString());
    });
});


// Get an item, a singleton resource, from collection resource "items"
// GET request
router.get(PATH_PREFIX + "items/:id", (req, res) => {
    const { id } = req.params;
    console.log(req.method, req.url, id);

    let token_data;
    try {
        const token = req.headers["x-access-token"] as string;
        token_data = User.verifyJwtToken(token);
    } catch(error) {
        res.status(403).send("Authentication failed");
        return;
    }

    if (!id) {
        res.status(400).send("Missing input values");
        return;
    }
    let prom = ItemDataController.selectItem(token_data.user_id, id);
    prom.then(item => {
        res.status(200).json(item);
    }).catch(error => {
        console.log(error);
        res.status(400).send(error.toString());
    });
});

// Update singleton resource
// PUT request
router.put(PATH_PREFIX + "items/:id", (req, res) => {
    const { id } = req.params;
    const { item_id, title, is_active } = req.body;
    console.log(req.method, req.url, item_id, title, is_active);
    console.log(req.headers);

    let token_data;
    try {
        const token = req.headers["x-access-token"] as string;
        token_data = User.verifyJwtToken(token);
    } catch(error) {
        res.status(403).send("Authentication failed");
        return;
    }

    if (!(id != null && title != null && is_active!= null )) {
        res.status(400).send("Missing input values");
        return;
    }

    let item = new Item();
    item.item_id = item_id;
    item.title = title;
    item.is_active = is_active;
    item.user_id = token_data.user_id;

    let prom = ItemDataController.updateItem(token_data.user_id, item);
    prom.then(result => {
        res.status(200).send()
    }).catch(error => {
        console.log(error);
        res.status(400).send(error.toString());
    });
});

// Delete singleton resource
// DELETE request
router.delete(PATH_PREFIX + "items/:id", (req, res) => {
    const { id } = req.params;
    console.log(req.method, req.url, id);

    let token_data;
    try {
        const token = req.headers["x-access-token"] as string;
        token_data = User.verifyJwtToken(token);
    } catch(error) {
        res.status(403).send("Authentication failed");
        return;
    }

    if (!id) {
        res.status(400).send("Missing input values");
        return;
    }

    let prom = ItemDataController.deleteItem(token_data.user_id, id);
    prom.then(result => {
        res.status(200).send();
    }).catch(error => {
        console.log(error);
        res.status(400).send(error.toString());
    });
});

export { router };
