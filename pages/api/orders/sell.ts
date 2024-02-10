import { db } from "@/database";
import { IPayments } from "@/interfaces";
import { MonthlyPayments } from "@/models";
import { isValidObjectId } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = { message: string } | IPayments[];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    switch (req.method) {
        case "PUT":
            return updatePay(req, res);
        default:
            res.status(400).json({ message: "Bad Request" });
    }
}

const updatePay = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const {
        productId = "",
        shippingStatus = "",
        transportationName = "",
        guideNumber = "",
    } = req.body;

    if (!isValidObjectId(productId)) {
        return res.status(400).json({
            message: "No existe registro de venta con ese ID",
        });
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
