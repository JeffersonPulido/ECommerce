import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/database";
import { IProduct } from "@/interfaces";
import { Product } from "@/models";
import { isValidObjectId } from "mongoose";

import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";


cloudinary.config(process.env.CLOUDINARY_URL || "");

type Data = { message: string } | IProduct[] | IProduct;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    switch (req.method) {
        case "GET":
            return getProducts(req, res);
        case "POST":
            return createProduct(req, res);
        case "PUT":
            return updateProducts(req, res);
        default:
            res.status(400).json({ message: "Bad Request" });
    }
}

const getProducts = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    await db.connect();
    const products = await Product.find().sort({ title: "asc" }).lean();
    await db.disconnect();

    const updatedProducts = products.map((product) => {
        product.images = product.images.map((image) => {
            return image.includes("http")
                ? image
                : `${process.env.HOST_NAME}products/${image}`;
        });

        return product;
    });

    res.status(200).json(updatedProducts);
};

const updateProducts = async (
    req: NextApiRequest,
    res: NextApiResponse<Data>
) => {
    const { _id = "", images = [] } = req.body as IProduct;

    if (!isValidObjectId(_id)) {
        res.status(400).json({ message: "Id del producto no es valido" });
    }

    if (images.length < 2) {
        res.status(400).json({ message: "Es necesario al menos 2 imagenes" });
    }

    //TO DO: imagenes

    try {
        await db.connect();
        const product = await Product.findById(_id);
        if (!product) {
            await db.disconnect();
            res.status(400).json({
                message: "No existe un producto con ese id",
            });
        }

        product?.images.forEach(async (image) => {
            if (!images.includes(image)) {
                const [fileId, extension] = image
                    .substring(image.lastIndexOf("/") + 1)
                    .split(".");
                await cloudinary.uploader.destroy(fileId);
            }
        });

        await product!.updateOne(req.body);
        await db.disconnect();
        return res.status(200).json(product!);
    } catch (error) {
        console.log(error);
        await db.disconnect();
        res.status(400).json({ message: "Revisar consola del servidor" });
    }
};

const createProduct = async (
    req: NextApiRequest,
    res: NextApiResponse<Data>
) => {
    const { images = [] } = req.body as IProduct;
    //Verify session user
    const session: any = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ message: "Requiere estar autenticado" });
    }

    if (images.length < 2) {
        res.status(400).json({
            message: "El producto necesita al menos 2 imagenes",
        });
    }

    try {
        await db.connect();
        const productInDB = await Product.findOne({ slug: req.body.slug });
        if (productInDB) {
            await db.disconnect();
            res.status(400).json({
                message: "Ya existe un producto con ese slug",
            });
        }
       
        const userId = session.user._id;
        const newProduct = new Product({
            ...req.body,
            name: userId,
        });

        await newProduct.save();
        res.status(201).json(newProduct);
        await db.disconnect();
    } catch (error) {
        console.log(error);
        await db.disconnect();
        res.status(400).json({ message: "Revisar consola del servidor" });
    }
};
