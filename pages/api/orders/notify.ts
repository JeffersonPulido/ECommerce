import { NextApiRequest, NextApiResponse } from "next";
import mercadopago from "mercadopago";
import { db } from "@/database";
import { Order } from "@/models";

mercadopago.configure({
    access_token: process.env.NEXT_MP_ACCESS_TOKEN!,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { query } = req;
    const topic = query.topic || query.type;

    try {
        if (topic === 'payment') {
            const paymentId = query.id || query['data.id']
            let payment = await mercadopago.payment.findById(Number(paymentId))
            let paymentStatus = payment.body.status
            const orderId = payment.body.description.slice(`Compra en ${process.env.NEXT_PUBLIC_APP_NAME}`.length)

            if (paymentStatus !== 'approved') {
                return res.status(400).json({message: 'Pago no registrado en Mercado Pago'})
            }

            await db.connect()

            const dbOrder = await Order.findById(orderId.trim())

            if ( !dbOrder ) {
                await db.disconnect()
                return res.status(400).json({message: 'Orden no existe en la base de datos de Mercado Pago'})
            }

            if (dbOrder.total !== payment.body.transaction_amount) {
                await db.disconnect()
                return res.status(400).json({message: 'Los montos pagados en Mercado Pago no coinciden con la orden de la tienda'})
            }

            dbOrder.transactionId = payment.body.id
            dbOrder.isPaid = true
            await dbOrder.save()
            await db.disconnect()
        }
    } catch (error) {
        res.send(error)
    }
};

export default handler;
