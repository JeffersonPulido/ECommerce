import { GetServerSideProps, NextPage } from "next"
import { getSession } from 'next-auth/react';
import { Chip, Grid, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { ShopLayout } from '@/components/layouts'
import { IPayments } from '@/interfaces'
import { currency } from '@/utils';
import { dbPayments } from '@/database';
import moment from "moment";

const columns: GridColDef[] = [
    { field: 'title', headerName: 'Nombre', width: 400, },
    { field: 'quantity', headerName: 'Cantidad', width: 100 },
    { field: 'price', headerName: 'Precio de venta', width: 150 },
    { field: 'comission', headerName: 'Comision', width: 150 },
    { field: 'money', headerName: 'Ganancia Neta', width: 150 },
    { field: 'date', headerName: 'Fecha venta', width: 200 },
    { 
        field: 'status', 
        headerName: 'Estado de pago', 
        width: 150, 
        renderCell: ({ row }: GridRenderCellParams) => {
            return row.status
                ? <Chip color="success" label='Consignado' variant="outlined" />
                : <Chip color="warning" label='Pendiente' variant="outlined" />
        }
    },
]

interface Props {
    products: IPayments[]
}

const MySales: NextPage<Props> = ({ products }) => {

    const rows = products!.map(product => ({
        id: product._id,
        title: product.item,
        quantity: product.quantityBuy,
        price: currency.format(product.total),
        comission: currency.format(product.comission),
        money: currency.format((product.total) - (product.comission ) ),
        date: moment(product.createdAt).format('DD / MMM / YYYY, h:mm:ss a'),
        status: product.status
    }))

    return (
        <ShopLayout title={`Mis ventas (${products.length})`} pageDescription={'Pagina de ventas realizadas por el usuario'}>
            <Typography variant="h1" component='h1'>{`Mis Ventas (${products.length})`}</Typography>
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
                destination: '/auth/login?p=/product/managment/mySales',
                permanent: false,
            }
        }
    }
    const products = await dbPayments.getPaymentByUser(session.user._id)

    return {
        props: {
            products
        }

    }
}

export default MySales