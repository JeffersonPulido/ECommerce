import { GetServerSideProps, NextPage } from "next";
import NextLink from "next/link";
import { ShopLayout } from "@/components/layouts";
import { Button, Chip, Grid, Link, Typography } from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridValueGetterParams,
    GridRenderCellParams,
} from "@mui/x-data-grid";
import { getSession } from "next-auth/react";
import { dbOrders } from "@/database";
import { IOrder } from "@/interfaces";
import { currency } from "@/utils";
import { shopApi } from "@/axiosApi";
import moment from "moment";

const onDeleteOrder = async (orderId: number) => {
    const { status } = await shopApi.put("/orders/", { orderId });
    if (status === 200) {
        window.location.reload();
    } else {
        return;
    }
};

const columns: GridColDef[] = [
    { field: "id", headerName: "Orden Id", width: 220 },
    { field: "fullname", headerName: "Nombre Completo", width: 200 },
    { field: "createdAt", headerName: "Creada en", width: 200 },
    { field: "total", headerName: "Total", width: 120 },
    { 
        field: "shippingStatus", 
        headerName: "Estado del envio",
        width: 150,
        renderCell: ({ row }: GridRenderCellParams) => {
            return row.shippingStatus ? (
                <Chip
                    color="success"
                    label="Enviado"
                    variant="outlined"
                />
            ) : (
                <Chip
                    color="warning"
                    label="Pendiente"
                    variant="outlined"
                />
            );
        },
    },
    { field: "transportationName", headerName: "Transportadora", width: 150 },
    { field: "guideNumber", headerName: "N° Guia", width: 200 },
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

interface Props {
    orders: IOrder[];
}

const HistoryPage: NextPage<Props> = ({ orders }) => {
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
    }));

    return (
        <ShopLayout
            title="Historial de ordenes"
            pageDescription="Historial de ordenes del cliente"
        >
            <Typography variant="h1" component="h1">
                Historial de ordenes
            </Typography>

            <Grid container className="fadeIn">
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
