import { PartialType } from '@nestjs/mapped-types';
import { z, ZodObject } from 'zod';


const updateProfileSchema = z.object({
    name: z.string({
        required_error:'name is required',
        invalid_type_error:'name must be a string'
    }).optional(),
     email: z
        .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
        .email({
            message: 'Invalid email format',
        }).optional(),
    password: z
        .string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        })
        .min(8, 'number must be at last 8 characters long').optional(),
    phone_number: z
        .string({
            required_error: 'number is required',
            invalid_type_error: 'number must be a string',
        })
        .min(10, 'number must be at last 10 characters long').optional(),
    avatar: z.string({
        required_error:'avatar is required',
        invalid_type_error:'avatar must be a string'
    })
    .optional()
    .nullable(),

})

export class UpdateProfileDto {
    static schema: ZodObject<any> = updateProfileSchema;

    constructor(
        public name?:string,
        public email?:string,
        public phone_number?:string,
        public password?:string,
        public avatar?:string | null
    ){}
}
