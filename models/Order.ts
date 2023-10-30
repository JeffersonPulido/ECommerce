import { IOrder } from "@/interfaces";
import moongose, { Schema, model, Model } from "mongoose";

const orderSchema = new Schema(
    {
        name: { type: Schema.Types.ObjectId, ref: "User", required: true },
        orderItems: [
            {
                _id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                title: { type: String, required: true },
                size: { type: String, required: true },
                quantity: { type: Number, required: true },
                slug: { type: String, required: true },
                image: { type: String, required: true },
                price: { type: Number, required: true },
            },
        ],
        shippingAddress: {
            name: { type: String, required: true },
            lastName: { type: String, required: true },
            department: { type: String, required: true },
            city: { type: String, required: true },
            address: { type: String, required: true },
            neighborhood: { type: String, required: true },
            observation: { type: String },
            phone: { type: String, required: true },
        },
        numberOfItems: { type: Number, required: true },
        subTotal: { type: Number, required: true },
        tax: { type: Number, required: true },
        total: { type: Number, required: true },
        isPaid: { type: Boolean, required: true, default: false },
        paidAt: { type: String },
        transactionId: { type: String }
    },
    {
        timestamps: true,
    }
);

const Order: Model<IOrder> =
    moongose.models.Order || model("Order", orderSchema);

export default Order;
