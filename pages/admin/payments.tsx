import { shopApi } from "@/axiosApi";
import { AdminLayout } from "@/components/layouts";
import { IPayments } from "@/interfaces";
import { currency } from "@/utils";
import { PeopleOutline } from "@mui/icons-material";
import { Chip, Grid, MenuItem, Select } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import moment from "moment";
import React, { useEffect, useState } from "react";
import useSWR from "swr";

const PaymentsPage = () => {
    const { data, error } = useSWR<IPayments[]>("/api/admin/payments");
    const [payments, setPayments] = useState<IPayments[]>([]);

    useEffect(() => {
        if (data) {
            setPayments(data);
        }
    }, [data]);

    if (!data && !error) return <></>;

    const onRolUpdated = async (paymentId: string, newState: boolean) => {
        const previusPayments = payments.map((payment) => ({ ...payment }));
        const updatedPayments = payments.map((payment) => ({
            ...payment,
            status: paymentId === payment._id ? newState : payment.status,
        }));
        setPayments(updatedPayments);
        try {
            await shopApi.put("/admin/payments/", {
                paymentId,
                status: newState,
            });
        } catch (error) {
            setPayments(previusPayments);
            console.log(error);
            alert("No se pudo actualizar el estado de pago");
        }
    };

    const columns: GridColDef[] = [
        {
            field: "vendorName",
            headerName: "Vendedor",
            renderCell: ({ row }: GridRenderCellParams) => {
                return (
                    <a
                        href={`/admin/users`}
                        target="_blank"
                        rel="noreferrer"
                    >{`${row.vendorName}`}</a>
                );
            },
            width: 210,
        },
        { field: "title", headerName: "Producto", width: 350 },
        { field: "quantity", headerName: "Cantidad", width: 100 },
        { field: "price", headerName: "Precio de venta", width: 120 },
        { field: "comission", headerName: "Comision", width: 100 },
        { field: "money", headerName: "Ganancia Neta", width: 120 },
        { field: "date", headerName: "Fecha venta", width: 200 },
        {
            field: "orderStatusPay",
            headerName: "Estado pago orden",
            renderCell: ({ row }: GridRenderCellParams) => {
                return row.orderStatusPay ? (
                    <Chip variant="outlined" label="Pagada" color="success" />
                ) : (
                    <Chip variant="outlined" label="Pendiente" color="error" />
                );
            },
            width: 200,
        },
        {
            field: "status",
            headerName: "Estado de pago",
            width: 250,
            renderCell: ({ row }: GridRenderCellParams) => {
                return (
                    <Select
                        value={row.status}
                        label="Estado de pago"
                        sx={{ width: "100%" }}
                        onChange={({ target }) =>
                            onRolUpdated(row.id, target.value)
                        }
                    >
                        <MenuItem value="Consignado">Consignado</MenuItem>
                        <MenuItem value="En tramite">En tramite</MenuItem>
                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                    </Select>
                );
            },
        },
    ];

    const rows = payments.map((product) => ({
        id: product._id,
        title: product.item,
        quantity: product.quantityBuy,
        price: currency.format(product.total),
        comission: currency.format(product.comission),
        money: currency.format(product.total - product.comission),
        date: moment(product.createdAt).format("DD / MMM / YYYY, h:mm:ss a"),
        status: product.status,
        vendorName: product.vendorName,
        orderStatusPay: product.orderPayStatus,
    }));

    return (
        <AdminLayout
            title={"Dispersion de pagos"}
            subTitle={"Modulo de pagos a vendedores"}
            icon={<PeopleOutline />}
        >
            <Grid container className="fadeIn" sx={{ mt: 2 }}>
                <Grid item xs={12} sx={{ height: 650, width: "100%" }}>
                    <DataGrid rows={rows} columns={columns} />
                </Grid>
            </Grid>
        </AdminLayout>
    );
};

export default PaymentsPage;
