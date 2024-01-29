import { ShopLayout } from '@/components/layouts'
import { ProductList } from '@/components/products'
import { FullScreenLoading } from '@/components/ui/FullScreenLoading'
import { useProducts } from '@/hooks'
import { Typography } from '@mui/material'
import { NextPage } from 'next'

const CleanPage: NextPage = () => {

    const { products, isLoading } = useProducts('/products?type=mobiliario')

    return (
        <ShopLayout
            title={"Mobiliario"}
            pageDescription={`Categoría de mobiliario en ${process.env.NEXT_PUBLIC_APP_NAME}`}
        >
            <Typography variant="h1" component="h1" sx={{ mb: 4 }}>
                Categoria de mobiliario
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