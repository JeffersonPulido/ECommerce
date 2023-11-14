export interface IUser {
    _id: string;
    name: string;
    email: string;
    bank?: string;
    typeAccount?: string;
    numberAccount?: number;
    password?: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
}