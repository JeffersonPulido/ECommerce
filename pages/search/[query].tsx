import { GetServerSideProps, NextPage } from "next";
import { ShopLayout } from "@/components/layouts";
import { ProductList } from "@/components/products";
import { Box, Typography } from "@mui/material";
import { dbProducts } from "@/database";
import { IProduct } from "@/interfaces";

interface Props {
    products: IProduct[],
    foundProducts: boolean,
    query: string
}

const SearchPage: NextPage<Props> = ({ products, foundProducts, query }) => {

    return (
        <>
            <ShopLayout
                title={"Buscador"}
                pageDescription={
                    `${process.env.NEXT_PUBLIC_APP_NAME}, la mejor alternativa para tus compras de zapatos!`
                }
            >
                <Typography variant="h1" component="h1">
                    Buscar productos
                </Typography>
                {
                    foundProducts
                        ? <Typography variant="h2" sx={{ mb: 2 }} textTransform='capitalize'>Busqueda: {query}</Typography>
                        : (
                            <Box display='flex'>
                                <Typography variant="h2" sx={{ mb: 2 }}>No encontramos ningún producto relacionado con tu busqueda:</Typography>
                                <Typography variant="h2" sx={{ ml: 1 }} color='orange' textTransform='capitalize' fontWeight='bold'>{query}</Typography>
                            </Box>
                        )
                }

                <ProductList products={products} />
            </ShopLayout>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const { query = '' } = params as { query: string };

    if (query.length === 0) {
        return {
            redirect: {
                destination: '/',
                permanent: true
            }
        }
    }

    let products = await dbProducts.getProductsByTerm(query)
    const foundProducts = products.length > 0

    if (!foundProducts) {
        products = await dbProducts.getAllProducts()
    }


    return {
        props: {
            products,
            foundProducts,
            query
        }
    }
}

export default SearchPage;
