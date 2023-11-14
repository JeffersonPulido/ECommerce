import { IPayments } from "@/interfaces/payments";
import moongose, { Schema, model, Model } from "mongoose";

const paymentSchema = new Schema(
    {
        item: { type: String, required: true },
        orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
        itemId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        total: { type: Number, required: true },
        comission: { type: Number, required: true },
        status: { type: Boolean, required: true, default: false },
        quantityBuy: { type: Number, required: true }
    },
    {
        timestamps: true,
    }
);

const MonthlyPayments: Model<IPayments> =
    moongose.models.MonthlyPayments || model("MonthlyPayments", paymentSchema);

export default MonthlyPayments;
