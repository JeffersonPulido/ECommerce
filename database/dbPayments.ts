import { IPayments } from "@/interfaces";
import { MonthlyPayments } from "@/models";
import { isValidObjectId } from "mongoose";
import { db } from ".";

export const getPaymentByUser = async (
    userId: string
): Promise<IPayments[]> => {

    if (!isValidObjectId(userId)) {
        return [];
    }

    await db.connect();

    const data = await MonthlyPayments.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "itemId",
                foreignField: "_id",
                as: "producto",
            },
        }
    ]).sort({ createdAt: "desc" })
    
    const filteredData:IPayments[] = [];
    
    data.forEach((payment) => {
        const matchingProducts = payment.producto.filter((product: { name: string; }) => product.name == userId);
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

    return JSON.parse(JSON.stringify(filteredData));
};
