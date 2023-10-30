import jwt from "jsonwebtoken";

export const signToken = (_id: string, email: string) => {
    if (!process.env.JWT_SECRET_SEED) {
        throw new Error("No hay semilla de JWT - Revisar .env");
    }

    return jwt.sign(
        //Payload
        { _id, email },
        //Seed
        process.env.JWT_SECRET_SEED,
        //Options
        { expiresIn: "1d" }
    );
};

export const isValidToken = (token: string): Promise<string> => {
    if (!process.env.JWT_SECRET_SEED) {
        throw new Error("No hay semilla de JWT - Revisar .env");
    }

    if (token.length <= 1) {
        return Promise.reject("JWT no valido");
    }

    return new Promise((resolve, reject) => {
        try {
            jwt.verify(
                token,
                process.env.JWT_SECRET_SEED || "",
                (err, payload) => {
                    if (err) return reject("JWT no valido");
                    const { _id } = payload as { _id: string };
                    resolve(_id);
                }
            );
        } catch (error) {
            reject("JWT no valido");
        }
    });
};
