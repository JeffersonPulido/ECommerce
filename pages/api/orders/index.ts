import type { NextApiRequest, NextApiResponse } from "next";
import { isValidObjectId } from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { db } from "@/database";
import { IOrder } from "@/interfaces";
import { MonthlyPayments, Order, Product, User } from "@/models";
import nodemailer from "nodemailer";
import { currency } from "@/utils";

type Data = { message: string } | IOrder;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case "POST":
      return createOrder(req, res);
    case "PUT":
      return deleteOrders(req, res);
    default:
      return res.status(400).json({ message: "Bad Request" });
  }
}

const createOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { orderItems, total, shippingAddress } = req.body as IOrder;

  // Función para enviar el correo
  const sendMail = async (
    destination: string,
    subject: string,
    contentMail: string
  ) => {
    // Configurar el transporte
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Detalles del correo
    let mailOptions = {
      from: process.env.MAIL_USER,
      to: destination,
      subject: subject,
      text: contentMail,
    };

    // Enviar el correo
    try {
      let info = await transporter.sendMail(mailOptions);
      console.log("Correo enviado:", info.response);
    } catch (error) {
      console.error("Error al enviar el correo:", error);
    }
  };

  //Verify session user
  const session: any = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Requiere estar autenticado" });
  }

  const productsIds = orderItems.map((p) => p._id);
  await db.connect();

  const dbProducts = await Product.find({ _id: { $in: productsIds } });
  try {
    const subTotal = orderItems.reduce((prev, current) => {
      const currentPrice = dbProducts.find(
        (prod) => prod.id === current._id
      )?.price;
      if (!currentPrice) {
        throw new Error("Verificar carrito");
      }
      return currentPrice * current.quantity + prev;
    }, 0);

    const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);
    const backendTotal = subTotal * (taxRate + 1);

    if (total !== backendTotal) {
      throw new Error(
        "El total tuvo un error en su calculo, intente nuevamente"
      );
    }

    const userId = session.user._id;
    const newOrder = new Order({
      ...req.body,
      isPaid: false,
      name: userId,
    });

    newOrder.total = Math.round(newOrder.total * 100) / 100;

    //Restar unidades de la orden al stock de cada producto
    orderItems.map(async (orderItem) => {
      const idProductOrder = orderItem._id;
      const productToRest = await Product.findOne({
        _id: { $in: idProductOrder },
      });

      productToRest!.inStock -= orderItem.quantity;

      productToRest!.save();
    });

    //Añadir info a coleccion Payments
    orderItems.map(async (item) => {
      const valueSell = item.price * item.quantity;
      let comissionValue = 0;
      if (valueSell <= parseInt(process.env.NEXT_PUBLIC_COMISSION_VALUE!)) {
        comissionValue =
          valueSell * Number(process.env.NEXT_PUBLIC_COMMISSION_LV1);
      } else if (
        valueSell > parseInt(process.env.NEXT_PUBLIC_COMISSION_VALUE!) &&
        valueSell <= parseInt(process.env.NEXT_PUBLIC_COMISSION_VALUE!) * 2
      ) {
        comissionValue =
          valueSell * Number(process.env.NEXT_PUBLIC_COMMISSION_LV2);
      } else {
        comissionValue =
          valueSell * Number(process.env.NEXT_PUBLIC_COMMISSION_LV3);
      }
      const newPayment = new MonthlyPayments({
        itemId: item._id,
        item: item.title,
        orderId: newOrder._id,
        quantityBuy: item.quantity,
        total: item.price * item.quantity,
        comission: comissionValue,
      });

      await newPayment.save();
    });

    // Send Mail Seller Notification
    orderItems.forEach(async (item, index) => {
      const itemId = item._id;
      const dataProduct = await Product.findById(itemId).select("name");
      const dataUser = await User.find({
        _id: { $in: dataProduct?.name },
      }).select("email name");
      dataUser.map((user) => {
        const destinationSeller = user.email;
        const subjectSeller = `¡Te han comprado un producto en ${process.env.NEXT_PUBLIC_APP_NAME}!`;
        let contentMailSeller = `
                ¡Hola, ${user.name}!
        
                ¡Gracias por vender tus productos en nuestra tienda online!
        
                Si tienes dudas comunícate a nuestra línea de WhatsApp +57 3102156205 o al correo: info@bestmarkid.com

                Por favor alista tu mercancia y llevala al centro de distribucion mas cercano e ingresa la guia en nuestra plataforma.
        
                Los detalles del pedido se encuentran abajo:
        
                INFORMACION DE ENTREGA:
    
                    ${shippingAddress.name} ${shippingAddress.lastName}
                    ${shippingAddress.address}, ${shippingAddress.neighborhood}
                    ${shippingAddress.city}, ${shippingAddress.department}
                    ${shippingAddress.phone}
                    Observaciones: ${shippingAddress.observation}
    
                INFORMACION DEL PEDIDO:

                    Producto ${index + 1}:
                    Título: ${item.title}
                    Precio: ${currency.format(item.price)}
                    Tamaño: ${item.size}
                    Genero: ${item.gender}
                    Cantidad: ${item.quantity}
                
                Gracias por tu venta. Si necesitas más información, no dudes en contactarnos.
                
                Atentamente,
                El equipo de BestMarkid
            `;
        sendMail(destinationSeller, subjectSeller, contentMailSeller);
      });
    });

    // Send Mail Buyer Notification
    const destinationBuyer = session.user.email;
    const subjectBuyer = `¡Tu pedido en ${process.env.NEXT_PUBLIC_APP_NAME} ha sido generado!`;
    let contentMailBuyer = `
        ¡Hola, ${session.user.name}!

        ¡Gracias por realizar tu pedido en nuestra tienda online!

        Si tienes dudas comunícate a nuestra línea de WhatsApp +57 3102156205 o al correo: info@bestmarkid.com

        Los detalles del pedido se encuentran abajo:

        INFORMACION DE ENTREGA:

            ${shippingAddress.name} ${shippingAddress.lastName}
            ${shippingAddress.address}, ${shippingAddress.neighborhood}
            ${shippingAddress.city}, ${shippingAddress.department}
            ${shippingAddress.phone}
            Observaciones: ${shippingAddress.observation}

        INFORMACION DEL PEDIDO:
        `;
    // Agregar detalles de los productos al cuerpo del correo
    orderItems.forEach((producto, index) => {
      contentMailBuyer += `
            Producto ${index + 1}:
            Título: ${producto.title}
            Precio: ${currency.format(producto.price)}
            Tamaño: ${producto.size}
            Genero: ${producto.gender}
            Cantidad: ${producto.quantity}
            `;
    });

    contentMailBuyer += `
        Gracias por tu compra. Si necesitas más información, no dudes en contactarnos.
        
        Atentamente,
        El equipo de BestMarkid
        `;

    sendMail(destinationBuyer, subjectBuyer, contentMailBuyer);
    //Save Order
    await newOrder.save();
    await db.disconnect();
    return res.status(201).json(newOrder);
  } catch (error: any) {
    await db.disconnect();
    console.log(error);
    return res
      .status(400)
      .json({ message: error.message || "Revise Logs del servidor" });
  }
};

const deleteOrders = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const { orderId = "" } = req.body;

  if (!isValidObjectId(orderId)) {
    res.status(400).json({
      message: "No existe una orden con ese ID en la base de datos",
    });
  }

  const order = await Order.findOne({ _id: { $in: orderId } });
  const productsOrder = order?.orderItems;

  await db.connect();
  //Sumar cantidad de cada producto de la orden a su respecivo stock
  productsOrder!.map(async (orderItem) => {
    const idProductOrder = orderItem._id;
    const productToPlus = await Product.findOne({
      _id: { $in: idProductOrder },
    });
    productToPlus!.inStock += orderItem.quantity;
    await productToPlus!.save();
  });

  await MonthlyPayments.deleteMany({ orderId: { $in: orderId } });
  await Order.deleteOne({ _id: { $in: orderId } });
  await db.disconnect();

  const responseData = {
    message: "Orden eliminada. Por favor, recarga la página.",
    reload: true,
  };

  res.status(200).json(responseData);
};
