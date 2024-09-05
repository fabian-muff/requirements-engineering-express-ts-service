import { IItem } from "./iitem";
import { IUser } from "./iuser";

export class Item implements IItem {

    item_id: string;
    title: string;
    is_active: boolean;
    user_id?: number;

    constructor() {
        this.item_id = "";
        this.title = "";
        this.is_active = false;
    }

}
