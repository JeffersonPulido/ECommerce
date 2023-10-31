import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/database";
import { IOrder } from "@/interfaces";
import { Order, Product } from "@/models";
import { isValidObjectId } from "mongoose";

type Data = | { message: string } | IOrder[];

export default async function handler(req: NextApiRequest,res: NextApiResponse<Data>) {
    switch (req.method) {
        case "GET":
            return getOrders(req, res);
        default:
            res.status(400).json({ message: "Bad Request" });
    }
}
const getOrders = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    await db.connect();
    const orders = await Order.find()
    .sort({createdAt: 'desc'})
    .populate('name', 'name email')
    .lean();
    await db.disconnect();

    return res.status(200).json(orders);
}





