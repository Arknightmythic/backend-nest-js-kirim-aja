import { z, ZodObject } from 'zod';

const employeeBranchSchema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
            invalid_type_error: 'Name must be a string',
        })
        .min(1, { message: 'Name must be at least 1 character long' }),
    email: z
        .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
        .email({
            message: 'Invalid email format',
        }),
    address: z
        .string({
            required_error: 'Address is required',
            invalid_type_error: 'Address must be a string',
        })
        .min(1, { message: 'Address must be at least 1 characters' }),
    phone_number: z
        .string({
            required_error: 'Phone number is required',
            invalid_type_error: 'Phone number must be string',
        })
        .min(10, { message: 'Phone number must be at least 1 characters' }),
    branch_id: z
        .number({
            required_error: 'Branch ID is required',
            invalid_type_error: 'Branch ID must be number',
        })
        .int({ message: 'Branch ID must be at least 1 characters' }),
    type: z
        .string({
            required_error: 'Type is required',
            invalid_type_error: 'Type must be a string',
        })
        .min(1, { message: 'Type must be at least 1 characters' }),
    role_id: z
        .number({
            required_error: 'Role ID is required',
            invalid_type_error: 'Role ID must be number',
        })
        .int({ message: 'Role ID must be at least 1 characters' }),
    password: z
        .string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        })
        .min(8, 'password must be at last 8 characters long'),
    avatar: z.string({}).optional().nullable(),
});

export class CreateEmployeeBranchDto {
    static schema: ZodObject<any> = employeeBranchSchema;

    constructor(
        public name: string,
        public email: string,
        public address: string,
        public phone_number: string,
        public branch_id: number,
        public type: string,
        public role_id: number,
        public password: string,
        public avatar: string|null,
    ) {}
}
