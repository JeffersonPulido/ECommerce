import { useContext, useEffect, useState } from "react";
import { CartContext } from "@/context";
import Cookies from 'js-cookie'
import { useRouter } from "next/router";
import { CartList, OrderSummary } from "@/components/cart";
import { ShopLayout } from "@/components/layouts";
import NextLink from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link,
  Typography,
} from "@mui/material";

const SummaryPage = () => {

  const router = useRouter()
  const { shippingAddress, numberOfItems, createOrder } = useContext(CartContext)

  const [isPosting, setIsPosting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!Cookies.get('name')) {
      router.push('/checkout/address')
    }
  }, [router])

  const onCreateOrder = async() => {
    setIsPosting(true)
    const { hasError, message } = await createOrder()

    if ( hasError ) {
      setIsPosting(false)
      setErrorMessage(message)
      return
    }
    
    router.replace(`/orders/${ message }`)
  }

  if (!shippingAddress) {
    return <></>
  }

  return (
    <ShopLayout
      title="Resumen de compra"
      pageDescription={`Resumen de la orden de compra en ${process.env.NEXT_PUBLIC_APP_NAME}`}
    >
      <Typography variant="h1" component="h1">
        Resumen de la orden
      </Typography>
      <Grid container sx={{ mt: 4 }} spacing={2}>
        <Grid item xs={12} sm={7}>
          <CartList />
        </Grid>
        <Grid item xs={12} sm={5}>
          <Card className="summary-card">
            <CardContent>
              <Typography variant="h2">Resumen ( {numberOfItems} {numberOfItems > 1 ? 'productos' : 'producto'} )</Typography>
              <Divider sx={{ my: 1 }} />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1">
                  Dirección de entrega
                </Typography>
                <NextLink href="/checkout/address" passHref legacyBehavior>
                  <Link underline="always">Editar</Link>
                </NextLink>
              </Box>

              <Typography>{shippingAddress?.name} {shippingAddress?.lastName}</Typography>
              <Typography>{shippingAddress?.address}</Typography>
              <Typography>{shippingAddress?.neighborhood}</Typography>
              <Typography>{shippingAddress?.city}, {shippingAddress?.department}</Typography>
              <Typography>{shippingAddress?.observation}</Typography>
              <Typography>{shippingAddress?.phone}</Typography>

              <Divider sx={{ my: 1 }} />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1">Factura</Typography>
                <NextLink href="/cart" passHref legacyBehavior>
                  <Link underline="always">Editar</Link>
                </NextLink>
              </Box>

              <OrderSummary />

              <Box sx={{ mt: 3 }} display='flex' flexDirection='column'>
                <Button 
                  color="secondary" 
                  className="circular-btn" 
                  fullWidth 
                  onClick={ onCreateOrder }
                  disabled= {  isPosting }
                >
                  Confirmar Orden
                </Button>
                <Chip
                  color="error"
                  label={ errorMessage }
                  sx={{display: errorMessage ? 'flex' : 'none', mt: 2 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ShopLayout>
  );
};

export default SummaryPage;