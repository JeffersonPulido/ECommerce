import { IProduct } from "@/interfaces";
import mongoose, { Schema, model, Model } from "mongoose";

const productSchema = new Schema(
    {
        name: { type: Schema.Types.ObjectId, ref: "User", required: true },
        description: { type: String, required: true, default: "" },
        images: [{ type: String }],
        inStock: { type: Number, required: true, default: 0 },
        price: { type: String, required: true, default: 0 },
        sizes: [
            {
                type: String,
                enum: {
                    values: ["XS", "S", "M", "L", "XL", "XXL", "N/A"],
                    message: "{VALUE} no es un tamaño válido",
                },
            },
        ],
        slug: { type: String, required: true, unique: true },
        tags: [{ type: String }],
        title: { type: String, required: true, default: "" },
        type: {
            type: String,
            enum: {
                values: [
                    "Ropa",
                    "Aseo",
                    "Variedad",
                    "Juguetes",
                    "Mobiliario",
                    "Accesorios",
                ],
                message: "{VALUE} no es un tipo válido",
            },
            default: "Variedad",
        },
        gender: {
            type: String,
            enum: {
                values: ["Hombre", "Mujer", "Unisex"],
                message: "{VALUE} no es un genero válido",
            },
            default: "Unisex",
        },
        status: {
            type: String,
            enum: {
                values: ["Nuevo", "Casi Nuevo", "Buen Estado", "Usado"],
                message: "{VALUE} no es un estado válido",
            },
            default: "Nuevo",
        },
    },
    {
        timestamps: true,
    }
);

productSchema.index({ title: "text", tags: "text" });

const Product: Model<IProduct> =
    mongoose.models.Product || model("Product", productSchema);

export default Product;
