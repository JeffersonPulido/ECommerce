import { db } from "@/database";
import { IPayments } from "@/interfaces";
import { MonthlyPayments, Order } from "@/models";
import { isValidObjectId } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = { message: string } | IPayments[];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    switch (req.method) {
        case "GET":
            return getPayments(req, res);
        case "PUT":
            return updatePay(req, res);
        default:
            res.status(400).json({ message: "Bad Request" });
    }
}

const getPayments = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
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

    const dataCompleted: IPayments[] = [];

    const promises = data.map(async (payment) => {
        await Promise.all(
            payment.producto.map(async (product: { name: any }) => {

                const order = await Order.findOne({ _id: payment.orderId });

                dataCompleted.push({
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
                    vendorName: product.name,
                    orderPayStatus: order!.isPaid,
                });
            })
        );
    });

    await Promise.all(promises);

    await db.disconnect();
    return res.status(200).json(dataCompleted);
};

const updatePay = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { paymentId = "", status = "" } = req.body;

    if (!isValidObjectId(paymentId)) {
        res.status(400).json({ message: "No existe orden de pago con ese ID" });
    }

    const validStatus = ["En tramite", "Consignado", "Pendiente"];

    if (!validStatus.includes(status)) {
        res.status(400).json({
            message: "Estado no permitido: " + validStatus.join(", "),
        });
    }

    await db.connect();

    const payment = await MonthlyPayments.findById(paymentId);

    if (!payment) {
        await db.disconnect();
        res.status(404).json({ message: "Orden de pago no encontrada" });
    }

    payment!.status = status;
    await payment!.save();
    await db.disconnect();
    return res.status(200).json({ message: "Orden de pago actualizado" });
};
