import { IUser } from "../model/iuser";
import { User } from "../model/user";
import { DataAccessController } from "./data_access_controller";

export class UserDataController extends DataAccessController{
    
    static async insertUser(user: IUser, password_hash: string) : Promise<void> {
        await DataAccessController.createDataSchemaUsers();
        let results = await DataAccessController.pool.query(
            "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)",
            [user.email, user.name, password_hash]
        );
        if (typeof results.rowCount !== 'undefined' && results.rowCount > 0) {
            return;
        }
        throw new Error("Empty result");
    }

    static async selectUsers() : Promise<IUser[]> {
        let users: User[] = [];
        let results = await DataAccessController.pool.query(
            "SELECT user_id, email, name FROM users",
            // depending on data volume, only user_id or email column should be selected
            []
        );
        // return result, ID is unique
        if (typeof results.rows !== 'undefined' && results.rows.length > 0) {
            for (let row of results.rows) {
                let user = new User();
                user.user_id = row.user_id;
                user.email = row.email;
                user.name = row.name;
                users.push(user);
            }
            return users;
        }
        throw new Error("User not found");
    }

    static async selectUserById(id: number) : Promise<IUser> {
        let results = await DataAccessController.pool.query(
            "SELECT user_id, email, name FROM users WHERE user_id = $1",
            [id]
        );
        // return result, ID is unique
        if (typeof results.rows !== 'undefined' && results.rows.length > 0) {
            let user = new User();
            user.user_id = results.rows[0].user_id;
            user.email = results.rows[0].email;
            user.name = results.rows[0].name;
            return user;
        }
        throw new Error("User not found");
    }

    static async selectUserByEmail(email: string) : Promise<IUser> {
        let results = await DataAccessController.pool.query(
            "SELECT user_id, email, name FROM users WHERE email = $1",
            [email]
        );
        // return result, email is unique
        if (typeof results.rows !== 'undefined' && results.rows.length > 0) {
            let user = new User();
            user.user_id = results.rows[0].user_id;
            user.email = results.rows[0].email;
            user.name = results.rows[0].name;
            return user;
        }
        throw new Error("User not found");
    }

    static async selectUserPasswordHash(email: string) : Promise<any> {
        let results = await DataAccessController.pool.query(
            "SELECT user_id, password_hash FROM users WHERE email = $1",
            [email]
        );
        // return result, ID is unique
        if (typeof results.rows !== 'undefined' && results.rows.length > 0) {
            if (typeof results.rows[0].password_hash !== 'undefined') {
                return { 
                    user_id: results.rows[0].user_id, 
                    password_hash: results.rows[0].password_hash
                };
            }
        }
        throw new Error("User not found");
    }

    static async updateUserById(user: User) : Promise<void> {
        let results = await DataAccessController.pool.query(
            "UPDATE users SET email = $1, name = $2 WHERE user_id = $3",
            [user.email, user.name, user.user_id]
        );
        if (typeof results.rowCount !== 'undefined' && results.rowCount > 0) {
            return;
        }
        throw new Error("Empty result");
    }

    static async deleteUser(id: number) : Promise<void> {
        let results = await DataAccessController.pool.query(
            "DELETE FROM users WHERE user_id = $1",
            [id]
        );
        if (typeof results.rowCount !== 'undefined' && results.rowCount > 0) {
            return;
        }
        throw new Error("Empty result");
    }

}