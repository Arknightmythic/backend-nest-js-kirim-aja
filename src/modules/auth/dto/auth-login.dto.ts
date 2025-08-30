import { z, ZodObject } from "zod";

const authLoginSchema = z.object({
    email:z.string({
            required_error:'Email is required',
            invalid_type_error:'Email must be a string'
        }).email({
            message:'Invalid email format'
        }
    ),
    password:z.string({
         required_error:'Password is required',
        invalid_type_error:'Password must be a string'
    }).min(8, 'password must be at last 8 characters long')
})


export class AuthLoginDto{
    static schema: ZodObject<any> = authLoginSchema
    constructor(
        public readonly email:string,
        public readonly password:string
    ){}
}