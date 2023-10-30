import NextLink from "next/link";
import { ItemCounter } from "../ui/ItemCounter";
import {
  Box,
  Button,
  CardActionArea,
  CardMedia,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import { FC, useContext } from "react";
import { CartContext } from "@/context";
import { ICartProduct, IOrderItem } from "@/interfaces";
import { currency } from "@/utils";

interface Props {
  editable?: boolean;
  products?: IOrderItem[]
}

export const CartList: FC<Props> = ({ editable = false, products }) => {

  const { cart, updateCartQuantity, removeCartProduct } = useContext(CartContext)

  const onNewCartQuantityValue = (product: ICartProduct, newQuantityValue: number) => {
    product.quantity = newQuantityValue
    updateCartQuantity(product)
  }

  const productsToShow = products ? products : cart

  return (
    <>
      {productsToShow.map( product => (
        <Grid spacing={2} container key={product.slug + product.size} sx={{ mb: 1 }}>
          <Grid item xs={3}>
            {/**LLEVAR PAGINA DE PRODUCTO */}
            <NextLink href={`/product/${product.slug}`} passHref legacyBehavior>
              <Link>
                <CardActionArea>
                  <CardMedia
                    image={product.image}
                    component="img"
                    sx={{ borderRadius: "5px", width: '70%' }}
                  />
                </CardActionArea>
              </Link>
            </NextLink>
          </Grid>
          <Grid item xs={7}>
            <Box display="flex" flexDirection="column">
              <Typography variant="body1">{product.title}</Typography>
              <Typography variant="body1">
                <strong>{product.size}</strong>
              </Typography>
              {
                editable
                  ? (
                    <ItemCounter
                      currentValue={product.quantity}
                      maxValue={5}
                      updateQuantity={(value) => { onNewCartQuantityValue(product as ICartProduct, value) }}
                    />
                  ) : (
                    <Typography variant="h5">{product.quantity} {product.quantity > 1 ? 'productos' : 'producto'}</Typography>
                  )
              }
            </Box>
          </Grid>
          <Grid
            item
            xs={2}
            display="flex"
            alignItems="center"
            flexDirection="column"
          >
            <Typography variant="subtitle1">{currency.format(product.price)}</Typography>
            {editable && (
              <Button variant="text" color="secondary" onClick={() => removeCartProduct(product as ICartProduct)}>
                Remover
              </Button>
            )}
          </Grid>
        </Grid>
      ))}
    </>
  );
};
