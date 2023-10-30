import { db } from "@/database";
import { User } from "@/models";
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { jwt, validations } from "@/utils";

type Data =
    | { message: string }
    | {
          token: string;
          user: {
              email: string;
              name: string;
              role: string;
          };
      };

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    switch (req.method) {
        case "POST":
            return registerUser(req, res);
        case "PUT":
            return updateUser(req, res);
        default:
            res.status(404).json({ message: "Bad Request" });
    }
}

const registerUser = async (
    req: NextApiRequest,
    res: NextApiResponse<Data>
) => {
    const {
        email = "",
        password = "",
        name = "",
    } = req.body as { email: string; password: string; name: string };

    if (password.length < 6) {
        return res
            .status(400)
            .json({ message: "La contraseña debe tener minimo 6 caracteres" });
    }

    if (name.length < 2) {
        return res
            .status(400)
            .json({ message: "El nombre debe tener mas de 2 caracteres" });
    }

    if (!validations.isValidEmail(email)) {
        return res
            .status(400)
            .json({ message: "El correo electronico no es valido" });
    }

    await db.connect();
    const user = await User.findOne({ email });

    if (user) {
        return res
            .status(400)
            .json({ message: "Correo electronico ya existe" });
    }

    const newUser = new User({
        email: email.toLowerCase(),
        password: bcrypt.hashSync(password),
        role: "client",
        name,
    });

    try {
        await newUser.save({ validateBeforeSave: true });
    } catch (error) {
        return res.status(500).json({ message: `Error de servidor ${error}` });
        console.error(error);
    }

    const { _id, role } = newUser;

    const token = jwt.signToken(_id, email);

    return res.status(200).json({
        token,
        user: {
            email,
            role,
            name,
        },
    });
};

const updateUser = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const {
        email = "",
        password = "",
        name = "",
        _id,
    } = req.body as {
        email: string;
        password: string;
        name: string;
        _id: string;
    };

    if (password.length < 6) {
        return res
            .status(400)
            .json({ message: "La contraseña debe tener minimo 6 caracteres" });
    }

    if (name.length < 2) {
        return res
            .status(400)
            .json({ message: "El nombre debe tener mas de 2 caracteres" });
    }

    if (!validations.isValidEmail(email)) {
        return res
            .status(400)
            .json({ message: "El correo electronico no es valido" });
    }

    await db.connect();
    const user = await User.findById({ _id });

    if (!user) {
        return res
            .status(400)
            .json({ message: "El usuario no fue encontrado" });
    }

    (user.email = email.toLowerCase()),
    (user.password = bcrypt.hashSync(password)),
    (user.name = name);

    try {
        await user.save({ validateBeforeSave: true });
    } catch (error) {
        return res.status(500).json({ message: `Error de servidor ${error}` });
        console.error(error);
    }

    return res
        .status(204)
        .json({ message: "Usuario modificado satisfactoriamente" });
};
