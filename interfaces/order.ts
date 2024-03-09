import { ISize, IUser } from ".";

export interface IOrder {
    _id?: string;
    name?: IUser | string;
    orderItems: IOrderItem[];
    shippingAddress: ShippingAddress;
    paymentResult?: string;
    numberOfItems: number;
    subTotal: number;
    tax: number;
    total: number;
    isPaid: boolean;
    paidAt?: string;
    transactionId?: string;
    createdAt?: string;
    payment?: any;
    isSatisfying?: boolean;
}

export interface IOrderItem {
    _id: string;
    title: string;
    size: ISize;
    quantity: number;
    slug: string;
    image: string;
    price: number;
    gender: string;
}

export interface ShippingAddress {
    name: string;
    lastName: string;
    department: string;
    city: string;
    address: string;
    neighborhood: string;
    observation?: string;
    phone: string;
}
