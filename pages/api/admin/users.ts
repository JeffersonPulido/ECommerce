import { db } from "@/database";
import { IUser } from "@/interfaces";
import { Order, Product, User } from "@/models";
import { isValidObjectId } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = | { message: string } | IUser[];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    switch (req.method) {
        case "GET":
            return getUsers(req, res);
        case "PUT":
            return updateUsers(req, res);
        default:
            res.status(400).json({ message: "Bad Request" });
    }
}

const getUsers = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    await db.connect();
    const users = await User.find().select("-password").lean();
    await db.disconnect();

    return res.status(200).json(users);
};

const updateUsers = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { userId = "", role = "" } = req.body;

    if (!isValidObjectId(userId)) {
        res.status(400).json({ message: "No existe usuario con ese ID" });
    }

    const validRoles = ["admin", "super-user", "SEO", "client", "vendor"];

    if (!validRoles.includes(role)) {
        res.status(400).json({
            message: "Rol no permitido: " + validRoles.join(", "),
        });
    }

    await db.connect();

    const user = await User.findById(userId);

    if (!user) {
        await db.disconnect();
        res.status(404).json({ message: "Usuario no encontrado" });
    }

    user!.role = role;
    await user!.save();
    await db.disconnect();
    return res.status(200).json({ message: "Usuario actualizado" });
};
