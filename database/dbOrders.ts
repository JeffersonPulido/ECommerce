import { IOrder } from "@/interfaces";
import { isValidObjectId } from "mongoose";
import { db } from ".";
import { Order, Product } from "@/models";

export const getOrderById = async (id: string): Promise<IOrder | null> => {
    if (!isValidObjectId(id)) {
        return null;
    }
    await db.connect();
    const order = await Order.findById(id).lean();
    await db.disconnect();

    if (!order) {
        return null;
    }

    return JSON.parse(JSON.stringify(order));
};

export const getOrdersByUser = async (userId: string): Promise<IOrder[]> => {
    if (!isValidObjectId(userId)) {
        return [];
    }

    await db.connect();
    const orders = await Order.find({ name: userId })
    .sort({createdAt: 'desc'})
    .lean();
    await db.disconnect();

    return JSON.parse(JSON.stringify(orders));
};
