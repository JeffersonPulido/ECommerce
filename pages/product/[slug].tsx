import { useContext, useState } from 'react';
import { NextPage, GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { CartContext } from '@/context';
import { dbProducts } from '@/database';
import { Box, Button, Chip, Grid, Typography } from "@mui/material";
import { ICartProduct, IProduct, ISize } from "@/interfaces";
import { ShopLayout } from "@/components/layouts";
import { ProductSlideshow, SizeSelector } from "@/components/products";
import { ItemCounter } from "@/components/ui";
import { currency } from '@/utils';

interface Props {
  product: IProduct
}

const ProductPage: NextPage<Props> = ({ product }) => {

  const router = useRouter()
  const { addProductToCart } = useContext(CartContext)

  const [tempCartProduct, setTempCartProduct] = useState<ICartProduct>({
    _id: product._id,
    image: product.images[0],
    price: product.price,
    size: undefined,
    slug: product.slug,
    title: product.title,
    gender: product.gender,
    quantity: 1
  })

  const onSelectedSize = (size: ISize) => {
    setTempCartProduct(currentProduct => ({
      ...currentProduct,
      size: size,
    }))
  }

  const onUpdateQuantity = (newQuantity: number) => {
    setTempCartProduct(currentProduct => ({
      ...currentProduct,
      quantity: newQuantity,
    }))
  }

  const onAddProduct = () => {

    if (!tempCartProduct.size) { return }
    //dispatch del context para añadir al cart
    addProductToCart(tempCartProduct)
    router.push('/cart')
  }

  return (
    <ShopLayout title={`${product.title}`} pageDescription={product.description}>
      <Grid container spacing={3}>
        {/**SLIDES SHOW IMAGES */}
        <Grid item xs={12} sm={7}>
          <ProductSlideshow images={product.images} />
        </Grid>
        {/**CONTENT PRODUCT */}
        <Grid item xs={12} sm={5}>
          <Box display="flex" flexDirection="column">
            {/**TITLES */}
            <Typography variant="h1" component="h1">
              {product.title}
            </Typography>
            <Typography variant="subtitle1" component="h2">
              { currency.format(product.price)}
            </Typography>
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle2">Cantidad</Typography>
              {/**CANTIDAD */}
              <ItemCounter
                currentValue={tempCartProduct.quantity}
                updateQuantity={onUpdateQuantity}
                maxValue={product.inStock > 5 ? 5 : product.inStock}
              />
              {/**TALLAS */}
              <SizeSelector
                sizes={product.sizes}
                selectedSize={tempCartProduct.size}
                onSelectedSize={(size) => onSelectedSize(size)}
              />
            </Box>
            {/** AGREGAR AL CARRITO*/}
            {
              product.inStock === 0
                ? (
                  <Chip label='No hay disponibles' color="error" variant="outlined" />
                )
                : (
                  <Button
                    color="secondary"
                    className="circular-btn"
                    onClick={onAddProduct}
                  >
                    {
                      tempCartProduct.size
                        ? "Agregar al carrito"
                        : "Seleccione una talla"
                    }
                  </Button>
                )
            }
            {/**DESCRIPTION */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2">Descripcion</Typography>
              <Typography variant="body2">{product.description}</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ShopLayout>
  );
};

//getStaticPaths
export const getStaticPaths: GetStaticPaths = async () => {

  const productSlugs = await dbProducts.getAllProductSlugs()


  return {
    paths: productSlugs.map(({ slug }) => ({
      params: {
        slug
      }
    })),
    fallback: "blocking"
  }
}
//getStaticProps
export const getStaticProps: GetStaticProps = async ({ params }) => {

  const { slug = '' } = params as { slug: string }
  const product = await dbProducts.getProductBySlug(slug)

  if (!product) {
    return {
      redirect: {
        destination: "/",
        permanent: false
      }
    }
  }

  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24
  }
}

export default ProductPage;
