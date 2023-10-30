import { db, SHOP_CONSTANTS } from "@/database";
import { IProduct } from "@/interfaces";
import { Product } from "@/models";
import { isValidObjectId } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = { message: string } | IProduct[];

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    switch (req.method) {
        case "GET":
            return getProducts(req, res);
        case "PUT":
            return deleteProduct(req, res);
        default:
            return res.status(400).json({ message: "Bad Request" });
    }
}

const getProducts = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { gender = "all" } = req.query;

    let condition = {};

    if (gender !== "all" && SHOP_CONSTANTS.validGenders.includes(`${gender}`)) {
        condition = { gender };
    }

    await db.connect();
    const products = await Product.find(condition)
        .select("title images price inStock slug -_id")
        .lean();
    await db.disconnect();


    const updatedProducts = products.map(product => {
        product.images = product.images.map( image => {
            return image.includes('http') ? image : `${process.env.HOST_NAME}products/${ image }`
        })

        return product
    })


    return res.status(200).json(updatedProducts);
};

const deleteProduct = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { productId = "" } = req.body;
    
    if (!isValidObjectId(productId)) {
        res.status(400).json({ message: "No existe un producto con ese ID en la base de datos" });
    }

    await db.connect()

    const product = await Product.findOne({ _id: { $in: productId } });
    
    await product!.deleteOne({ _id: { $in: productId } });
    
    await db.disconnect();

    const responseData = {
        message: 'Producto eliminada. Por favor, recarga la página.',
        reload: true
    };

    res.status(200).json(responseData);
}
