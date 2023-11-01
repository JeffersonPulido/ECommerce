import NextLink from 'next/link'
import { AddOutlined, CategoryOutlined } from '@mui/icons-material'
import { Box, Button, CardMedia, Chip, Grid, Link } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import useSWR from 'swr'
import { AdminLayout } from '@/components/layouts'
import { IProduct } from '@/interfaces'
import { currency } from '@/utils';
import { shopApi } from '@/axiosApi';

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
                <NextLink href={`/admin/products/${row.slug}`} passHref legacyBehavior>
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
                : <Button color='error' onClick={ () => onDeleteProduct(row.id) }>Eliminar</Button>
        }
        , width: 100
    },
]


const ProductsPage = () => {

    const { data, error } = useSWR<IProduct[]>('/api/admin/products')

    if (!data && !error) return (<></>)

    const rows = data!.map(product => ({
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
        <AdminLayout title={`Gestor de productos (${data?.length})`} subTitle={'Mantenimiento general de productos'} icon={<CategoryOutlined />}>
            <Box display='flex' justifyContent='end' sx={{mb: 2}}>
                <Button
                    startIcon={<AddOutlined/>}
                    color='secondary'
                    className='circular-btn'
                    href='/admin/products/new'
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
        </AdminLayout>
    )
}

export default ProductsPage