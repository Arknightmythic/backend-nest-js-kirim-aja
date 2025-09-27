import { z } from 'zod';

const createShipmentSchema = z.object({
    pickup_address_id: z.number({
        required_error: 'pickup_address_id is required',
        invalid_type_error: 'pickup_address_id must be a number',
    }).int({
        message: 'Pickup address id must be an integer',
    }),
    destination_address: z.string({
        required_error: 'destination_address is required',
        invalid_type_error: 'destination_address must be a string',
    }).min(1,{
        message: 'Destination address id cannot be empty',
    }),
    receipient_name:z.string({
        required_error:'receipient_name is required',
        invalid_type_error:'receipient_name must be a string',
    }).min(1,{
        message:'Receipent name cannot be empty',
    }),
    recipient_phone:z.string({
        required_error:'Receipient phone is required',
        invalid_type_error:'Receipient phone must be a string',
    }).min(10,{
        message:'Receipient phone must be at least 10 characters long',
    }),
    weight:z.number({
        required_error:'weight is required',
        invalid_type_error:'weight must be a number',
    }).positive({
        message:'weight must be a positive number',
    }),
    package_type:z.string({
        required_error:'package_type is required',
        invalid_type_error:'package_type must be a string',
    }).min(1,{
        message:'package_type cannot be empty',
    }),
    delivery_type:z.string({
        required_error:'delivery_type is required',
        invalid_type_error:'delivery_type must be a string',
    }).min(1,{
        message:'delivery_type cannot be empty',
    })
});

export class CreateShipmentDto {
    static schema:z.ZodObject<any> = createShipmentSchema;

    constructor(
        public pickup_address_id:number,
        public destination_address:string,
        public receipient_name:string,
        public recipient_phone:string,
        public weight:number,
        public package_type:string,
        public delivery_type:string,
    ){}
}
