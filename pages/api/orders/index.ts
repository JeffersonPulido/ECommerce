import type { NextApiRequest, NextApiResponse } from "next";
import { isValidObjectId } from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { db } from "@/database";
import { IOrder } from "@/interfaces";
import { MonthlyPayments, Order, Product, User } from "@/models";
import nodemailer from "nodemailer";

type Data = { message: string } | IOrder;

export default function handler(req: NextApiRequest,res: NextApiResponse<Data>) {
    switch (req.method) {
        case "POST":
            return createOrder(req, res);
        case "PUT":
            return deleteOrders(req, res);
        default:
            return res.status(400).json({ message: "Bad Request" });
    }
}

const createOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { orderItems, total, shippingAddress } = req.body as IOrder;

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

        newOrder.total = Math.round(newOrder.total * 100) / 100;

        //Restar unidades de la orden al stock de cada producto
        orderItems.map(async (orderItem) => {
            const idProductOrder = orderItem._id;
            const productToRest = await Product.findOne({
                _id: { $in: idProductOrder },
            });

            productToRest!.inStock -= orderItem.quantity;

            productToRest!.save();
        });

        //Añadir info a coleccion Payments
        orderItems.map(async (item) => {
            const newPayment = new MonthlyPayments({
                status: false,
                itemId: item._id,
                item: item.title,
                orderId: newOrder._id,
                quantityBuy: item.quantity,
                total: item.price * item.quantity,
                comission:
                    item.price *
                    item.quantity *
                    Number(process.env.NEXT_PUBLIC_COMMISSION),
            });

            await newPayment.save();
        });

        await newOrder.save();

        // Función para enviar el correo
        const sendMail = async (destination: string,subject: string,contentMail: string) => {
            // Configurar el transporte
            let transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                },
            });

            // Detalles del correo
            let mailOptions = {
                from: process.env.MAIL_USER,
                to: destination,
                subject: subject,
                text: contentMail,
            };

            // Enviar el correo
            try {
                let info = await transporter.sendMail(mailOptions);
                console.log("Correo enviado:", info.response);
            } catch (error) {
                console.error("Error al enviar el correo:", error);
            }
        };

        const destination = session.user.email;
        const subject = `¡Tu pedido en ${process.env.NEXT_PUBLIC_APP_NAME} ha sido generado!`;
        const contentMail = `
        ¡Hola, ${session.user.name}!

        ¡Gracias por realizar tu pedido en nuestra tienda online!

        Si tienes dudas comunícate a nuestra línea de WhatsApp +57 3185532139 o al correo: info@inducascos.com

        Los detalles del pedido se encuentran abajo:

        INFORMACION DE ENTREGA:
        ${shippingAddress.name} ${shippingAddress.lastName}
        ${shippingAddress.address}, ${shippingAddress.neighborhood}
        ${shippingAddress.city}, ${shippingAddress.department}
        ${shippingAddress.phone}
        ${shippingAddress.observation}

        INFORMACION DEL PEDIDO:
        ${orderItems.map((orderItem) => {orderItem})}
        `;
        sendMail(destination, subject, contentMail);
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

const deleteOrders = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { orderId = "" } = req.body;

    if (!isValidObjectId(orderId)) {
        res.status(400).json({
            message: "No existe una orden con ese ID en la base de datos",
        });
    }

    const order = await Order.findOne({ _id: { $in: orderId } });
    const productsOrder = order?.orderItems;

    await db.connect();
    //Sumar cantidad de cada producto de la orden a su respecivo stock
    productsOrder!.map(async (orderItem) => {
        const idProductOrder = orderItem._id;
        const productToPlus = await Product.findOne({
            _id: { $in: idProductOrder },
        });
        productToPlus!.inStock += orderItem.quantity;
        await productToPlus!.save();
    });

    await Order.deleteOne({ _id: { $in: orderId } });
    await db.disconnect();

    const responseData = {
        message: "Orden eliminada. Por favor, recarga la página.",
        reload: true,
    };

    res.status(200).json(responseData);
};
