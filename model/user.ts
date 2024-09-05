import { IUser } from "./iuser";
import { IAuthTokenData } from "./iauth_token_data";
import { environment } from "../environments/environment.prod";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class User implements IUser {
    
    user_id: number;
    email: string;
    name: string;

    constructor() {
        this.user_id = -1;
        this.email = "";
        this.name = "";
    }
    
    static hashPassword(password: string) : string {
        const ROUNDS: number = 10;
        const SALT: string = bcrypt.genSaltSync(ROUNDS);
        console.log("Salt", SALT);

        let password_hash = bcrypt.hashSync(password, SALT);
        console.log("Hash", password_hash);

        return password_hash;
    }

    static passwordMatchesHash(password: string, password_hash: string) : boolean {
        let login: boolean = bcrypt.compareSync(password, password_hash);
        return login;
    }
    
    static createJwtToken(user_id: number, email: string) : string {
        const token_data: IAuthTokenData = {
            user_id: user_id,
            email: email,
            login_permission: true
        };

        const options = { expiresIn: 3600 };
        const token = jwt.sign(token_data, environment.jwt_key, options);
        return token;
    }

    static verifyJwtToken(token: string) : IAuthTokenData {
        try {
            const token_data = jwt.verify(token, environment.jwt_key) as IAuthTokenData;

            console.log(token_data);

            if (token_data.login_permission) {
                console.log(`Authenticated user ${token_data.email}`)
                return token_data;
            } else {
                throw Error("No authorization")
            }

        } catch(error) {
            throw Error("JWT token verification failed");
        }
    }

}
