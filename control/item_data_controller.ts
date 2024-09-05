import { IItem } from "../model/iitem";
import { Item } from "../model/item";
import { IUser } from "../model/iuser";
import { DataAccessController } from "./data_access_controller";

export class ItemDataController extends DataAccessController {

    static async insertItem(user_id: number, item: IItem) : Promise<void> {
        await DataAccessController.createDataSchemaItems();
        let results = await DataAccessController.pool.query(
            "INSERT INTO items (item_id, title, is_active, user_id) VALUES ($1, $2, $3, $4)",
            [item.item_id, item.title, item.is_active, user_id]
        );
        if (typeof results.rowCount !== 'undefined' && results.rowCount > 0) {
            return;
        }
        throw new Error("Empty result");
    }

    static async selectItems(user_id: number) : Promise<IItem[]> {
        let items: Item[] = [];
        let results = await DataAccessController.pool.query(
            "SELECT item_id, title, is_active FROM items WHERE user_id = $1",
            // depending on data volume, only item_id or e.g. title column should be selected
            [user_id]
        );
        // return result, ID is unique
        if (typeof results.rows !== 'undefined' && results.rows.length > 0) {
            for (let row of results.rows) {
                let item = new Item();
                item.item_id = row.item_id;
                item.title = row.title;
                item.is_active = row.is_active;
                items.push(item);
            }
            return items;
        }
        throw new Error("No items for user found");
    }

    static async selectItem(user_id: number, item_id: string) : Promise<IItem> {
        let results = await DataAccessController.pool.query(
            "SELECT item_id, title, is_active FROM items WHERE user_id = $1 and item_id = $2",
            [user_id, item_id]
        );
        // return result, ID is unique
        if (typeof results.rows !== 'undefined' && results.rows.length > 0) {
            let item = new Item();
            item.item_id = results.rows[0].item_id;
            item.title = results.rows[0].title;
            item.is_active = results.rows[0].is_active;
            return item;
        }
        throw new Error("Item not found");
    }
    
    static async updateItem(user_id: number, item: IItem) : Promise<void> {
        let results = await DataAccessController.pool.query(
            "UPDATE items SET title = $1, is_active = $2 WHERE user_id = $3 and item_id = $4",
            [item.title, item.is_active, user_id, item.item_id]
        );
        if (typeof results.rowCount !== 'undefined' && results.rowCount > 0) {
            return;
        }
        throw new Error("Empty result");
    }

    static async deleteItem(user_id: number, item_id: string) : Promise<void> {
        let results = await DataAccessController.pool.query(
            "DELETE FROM items WHERE user_id = $1 and item_id = $2",
            [user_id, item_id]
        );
        if (typeof results.rowCount !== 'undefined' && results.rowCount > 0) {
            return;
        }
        throw new Error("Empty result");
    }
}
