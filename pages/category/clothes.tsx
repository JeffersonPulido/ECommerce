import { ShopLayout } from "@/components/layouts"
import { ProductList } from "@/components/products"
import { FullScreenLoading } from "@/components/ui"
import { useProducts } from "@/hooks"
import { Typography } from "@mui/material"
import { NextPage } from "next"

const ClothesPage: NextPage = () => {

    const { products, isLoading } = useProducts('/products?type=ropa')

    return (
        <ShopLayout
            title={"Ropa"}
            pageDescription={`Categoría de ropa en ${process.env.NEXT_PUBLIC_APP_NAME}`}
        >
            <Typography variant="h1" component="h1" sx={{ mb: 4 }}>
                Categoria de ropa
            </Typography>

            {
                isLoading
                    ? <FullScreenLoading />
                    : <ProductList products={products} />
            }

        </ShopLayout>
    )
}

export default ClothesPage