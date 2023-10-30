import { db } from '@/database';
import { Order, Product, User } from '@/models';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
    numberOfOrders: number;
    paidOrders: number;
    notPaidOrders: number;
    numberOfAllUsers: number;
    numberOfClients: number;
    numberOfVendors: number;
    numberOfAdmins: number;
    numberOfProducts: number;
    productsWithNoStock: number;
    productsWithLowStock: number;
    totalMoneyOrdersUnPaid: number,
    totalMoneyOrdersPaid: number,
    totalMoneyOutIVA: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>){    
    
    await db.connect()
      
    const [
        numberOfOrders,
        paidOrders,
        numberOfAllUsers,
        numberOfClients,
        numberOfVendors,
        numberOfAdmins,
        numberOfProducts,
        productsWithNoStock,
        productsWithLowStock,
        totalMoneyOrdersUnPaid,
        totalMoneyOrdersPaid,
        totalMoneyOutIVA
    ] = await Promise.all([
        Order.count(),
        Order.find({isPaid: true}).count(),
        User.count(),
        User.find({ role: 'client'}).count(),
        User.find({ role: 'vendor'}).count(),
        User.find({ role: 'admin'}).count(),
        Product.count(),
        Product.find({inStock: 0}).count(),
        Product.find({ inStock: {$lte: process.env.NEXT_PUBLIC_LOWSTOCK}}).count(),
        Order.aggregate([
            {
                $match: {
                    isPaid: false
                }
            },
            {
                $group: {
                    _id: null,
                    totalUnPaid: {
                        $sum: "$total"
                    }
                }
            }
        ]),
        Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalMoneyAllOrders: {
                        $sum: "$total"
                    }
                }
            }
        ]),
        Order.aggregate([
            {
                $match: {
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalPaidOutIVA: {
                        $sum: "$subTotal"
                    }
                }
            }
        ]),
    ])

    await db.disconnect()

    const totalUnPaidOrders = totalMoneyOrdersUnPaid.length > 0 ? totalMoneyOrdersUnPaid[0].totalUnPaid : 0;
    const totalMoneyAllOrders = totalMoneyOrdersPaid && totalMoneyOrdersPaid.length > 0 ? totalMoneyOrdersPaid[0].totalMoneyAllOrders : 0
    const totalMoneyOrdersOutIVA = totalMoneyOutIVA && totalMoneyOutIVA.length > 0 ? totalMoneyOutIVA[0].totalPaidOutIVA : 0
    
    res.status(200).json({
        numberOfOrders,
        paidOrders,
        numberOfAllUsers,
        numberOfClients, 
        numberOfVendors,
        numberOfAdmins,
        numberOfProducts,
        productsWithNoStock,
        productsWithLowStock,
        totalMoneyOrdersUnPaid: totalUnPaidOrders,
        totalMoneyOrdersPaid: totalMoneyAllOrders - totalUnPaidOrders,
        totalMoneyOutIVA: totalMoneyOrdersOutIVA,
        notPaidOrders: numberOfOrders - paidOrders,
    })
}
