import React, { useContext, useEffect } from "react";
import NextLink from "next/link";
import { CartList, OrderSummary } from "@/components/cart";
import { ShopLayout } from "@/components/layouts";
import { CartContext } from "@/context";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";

const CartPage = () => {

  const { isLoaded, numberOfItems, cart } = useContext(CartContext)
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && cart.length === 0) {
      router.replace('/cart/empty')
    }
  }, [isLoaded, cart, router])

  if (!isLoaded || cart.length === 0) {
    return (<></>)
  }

  return (
    <ShopLayout
      title={`Carrito - ${numberOfItems} `}
      pageDescription={`Carrito de compras de ${process.env.NEXT_PUBLIC_APP_NAME}`}
    >
      <Typography variant="h1" component="h1">
        Carrito
      </Typography>
      <Grid container sx={{ mt: 4 }} spacing={2}>
        <Grid item xs={12} sm={7}>
          <CartList editable={true} />
        </Grid>
        <Grid item xs={12} sm={5}>
          <Card className="summary-card">
            <CardContent>
              <Typography variant="h2">Orden</Typography>
              <Divider sx={{ my: 1 }} />
              <OrderSummary />
              <Box sx={{ mt: 3 }}>
                <Button color="secondary" className="circular-btn" fullWidth>
                  {/* Confirmar Orden */}
                  <NextLink href="/checkout/address" passHref legacyBehavior>
                    <Link color='white'>Finalizar pedido</Link>
                  </NextLink>
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ShopLayout>
  );
};

export default CartPage;
