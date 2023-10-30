import { db } from "@/database";
import { IOrder } from "@/interfaces";
import { Order, Product } from "@/models";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

type Data = { message: string } | IOrder;

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    switch (req.method) {
        case "POST":
            return createOrder(req, res);
            break;

        default:
            return res.status(400).json({ message: "Bad Request" });
    }
}

const createOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { orderItems, total } = req.body as IOrder;

    //Verify session user
    const session: any = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ message: "Requiere estar autenticado" });
    }

    const productsIds = orderItems.map((p) => p._id);
    await db.connect();

    const dbProducts = await Product.find({ _id: { $in: productsIds } });
    try {
        const subTotal = orderItems.reduce((prev, current) => {
            const currentPrice = dbProducts.find(
                (prod) => prod.id === current._id
            )?.price;
            if (!currentPrice) {
                throw new Error("Verificar carrito");
            }
            return currentPrice * current.quantity + prev;
        }, 0);

        const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);
        const backendTotal = subTotal * (taxRate + 1);

        if (total !== backendTotal) {
            throw new Error(
                "El total tuvo un error en su calculo, intente nuevamente"
            );
        }

        const userId = session.user._id;
        const newOrder = new Order({
            ...req.body,
            isPaid: false,
            name: userId,
        });

        newOrder.total = Math.round( newOrder.total * 100 ) / 100
        //Restar unidades de la orden al stock de cada producto
        orderItems.map(async (orderItem) => {
            const idProductOrder = orderItem._id
            const productToRest = await Product.findOne({ _id: { $in: idProductOrder } });

            productToRest!.inStock -= orderItem.quantity

            productToRest!.save()
        })

        await newOrder.save();
        await db.disconnect();
        return res.status(201).json(newOrder);
    } catch (error: any) {
        await db.disconnect();
        console.log(error);
        return res
            .status(400)
            .json({ message: error.message || "Revise Logs del servidor" });
    }
};
