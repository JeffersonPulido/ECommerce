import { GetServerSideProps, NextPage } from "next"
import { getSession } from 'next-auth/react';
import NextLink from 'next/link'
import { AddOutlined } from '@mui/icons-material'
import { Box, Button, CardMedia, Grid, Link, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { ShopLayout } from '@/components/layouts'
import { IProduct } from '@/interfaces'
import { currency } from '@/utils';
import { dbProducts } from '@/database';
import { shopApi } from "@/axiosApi";

const onDeleteProduct = async (productId: number) => {
    const { status } =  await shopApi.put('/products/', { productId })
    if (status === 200) {
        window.location.reload()
    } else {
        return
    }
}

const columns: GridColDef[] = [
    {
        field: 'img',
        headerName: 'Foto',
        renderCell: ({ row }: GridRenderCellParams) => {
            return (
                <a href={`/product/${row.slug}`} target='_blank' rel='noreferrer'>
                    <CardMedia
                        component='img'
                        className='fadeIn'
                        alt={row.title}
                        image={`${row.img}`}
                    />
                </a>
            )
        }
    },
    {
        field: 'title',
        headerName: 'Nombre',
        width: 400,
        renderCell: ({ row }: GridRenderCellParams) => {
            return (
                <NextLink href={`/product/managment/${row.slug}`} passHref legacyBehavior>
                    <Link underline='always'>
                        {row.title}
                    </Link>
                </NextLink>
            )
        }
    },
    { field: 'gender', headerName: 'Genero' },
    { field: 'type', headerName: 'Tipo' },
    { field: 'inStock', headerName: 'Inventario' },
    { field: 'price', headerName: 'Precio', width: 200 },
    { field: 'sizes', headerName: 'Tallas', width: 250 },
    {
        field: 'deleteProduct',
        headerName: 'Acciones',
        renderCell: ({ row }: GridRenderCellParams) => {
            return row.inStock > 0
                ? 'N/A'
                : <Button color='error' className="circular-btn" onClick={ () => onDeleteProduct(row.id) }>Eliminar</Button>
        }
        , width: 100
    },
]

interface Props {
    products: IProduct[]
}

const ListProducts: NextPage<Props> = ({ products }) => {


    const rows = products!.map(product => ({
        id: product._id,
        img: product.images[0],
        title: product.title,
        gender: product.gender,
        type: product.type,
        inStock: product.inStock,
        price: currency.format(product.price),
        sizes: product.sizes.join(', '),
        slug: product.slug
    }))

    return (
        <ShopLayout title={`Mis productos (${products.length})`} pageDescription={'Pagina de productos publicados por el usuario'}>
            <Typography variant="h1" component='h1'>{`Mis Productos (${products.length})`}</Typography>
            <Box display='flex' justifyContent='end' sx={{ mb: 2 }}>
                <Button
                    startIcon={<AddOutlined />}
                    color='secondary'
                    className='circular-btn'
                    href='/product/managment/new'
                >
                    Crear Producto
                </Button>
            </Box>
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
                destination: '/auth/login?p=/product/managment/ListProducts',
                permanent: false,
            }
        }
    }
    const products = await dbProducts.getProductsByUser(session.user._id)

    return {
        props: {
            products
        }

    }
}

export default ListProducts