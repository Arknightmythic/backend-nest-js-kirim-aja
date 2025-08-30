import { z, ZodObject } from "zod";

const updateRoleSchema = z.object({
    permission_ids: z.array(z.number({
            required_error:'permissions IDs is required',
            invalid_type_error:'permissions IDs must be a string'
        })
    ).nonempty({
        message:'At least one permissions ID must be provided'
    })
})



export class UpdateRoleDto{
    static schema:ZodObject<any>=updateRoleSchema;

    constructor(public permission_ids:number[]){}
}