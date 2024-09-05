import { IUser } from "./iuser";

export interface IItem {
    item_id: string;
    title: string;
    is_active: boolean;
    user_id?: number;
}
