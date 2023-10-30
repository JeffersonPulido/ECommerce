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
        case "PUT":
            return deleteOrders(req, res);
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

const deleteOrders = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { orderId = "" } = req.body;
    
    if (!isValidObjectId(orderId)) {
        res.status(400).json({ message: "No existe una orden con ese ID en la base de datos" });
    }

    const order = await Order.findOne({ _id: { $in: orderId } });
    const productsOrder = order?.orderItems

    await db.connect()
    //Sumar cantidad de cada producto de la orden a su respecivo stock
    productsOrder!.map(async (orderItem) => {
        const idProductOrder = orderItem._id
        const productToPlus = await Product.findOne({ _id: { $in: idProductOrder } });
        productToPlus!.inStock += orderItem.quantity
        await productToPlus!.save()
    })

    await Order.deleteOne({ _id: { $in: orderId } });
    await db.disconnect();

    const responseData = {
        message: 'Orden eliminada. Por favor, recarga la página.',
        reload: true
    };

    res.status(200).json(responseData);

}



