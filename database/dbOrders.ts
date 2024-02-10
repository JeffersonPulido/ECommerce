import { IOrder } from "@/interfaces";
import { isValidObjectId } from "mongoose";
import { db } from ".";
import { MonthlyPayments, Order, Product } from "@/models";

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

export const getOrdersByUser = async (userId: string): Promise<any[]> => {
    if (!isValidObjectId(userId)) {
        return [];
    }

    try {
        await db.connect();
        const orders = await Order.find({ name: userId })
            .sort({ createdAt: "desc" })
            .lean();

        const orderIds = orders.map((order) => order._id);
        const payments = await MonthlyPayments.find({
            orderId: { $in: orderIds },
        }).lean();

        await db.disconnect();

        const combinedData = orders.map((order) => {
            const matchingPayment = payments.find(
                (payment) => String(payment.orderId) === String(order._id)
            );
            return {
                ...order,
                payment: matchingPayment || null,
            };
        });

        return JSON.parse(JSON.stringify(combinedData));
    } catch (error) {
        console.error("Error al obtener órdenes y pagos:", error);
        return [];
    }
};
