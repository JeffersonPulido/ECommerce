import { ShopLayout } from '@/components/layouts'
import { ProductList } from '@/components/products'
import { FullScreenLoading } from '@/components/ui'
import { useProducts } from '@/hooks'
import { Typography } from '@mui/material'
import { NextPage } from 'next'

const VarietyPage: NextPage = () => {

    const { products, isLoading } = useProducts('/products?type=accesorios')

    return (
        <ShopLayout
            title={"Accesorios"}
            pageDescription={`Categorías de accesorios en ${process.env.NEXT_PUBLIC_APP_NAME}`}
        >
            <Typography variant="h1" component="h1" sx={{ mb: 4 }}>
                Categoria de accesorios
            </Typography>

            {
                isLoading
                    ? <FullScreenLoading />
                    : <ProductList products={products} />
            }

        </ShopLayout>
    )
}

export default VarietyPage