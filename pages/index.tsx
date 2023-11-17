import { ShopLayout } from "@/components/layouts";
import { ProductList } from "@/components/products";
import { FullScreenLoading } from "@/components/ui";
import { useProducts } from "@/hooks";
import { Typography } from "@mui/material";
import { NextPage } from "next";

const HomePage: NextPage = () => {

    const { products, isLoading } = useProducts('/products')

    return (
        <>
            <ShopLayout
                title={"Home"}
                pageDescription={
                    `${process.env.NEXT_PUBLIC_APP_NAME}, la mejor alternativa para tus compras!`
                }
            >
                <Typography variant="h1" component="h1">
                    Tienda
                </Typography>
                <Typography variant="h2" sx={{ mb: 1 }}>
                    Todos los productos
                </Typography>

                {
                    isLoading 
                    ? <FullScreenLoading/>
                    : <ProductList products={ products } />
                }
                
            </ShopLayout>
        </>
    );
};

export default HomePage;
