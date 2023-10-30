import { GetServerSideProps, NextPage } from "next"
import NextLink from 'next/link'
import { ShopLayout } from "@/components/layouts"
import { Chip, Grid, Link, Typography } from "@mui/material"
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { DataGrid, GridColDef, GridValueGetterParams, GridRenderCellParams } from "@mui/x-data-grid"
import { getSession } from "next-auth/react"
import { dbOrders } from "@/database"
import { IOrder } from "@/interfaces";
import { currency } from "@/utils";

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'fullname', headerName: 'Nombre Completo', width: 200 },
    { field: 'createdAt', headerName: 'Creada en', width: 200 },
    { field: 'total', headerName: 'Total', width: 200 },
    {
        field: 'paid',
        headerName: 'Pagada',
        description: 'Muestra informacion si la orden fue pagada o no',
        width: 150,
        renderCell: (params: GridRenderCellParams) => {
            return (
                params.row.paid
                    ? <Chip color="success" label='Pagada' variant="outlined" />
                    : <Chip color="error" label='Pendiente' variant="outlined" />
            )
        }
    },
    {
        field: 'orden',
        headerName: 'Orden',
        width: 150,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => {
            return (
                <NextLink href={`/orders/${params.row.orderId}`} passHref legacyBehavior>
                    <Link underline="always" display='flex'><AddCircleOutlineOutlinedIcon />Detallar</Link>
                </NextLink>
            )
        }
    }
]

interface Props {
    orders: IOrder[]
}

const HistoryPage: NextPage<Props> = ({ orders }) => {

    const rows = orders.map((order, idx) => ({
        id: idx + 1,
        paid: order.isPaid,
        fullname: `${order.shippingAddress.name} ${order.shippingAddress.lastName}`,
        createdAt: order.createdAt,
        total:  currency.format(order.total),
        orderId: order._id
    }))

    return (
        <ShopLayout title="Historial de ordenes" pageDescription="Historial de ordenes del cliente">
            <Typography variant="h1" component='h1'>Historial de ordenes</Typography>

            <Grid container className="fadeIn">
                <Grid item xs={12} sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                    />
                </Grid>
            </Grid>
        </ShopLayout>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const session: any = await getSession({ req });
    if (!session) {
        return {
            redirect: {
                destination: '/auth/login?p=/orders/history',
                permanent: false,
            }
        }
    }

    const orders = await dbOrders.getOrdersByUser(session.user._id)

    return {
        props: {
            orders
        }

    }
}
export default HistoryPage