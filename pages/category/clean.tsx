import { ShopLayout } from '@/components/layouts'
import { ProductList } from '@/components/products'
import { FullScreenLoading } from '@/components/ui/FullScreenLoading'
import { useProducts } from '@/hooks'
import { Typography } from '@mui/material'
import { NextPage } from 'next'

const CleanPage: NextPage = () => {

    const { products, isLoading } = useProducts('/products?type=aseo')

    return (
        <ShopLayout
            title={"Limpieza y Aseo"}
            pageDescription={`Categoría de limpieza y aseo en ${process.env.NEXT_PUBLIC_APP_NAME}`}
        >
            <Typography variant="h1" component="h1" sx={{ mb: 4 }}>
                Categoria de limpieza y aseo
            </Typography>

            {
                isLoading
                    ? <FullScreenLoading />
                    : <ProductList products={products} />
            }

        </ShopLayout>
    )
}

export default CleanPage