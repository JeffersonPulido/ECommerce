export interface IProduct {
    _id: string;
    description: string;
    images: string[];
    inStock: number;
    price: number;
    sizes: ISize[];
    slug: string;
    tags: string[];
    title: string;
    type: ITypes;
    gender: "men" | "women" | "kid" | "unisex";
    status: "Nuevo" | "Casi Nuevo" | "Buen Estado" | "Usado"
    createdAt: string;
    updatedAt: string;
    name?: string;
    quantitySeller?: number;
}

export type ISize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "N/A";
export type ITypes =
    | "ropa"
    | "aseo"
    | "variedad"
    | "juguetes"
    | "mobiliario"
    | "accesorios";
