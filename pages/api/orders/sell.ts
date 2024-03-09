import type { NextApiRequest, NextApiResponse } from "next";
import { isValidObjectId } from "mongoose"; 
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { db } from "@/database";
import { IPayments } from "@/interfaces";
import { MonthlyPayments } from "@/models";

type Data = { message: string } | IPayments[];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    switch (req.method) {
        case "GET":
            return getPaymentByUser(req, res);
        case "PUT":
            return updatePay(req, res);
        default:
            res.status(400).json({ message: "Bad Request" });
    }
}

const getPaymentByUser = async (
    req: NextApiRequest,
    res: NextApiResponse<Data>
) => {
    //Verify session user
    const session: any = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ message: "Requiere estar autenticado" });
    }

    const userId = session.user._id;

    await db.connect();

    const data = await MonthlyPayments.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "itemId",
                foreignField: "_id",
                as: "producto",
            },
        },
    ]).sort({ createdAt: "desc" });

    const filteredData: IPayments[] = [];

    data.forEach((payment) => {
        const matchingProducts = payment.producto.filter(
            (product: { name: string }) => product.name == userId
        );
        if (matchingProducts.length > 0) {
            filteredData.push({
                _id: payment._id,
                item: payment.item,
                orderId: payment.orderId,
                itemId: payment.itemId,
                total: payment.total,
                comission: payment.comission,
                status: payment.status,
                quantityBuy: payment.quantityBuy,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt,
                producto: matchingProducts,
                shippingStatus: payment.shippingStatus,
                transportationName: payment.transportationName,
                guideNumber: payment.guideNumber,
            });
        }
    });

    await db.disconnect();
    return res.status(200).json(filteredData);
};

const updatePay = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const {
        productId = "",
        shippingStatus = "",
        transportationName = "",
        guideNumber = "",
    } = req.body;

    if (!isValidObjectId(productId)) {
        res.status(400).json({ message: "No existe orden de pago con ese ID" });
    }

    const validStatus = ["true", "false"];

    if (shippingStatus && !validStatus.includes(shippingStatus)) {
        return res.status(400).json({
            message: "Estado no permitido: " + validStatus.join(", "),
        });
    }

    await db.connect();

    const payment = await MonthlyPayments.findById(productId);

    if (!payment) {
        await db.disconnect();
        return res.status(404).json({ message: "Orden de pago no encontrada" });
    }

    if (shippingStatus) {
        payment.shippingStatus = shippingStatus;
    }
    if (transportationName) {
        payment.transportationName = transportationName;
    }
    if (guideNumber) {
        payment.guideNumber = guideNumber;
    }

    await payment.save();
    await db.disconnect();
    return res.status(200).json({ message: "Orden de pago actualizado" });
};
