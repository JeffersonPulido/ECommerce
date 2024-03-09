import type { NextApiRequest, NextApiResponse } from "next";
import { isValidObjectId } from "mongoose";
import mercadopago from "mercadopago";
import { CreatePreferencePayload } from "mercadopago/models/preferences/create-payload.model";
import { db } from "@/database";
import { IOrder } from "@/interfaces";
import { Order } from "@/models";

type Data = { message: string } | IOrder[];

mercadopago.configure({
    access_token: process.env.NEXT_MP_ACCESS_TOKEN!,
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "POST":
            return payOrder(req, res);
        case "PUT":
            return updateStateSatisfying(req, res);
        default:
            res.status(400).json({ message: "Bad request" });
    }
}

const payOrder = async (req: NextApiRequest, res: NextApiResponse) => {
    const { total, order } = req.body;
    const URL_APPROVED = `${process.env.URL_HTTPS}/orders/${order._id}`;
    const URL_FAILURE = `${process.env.URL_HTTPS}/orders/history`;
    try {
        const preference: CreatePreferencePayload = {
            items: [
                {
                    title: `Compra en ${process.env.NEXT_PUBLIC_APP_NAME} ${order._id}`,
                    unit_price: total,
                    quantity: 1,
                },
            ],
            auto_return: "approved",
            back_urls: {
                success: `${URL_APPROVED}`,
                failure: `${URL_FAILURE}`,
            },
            notification_url: `${process.env.URL_HTTPS}/api/orders/notify`,
        };

        const response = await mercadopago.preferences.create(preference);
        res.status(200).send({ url: response.body.init_point });
    } catch (error) {
        res.status(400).json({ message: "Bad request" });
    }
};

const updateStateSatisfying = async (
    req: NextApiRequest,
    res: NextApiResponse<Data>
) => {
    const { orderId = "", isSatisfying = "" } = req.body;

    if (!isValidObjectId(orderId)) {
        res.status(400).json({ message: "No existe orden con ese ID" });
    }

    const validStatus = ["Inconforme", "Satisfecho", "Pendiente"];

    if (!validStatus.includes(isSatisfying)) {
        res.status(400).json({
            message: "Estado no permitido: " + validStatus.join(", "),
        });
    }

    await db.connect();

    const orden = await Order.findById(orderId);

    if (!orden) {
        await db.disconnect();
        res.status(404).json({ message: "Orden no encontrada" });
    }

    orden!.isSatisfying = isSatisfying;
    await orden!.save();
    await db.disconnect();
    return res.status(200).json({ message: "Orden actualizado" });
};
