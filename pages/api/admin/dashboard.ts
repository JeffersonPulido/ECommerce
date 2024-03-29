import { db } from "@/database";
import { DashboardSummaryResponse } from "@/interfaces";
import { MonthlyPayments, Order, Product, User } from "@/models";
import type { NextApiRequest, NextApiResponse } from "next";

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
    totalMoneyOrdersUnPaid: number;
    totalMoneyOrdersPaid: number;
    totalMoneyOutIVA: number;
    monthlyPaymentsPaid: number;
    monthlyPaymentsUnPaid: number;
    comissionsPaid: number;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<DashboardSummaryResponse>
) {
    await db.connect();

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
        totalMoneyOutIVA,
        monthlyPaymentsPaid,
        monthlyPaymentsUnPaid,
        monthlyPaymentsInProcess,
        comissionsPaid,
        comissionsUnPaid,
        comissionsInProcess,
        monthlyPaymentsTotalPaid,
        monthlyPaymentsTotalUnPaid,
        monthlyPaymentsTotalInProcess,
    ] = await Promise.all([
        Order.count(),
        Order.find({ isPaid: true }).count(),
        User.count(),
        User.find({ role: "client" }).count(),
        User.find({ role: "vendor" }).count(),
        User.find({ role: "admin" }).count(),
        Product.count(),
        Product.find({ inStock: 0 }).count(),
        Product.find({
            inStock: { $lte: process.env.NEXT_PUBLIC_LOWSTOCK },
        }).count(),
        Order.aggregate([
            {
                $match: {
                    isPaid: false,
                },
            },
            {
                $group: {
                    _id: null,
                    totalUnPaid: {
                        $sum: "$total",
                    },
                },
            },
        ]),
        Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalMoneyAllOrders: {
                        $sum: "$total",
                    },
                },
            },
        ]),
        Order.aggregate([
            {
                $match: {
                    isPaid: true,
                },
            },
            {
                $group: {
                    _id: null,
                    totalPaidOutIVA: {
                        $sum: "$subTotal",
                    },
                },
            },
        ]),
        MonthlyPayments.find({ status: "Consignado" }).count(),
        MonthlyPayments.find({ status: "Pendiente" }).count(),
        MonthlyPayments.find({ status: "En tramite" }).count(),
        MonthlyPayments.aggregate([
            {
                $match: {
                    status: "Consignado",
                },
            },
            {
                $group: {
                    _id: null,
                    totalComissionsPaid: {
                        $sum: "$comission",
                    },
                },
            },
        ]),
        MonthlyPayments.aggregate([
            {
                $match: {
                    status: "Pendiente",
                },
            },
            {
                $group: {
                    _id: null,
                    totalComissionsUnPaid: {
                        $sum: "$comission",
                    },
                },
            },
        ]),
        MonthlyPayments.aggregate([
            {
                $match: {
                    status: "En tramite",
                },
            },
            {
                $group: {
                    _id: null,
                    totalComissionsInProcess: {
                        $sum: "$comission",
                    },
                },
            },
        ]),
        MonthlyPayments.aggregate([
            {
                $match: {
                    status: "Consignado",
                },
            },
            {
                $group: {
                    _id: null,
                    totalPaidSell: {
                        $sum: "$total",
                    },
                },
            },
        ]),
        MonthlyPayments.aggregate([
            {
                $match: {
                    status: "Pendiente",
                },
            },
            {
                $group: {
                    _id: null,
                    totalUnpaidSell: {
                        $sum: "$total",
                    },
                },
            },
        ]),
        MonthlyPayments.aggregate([
            {
                $match: {
                    status: "En tramite",
                },
            },
            {
                $group: {
                    _id: null,
                    totalInProcessSell: {
                        $sum: "$total",
                    },
                },
            },
        ]),
    ]);

    await db.disconnect();

    const totalUnPaidOrders =
        totalMoneyOrdersUnPaid.length > 0
            ? totalMoneyOrdersUnPaid[0].totalUnPaid
            : 0;
    const totalMoneyAllOrders =
        totalMoneyOrdersPaid && totalMoneyOrdersPaid.length > 0
            ? totalMoneyOrdersPaid[0].totalMoneyAllOrders
            : 0;
    const totalMoneyOrdersOutIVA =
        totalMoneyOutIVA && totalMoneyOutIVA.length > 0
            ? totalMoneyOutIVA[0].totalPaidOutIVA
            : 0;
    const comissionsTotalPaid =
        comissionsPaid.length > 0 ? comissionsPaid[0].totalComissionsPaid : 0;
    const comissionsTotalUnPaid =
        comissionsUnPaid.length > 0
            ? comissionsUnPaid[0].totalComissionsUnPaid
            : 0;
    const comissionsTotalInProcess =
        comissionsInProcess.length > 0
            ? comissionsInProcess[0].totalComissionsInProcess
            : 0;
    const moneyMonthlyPaymentsTotalPaid =
        monthlyPaymentsTotalPaid.length > 0
            ? monthlyPaymentsTotalPaid[0].totalPaidSell
            : 0;
    const moneyMonthlyPaymentsTotalUnPaid =
        monthlyPaymentsTotalUnPaid.length > 0
            ? monthlyPaymentsTotalUnPaid[0].totalUnpaidSell
            : 0;
    const moneyMonthlyPaymentsTotalInProcess =
        monthlyPaymentsTotalInProcess.length > 0
            ? monthlyPaymentsTotalInProcess[0].totalInProcessSell
            : 0;

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
        monthlyPaymentsPaid,
        monthlyPaymentsUnPaid,
        monthlyPaymentsInProcess,
        comissionsPaid: comissionsTotalPaid,
        comissionsUnPaid: comissionsTotalUnPaid,
        comissionsInProcess: comissionsTotalInProcess,
        monthlyPaymentsTotalPaid:
            moneyMonthlyPaymentsTotalPaid - comissionsTotalPaid,
        monthlyPaymentsTotalUnPaid:
            moneyMonthlyPaymentsTotalUnPaid - comissionsTotalUnPaid,
        monthlyPaymentsTotalInProcess:
            moneyMonthlyPaymentsTotalInProcess - comissionsTotalInProcess,
    });
}
