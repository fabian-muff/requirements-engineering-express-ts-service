import express from "express";

import { IUser } from "../model/iuser"
import { User } from "../model/user";
import { UserDataController } from "../control/user_data_controller";

const PATH_PREFIX = '/api/v1/';

let router = express.Router();

// API v1
// Register, a singleton resource for creating a new user
// POST request
router.post(PATH_PREFIX + "register", (req, res) => {
    const { email, name, password } = req.body;
    console.log(req.method, req.url, email, name);
    console.log(req.headers);

    if (!(email != null && name != null && password!= null )){
        // response with status code 400 ("bad request")
        res.status(400).send("Missing input values");
        return;
    }

    let user: IUser = new User();
    user.email = email;
    user.name = name;

    let password_hash = User.hashPassword(password);

    // respond with status code 201 ("created")
    let prom = UserDataController.insertUser(user, password_hash);
    prom.then(result => {
        res.status(201).send();
    }).catch(error => {
        console.log(error);
        res.status(400).send(error.toString());
    });
});

// Login, a singleton resource for login
// POST request
router.post(PATH_PREFIX + "login", (req, res) => {
    const { email, password } = req.body;
    console.log(req.method, req.url, email);

    if (!(email != null && password!= null )){
        res.status(400).send("Missing input values");
        return;
    }

    let prom = UserDataController.selectUserPasswordHash(email);
    prom.then(user_pw_hash => {
        let user_id = user_pw_hash.user_id;
        let password_hash = user_pw_hash.password_hash;
        console.log(user_id, password_hash);
        let token = "";
        if (User.passwordMatchesHash(password, password_hash)) {
            token = User.createJwtToken(user_id, email);
            console.log(token);
            // respond with status code 200 ("ok") with the token
            res.status(200).send(token);
        } else {
            res.status(400).send("Invalid credentials");
        }
    }).catch(error => {
        console.log(error);
        res.status(400).send("Invalid credentials");
    });
});

// Get the collection resource "users"
// GET request
router.get(PATH_PREFIX + "users", (req, res) => {
    console.log(req.method, req.url);
    
    // authenticate with token sent along in the header
    try {
        const token = req.headers["x-access-token"] as string;
        let token_data = User.verifyJwtToken(token);
    } catch(error) {
        res.status(403).send("Authentication failed");
        return;
    }

    let prom = UserDataController.selectUsers();
    prom.then(users => {
        console.log(users);
        res.status(200).json(users);
    }).catch(error => {
        console.log(error);
        res.status(400).send(error.toString());
    });
});

// Get a user, a singleton resource, from collection resource "users"
// GET request
router.get(PATH_PREFIX + "users/:id", (req, res) => {
    const { id } = req.params;
    console.log(req.method, req.url, id);
    //console.log(req.headers);
    //console.log(req.body);

    try {
        const token = req.headers["x-access-token"] as string;
        let token_data = User.verifyJwtToken(token);
    } catch(error) {
        res.status(403).send("Authentication failed");
        return;
    }

    if (!id) {
        res.status(400).send("Missing input values");
        return;
    }
    let prom = UserDataController.selectUserById(parseInt(id));
    prom.then(user => {
        res.status(200).json(user);
    }).catch(error => {
        console.log(error);
        res.status(400).send(error.toString());
    });
});

// Get a collection resource "users" and filter by e-mail
// GET request
router.get(PATH_PREFIX + "users", (req, res) => {
    const { email } = req.params;
    console.log(req.method, req.url, email);

    try {
        const token = req.headers["x-access-token"] as string;
        let token_data = User.verifyJwtToken(token);
    } catch(error) {
        res.status(403).send("Authentication failed");
        return;
    }

    if (!email) {
        res.status(400).send("Missing input values");
        return;
    }
    let user = new User();
    user.email = email;

    let prom = UserDataController.selectUserByEmail(email);
    prom.then(user => {
        res.status(200).json(user);
    }).catch(error => {
        console.log(error);
        res.status(400).send(error.toString());
    });

});

// Get sub-resource "name" of singleton resource from collection resource
// GET request
router.get(PATH_PREFIX + "users/:id/name", (req, res) => {
    const { id } = req.params;
    console.log(req.method, req.url, id);

    try {
        const token = req.headers["x-access-token"] as string;
        let token_data = User.verifyJwtToken(token);
    } catch(error) {
        res.status(403).send("Authentication failed");
        return;
    }

    if (!id) {
        res.status(400).send("Missing input values");
        return;
    }

    let prom = UserDataController.selectUserById(parseInt(id));
    prom.then(user => {
        res.status(200).json(user.name);
    }).catch(error => {
        console.log(error);
        res.status(400).send(error.toString());
    });
});

// Update singleton resource
// PUT request
router.put(PATH_PREFIX + "users/:id", (req, res) => {
    const { id } = req.params;
    const { email, name } = req.body;
    console.log(req.method, req.url, id, email, name);

    try {
        const token = req.headers["x-access-token"] as string;
        let token_data = User.verifyJwtToken(token);
    } catch(error) {
        res.status(403).send("Authentication failed");
        return;
    }

    if (!(id != null && email != null && name != null )){
        res.status(400).send("Missing input values");
        return;
    }

    let user = new User();
    user.user_id = parseInt(id);
    user.email = email;
    user.name = name;

    let prom = UserDataController.updateUserById(user);
    prom.then(result => {
        res.status(200).send()
    }).catch(error => {
        console.log(error);
        res.status(400).send(error.toString());
    });
});

// Delete singleton resource
// DELETE request
router.delete(PATH_PREFIX + "users/:id", (req, res) => {
    const { id } = req.params;
    console.log(req.method, req.url, id);

    try {
        const token = req.headers["x-access-token"] as string;
        let token_data = User.verifyJwtToken(token);
    } catch(error) {
        res.status(403).send("Authentication failed");
        return;
    }

    if (!id) {
        res.status(400).send("Missing input values");
        return;
    }

    let prom = UserDataController.deleteUser(parseInt(id));
    prom.then(result => {
        res.status(200).send();
    }).catch(error => {
        console.log(error);
        res.status(400).send(error.toString());
    });
});

// Functions such as update, delete or others may alternatively be called 
// under a resource name describing an action, e.g.:
// manage/update, manage/delete, [...] with a GET or POST request
router.get(PATH_PREFIX + "users/:id/manage/delete", (req, res) => {
    const { id } = req.params;
    console.log(req.method, req.url, id);

    try {
        const token = req.headers["x-access-token"] as string;
        let token_data = User.verifyJwtToken(token);
    } catch(error) {
        res.status(403).send("Authentication failed");
        return;
    }

    if (!id) {
        res.status(400).send("Missing input values");
        return;
    }

    let prom = UserDataController.deleteUser(parseInt(id));
    prom.then(result => {
        res.status(200).send()
    }).catch(error => {
        console.log(error);
        res.status(400).send(error.toString());
    });
});

export { router };
