import { ShopLayout } from '@/components/layouts'
import { ProductList } from '@/components/products'
import { FullScreenLoading } from '@/components/ui/FullScreenLoading'
import { useProducts } from '@/hooks'
import { Typography } from '@mui/material'
import { NextPage } from 'next'

const MenPage: NextPage = () => {

    const { products, isLoading } = useProducts('/products?gender=men')

    return (
        <ShopLayout
            title={"Hombres"}
            pageDescription={`Categoría de hombres en ${process.env.NEXT_PUBLIC_APP_NAME}`}
        >
            <Typography variant="h1" component="h1" sx={{ mb: 4 }}>
                Categoria de hombres
            </Typography>

            {
                isLoading
                    ? <FullScreenLoading />
                    : <ProductList products={products} />
            }

        </ShopLayout>
    )
}

export default MenPage