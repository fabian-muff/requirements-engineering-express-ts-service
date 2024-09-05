import { Pool } from "pg";
import { environment } from "../environments/environment.prod";

export class DataAccessController {

    protected static pool = new Pool({
        user: environment.db_user,
        host: environment.db_host,
        database: environment.db_name,
        password: environment.db_pass,
        port: environment.db_port,
        statement_timeout: 2000
    });

    constructor() {
    }

    static async createDataSchemaUsers() : Promise<void> {
        let statements = [
            "CREATE TABLE IF NOT EXISTS users (user_id serial, email text UNIQUE, name text, password_hash text, PRIMARY KEY (user_id))"
        ];
        for (let s of statements) {
            let results = await DataAccessController.pool.query(s);
            if (typeof results.rows !== 'undefined') {
                return;
            }
            throw new Error("Empty result");
        }
    }

    static async createDataSchemaItems() : Promise<void> {
        let statements = [
            "CREATE TABLE IF NOT EXISTS items (item_id uuid, title text, is_active bool, user_id int, PRIMARY KEY (item_id), FOREIGN KEY (user_id) REFERENCES users(user_id))"
        ];
        for (let s of statements) {
            let results = await DataAccessController.pool.query(s);
            if (typeof results.rows !== 'undefined') {
                return;
            }
            throw new Error("Empty result");
        }
    }
}
