import { useEffect, useState } from "react";
import { GetServerSideProps, NextPage } from "next";
import moment from "moment";
import NextLink from "next/link";
import { ShopLayout } from "@/components/layouts";
import {
    Button,
    Chip,
    Grid,
    Link,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { getSession } from "next-auth/react";
import { dbOrders } from "@/database";
import { IOrder } from "@/interfaces";
import { currency } from "@/utils";
import { shopApi } from "@/axiosApi";
interface Props {
    orders: IOrder[];
}

const HistoryPage: NextPage<Props> = ({ orders }) => {
    const [orderData, setOrderData] = useState<IOrder[]>([]);

    useEffect(() => {
        if (orders) {
            setOrderData(orders);
        }
    }, [orders]);

    const onDeleteOrder = async (orderId: number) => {
        const { status } = await shopApi.put("/orders/", { orderId });
        if (status === 200) {
            window.location.reload();
        } else {
            return;
        }
    };

    const onUpdateField = async (orderId: string, newState: boolean) => {
        const previusPayments = orderData.map((order) => ({ ...order }));
        const updatedPayments = orderData.map((order) => ({
            ...order,
            isSatisfying: orderId === order._id ? newState : order.isSatisfying,
        }));
        setOrderData(updatedPayments);
        try {
            await shopApi.put("/orders/pay/", {
                orderId,
                isSatisfying: newState,
            });
            window.location.reload();
        } catch (error) {
            setOrderData(previusPayments);
            console.log(error);
            alert("No se pudo actualizar el estado de recibido de la orden");
        }
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "Orden Id", width: 220 },
        { field: "fullname", headerName: "Nombre Completo", width: 200 },
        { field: "createdAt", headerName: "Fecha de compra", width: 210 },
        { field: "total", headerName: "Total", width: 120 },
        {
            field: "shippingStatus",
            headerName: "Estado del envio",
            width: 150,
            renderCell: ({ row }: GridRenderCellParams) => {
                return row.shippingStatus ? (
                    <Chip color="success" label="Enviado" variant="outlined" />
                ) : (
                    <Chip
                        color="warning"
                        label="Pendiente"
                        variant="outlined"
                    />
                );
            },
        },
        {
            field: "dateModifiedShippingStatus",
            headerName: "Fecha de envio",
            width: 200,
        },
        {
            field: "transportationName",
            headerName: "Transportadora",
            width: 150,
        },
        { field: "guideNumber", headerName: "N° Guia", width: 200 },
        {
            field: "isSatisfying",
            headerName: "Estado de recibido",
            width: 200,
            renderCell: ({ row }: GridRenderCellParams) => {
                return (
                    <Select
                        value={row.isSatisfying}
                        label="Estado de recibido"
                        disabled={!row.shippingStatus || row.isSatisfying === 'Satisfecho'}
                        sx={{ width: "100%" }}
                        onChange={({ target }) =>
                            onUpdateField(row.id, target.value)
                        }
                    >
                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                        <MenuItem value="Satisfecho">Satisfecho</MenuItem>
                        <MenuItem value="Inconforme">Inconforme</MenuItem>
                    </Select>
                );
            },
        },
        {
            field: "paid",
            headerName: "Estado de pago",
            description: "Muestra informacion si la orden fue pagada o no",
            width: 150,
            renderCell: (params: GridRenderCellParams) => {
                return params.row.paid ? (
                    <Chip color="success" label="Pagada" variant="outlined" />
                ) : (
                    <Chip color="error" label="Por pagar" variant="outlined" />
                );
            },
        },
        {
            field: "orden",
            headerName: "Orden",
            width: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => {
                return (
                    <NextLink
                        href={`/orders/${params.row.orderId}`}
                        passHref
                        legacyBehavior
                    >
                        <Link underline="always" display="flex">
                            Detallar
                        </Link>
                    </NextLink>
                );
            },
        },
        {
            field: "deleteOrder",
            headerName: "Acciones",
            renderCell: ({ row }: GridRenderCellParams) => {
                return row.paid ? (
                    "N/A"
                ) : (
                    <Button
                        className="circular-btn"
                        color="error"
                        onClick={() => onDeleteOrder(row.id)}
                    >
                        Eliminar
                    </Button>
                );
            },
            width: 100,
        },
    ];

    const rows = orders.map((order, idx) => ({
        id: order._id,
        paid: order.isPaid,
        fullname: `${order.shippingAddress.name} ${order.shippingAddress.lastName}`,
        createdAt: moment(order.createdAt).format("DD / MMM / YYYY, h:mm:ss a"),
        total: currency.format(order.total),
        shippingStatus: order.payment?.shippingStatus,
        transportationName: order.payment?.transportationName,
        guideNumber: order.payment?.guideNumber,
        orderId: order._id,
        isSatisfying: order.isSatisfying,
        dateModifiedShippingStatus: moment(order.payment?.updatedAt).format(
            "DD / MMM / YYYY, h:mm:ss a"
        ),
    }));

    return (
        <ShopLayout
            title="Historial de compras"
            pageDescription="Historial de compras del cliente"
        >
            <Typography variant="h1" component="h1">
                Historial de compras
            </Typography>

            <Grid container className="fadeIn" sx={{mt: 2}}>
                <Grid item xs={12} sx={{ height: 650, width: "100%" }}>
                    <DataGrid rows={rows} columns={columns} />
                </Grid>
            </Grid>
        </ShopLayout>
    );
};

export const getServerSideProps: GetServerSideProps = async ({
    req,
    query,
}) => {
    const session: any = await getSession({ req });
    if (!session) {
        return {
            redirect: {
                destination: "/auth/login?p=/orders/history",
                permanent: false,
            },
        };
    }

    const orders = await dbOrders.getOrdersByUser(session.user._id);

    return {
        props: {
            orders,
        },
    };
};
export default HistoryPage;
