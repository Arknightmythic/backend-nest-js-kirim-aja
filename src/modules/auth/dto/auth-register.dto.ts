import { z, ZodObject } from 'zod';

const authRegisterSchema = z.object({
    name: z.string({
        required_error: 'name is required',
        invalid_type_error: 'name must be a string',
    }).min(1,'name is required'),
    email: z
        .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
        .email({
            message: 'Invalid email format',
        }),
    password: z
        .string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        })
        .min(8, 'number must be at last 8 characters long'),
    phone_number: z
        .string({
            required_error: 'number is required',
            invalid_type_error: 'number must be a string',
        })
        .min(10, 'number must be at last 10 characters long'),
});

export class AuthRegisterDto {
    static schema: ZodObject<any> = authRegisterSchema;
    constructor(
        public readonly email: string,
        public readonly name: string,
        public readonly phone_number: string,
        public readonly password: string,
    ) {}
}
