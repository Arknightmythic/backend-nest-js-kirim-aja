import { z } from "zod";

const createUserAddressSchema = z.object({
    address:z.string({
        required_error:'address is required',
        invalid_type_error:'address must be a string'
    }).min(1,{message:'Address cannot be empty'}),
    tag:z.string({
        required_error:'tag is required',
        invalid_type_error:'tag must be a string'
    }).min(1,{message:'Tag cannot be empty'}),
    label:z.string({
        required_error:'label is required',
        invalid_type_error:'label must be a string'
    }).min(1,{message:'Label cannot be empty'}),
    photo:z.string().optional().nullable(),

});

export class CreateUserAddressDto {
    static schema:z.ZodObject<any> = createUserAddressSchema

    constructor(
        public address:string,
        public tag:string,
        public label:string,
        public photo?:string | null,
    ){}
}
