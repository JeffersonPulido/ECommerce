import { ShopLayout } from '@/components/layouts'
import { ProductList } from '@/components/products'
import { FullScreenLoading } from '@/components/ui'
import { useProducts } from '@/hooks'
import { Typography } from '@mui/material'
import { NextPage } from 'next'

const WomenPage: NextPage = () => {

    const { products, isLoading } = useProducts('/products?gender=women')

    return (
        <ShopLayout
            title={"Mujeres"}
            pageDescription={`Categoría de mujeres en ${process.env.NEXT_PUBLIC_APP_NAME}`}
        >
            <Typography variant="h1" component="h1" sx={{ mb: 4 }}>
                Categoria de mujeres
            </Typography>

            {
                isLoading
                    ? <FullScreenLoading />
                    : <ProductList products={products} />
            }

        </ShopLayout>
    )
}

export default WomenPage