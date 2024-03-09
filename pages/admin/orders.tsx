import { ConfirmationNumberOutlined } from "@mui/icons-material";
import { Button, Chip, Grid } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import useSWR from "swr";
import { AdminLayout } from "@/components/layouts";
import { IOrder, IUser } from "@/interfaces";
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
    { field: "email", headerName: "Email", width: 200 },
    { field: "name", headerName: "Nombre Completo", width: 150 },
    { field: "total", headerName: "Valor total", width: 150 },
    {
        field: "isPaid",
        headerName: "Estado",
        renderCell: ({ row }: GridRenderCellParams) => {
            return row.isPaid ? (
                <Chip variant="outlined" label="Pagada" color="success" />
            ) : (
                <Chip variant="outlined" label="Pendiente" color="error" />
            );
        },
        width: 120,
    },
    {
        field: "noProducts",
        headerName: "N° Productos",
        align: "center",
        width: 100,
    },
    {
        field: "check",
        headerName: "Ver orden",
        renderCell: ({ row }: GridRenderCellParams) => {
            return (
                <a
                    href={`/admin/orders/${row.id}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    Ver orden
                </a>
            );
        },
        width: 100,
    },
    { field: "createdAt", headerName: "Creada en", width: 200 },
    {
        field: "deleteOrder",
        headerName: "Acciones",
        renderCell: ({ row }: GridRenderCellParams) => {
            return row.isPaid ? (
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

const OrdersPage = () => {
    const { data, error } = useSWR<IOrder[]>("/api/admin/orders");

    if (!data && !error) return <></>;

    const rows = data!.map((order) => ({
        id: order._id,
        email: (order.name as IUser).email,
        name: (order.name as IUser).name,
        total: currency.format(order.total),
        isPaid: order.isPaid,
        noProducts: order.numberOfItems,
        createdAt: moment(order.createdAt).format("DD / MMM / YYYY, h:mm:ss a"),
    }));

    return (
        <AdminLayout
            title={"Gestor de ordenes"}
            subTitle={"Mantenimiento general de ordenes"}
            icon={<ConfirmationNumberOutlined />}
        >
            <Grid container className="fadeIn" sx={{ mt: 2 }}>
                <Grid item xs={12} sx={{ height: 650, width: "100%" }}>
                    <DataGrid rows={rows} columns={columns} />
                </Grid>
            </Grid>
        </AdminLayout>
    );
};

export default OrdersPage;
