import { useEffect, useState } from "react";
import { CartList, OrderSummary } from "@/components/cart";
import { ShopLayout } from "@/components/layouts";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
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
import {
    CreditCardOffOutlined,
    CreditScoreOutlined,
    PaymentOutlined,
    CheckBoxOutlined,
    ErrorOutline
} from "@mui/icons-material";
import { getSession } from "next-auth/react";
import { dbOrders } from "@/database";
import { IOrder } from "@/interfaces";
import shopApi from "@/axiosApi/shopApi";

interface Props {
    order: IOrder
}
interface NotificationType {
    isOpen: boolean,
    type: 'approved' | 'failure' | null,
    content: string,
}

const OrderPage: NextPage<Props> = ({ order }) => {
    const router = useRouter()
    const { shippingAddress, numberOfItems, subTotal, tax, total } = order
    const dataPaid = { numberOfItems, subTotal, tax, total }
    
    const [notification, setNotification] = useState<NotificationType>({
        isOpen: false,
        type: null,
        content: ''
    })

    const [url, setUrl] = useState<null | string>(null)

    useEffect(() => {
        const generateLink = async () => {
            try {
                const { data: preference } = await shopApi.post('/orders/pay', { total, order })
                setUrl(preference.url)
            } catch (error) {
                console.log(error)
            }
        }

        generateLink()
    }, [total, order])

    const onPay = () => {
        router.replace(url!)
    }

    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search)
      const status = urlParams.get('status')
      if (status === 'approved') {
        setNotification({
            content: 'Pago aprobado',
            isOpen: true,
            type: 'approved'
        });
      }
      else if (status === 'failure') {
        setNotification({
            content: 'Pago rechazado',
            isOpen: true,
            type: 'failure'
        });
      }

      setTimeout(() => {
        setNotification({
            isOpen: false,
            type: null,
            content: ''
        })
      }, 5000)
    }, [])

    return (
        <ShopLayout
            title="Resumen de compra"
            pageDescription={`Resumen de la orden de compra en ${process.env.NEXT_PUBLIC_APP_NAME}`}
        >
            <Typography variant="h1" component="h1">
                Orden: {order._id}
            </Typography>
            {/* Chip is paid false or true */}
            {
                order.isPaid
                    ? (
                        <Chip
                            sx={{ my: 2 }}
                            label="Orden Pagada"
                            variant="outlined"
                            color="success"
                            icon={<CreditScoreOutlined />}
                        />
                    )
                    : (
                        <Chip
                            sx={{ my: 2 }}
                            label='Pendiente de pago'
                            variant="outlined"
                            color="error"
                            icon={<CreditCardOffOutlined />}
                        />
                    )
            }

            <Grid container spacing={2} className="fadeIn">
                <Grid item xs={12} sm={7}>
                    <CartList products={order.orderItems} />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Card className="summary-card">
                        <CardContent>
                            <Typography variant="h2">
                                Resumen ({order.numberOfItems} {order.numberOfItems > 1 ? 'productos' : 'producto'})
                            </Typography>
                            <Divider sx={{ my: 1 }} />

                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="subtitle1">
                                    Dirección de entrega
                                </Typography>
                            </Box>

                            <Typography>{shippingAddress?.name} {shippingAddress?.lastName}</Typography>
                            <Typography>{shippingAddress?.address}</Typography>
                            <Typography>{shippingAddress?.neighborhood}</Typography>
                            <Typography>{shippingAddress?.city}, {shippingAddress?.department}</Typography>
                            <Typography>{shippingAddress?.observation}</Typography>
                            <Typography>{shippingAddress?.phone}</Typography>

                            <Divider sx={{ my: 1 }} />

                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="subtitle1">
                                    Factura
                                </Typography>
                            </Box>

                            <OrderSummary dataPaid={dataPaid} />

                            <Box sx={{ mt: 3 }} display='flex' flexDirection='column'>
                                {/* Chip is paid false or true */}
                                {
                                    order.isPaid
                                        ? (
                                            <Chip
                                                sx={{ my: 2 }}
                                                label="Orden Pagada"
                                                variant="outlined"
                                                color="success"
                                                icon={<CreditScoreOutlined />}
                                            />
                                        )
                                        : (
                                            <Button
                                                color="secondary"
                                                className="circular-btn"
                                                fullWidth
                                                onClick={onPay}
                                                startIcon={<PaymentOutlined />}
                                            >
                                                Pagar Orden
                                            </Button>
                                        )
                                }
                                {
                                    notification.isOpen && (
                                        <Chip
                                            sx={{ my: 2 }}
                                            variant="filled"
                                            className="fadeIn"
                                            label={notification.type === 'approved' ? notification.content : notification.content }
                                            color={notification.type === 'approved' ? 'success' : 'error'}
                                            icon={notification.type === 'approved' ? <CheckBoxOutlined /> : <ErrorOutline/>}
                                        />
                                    )
                                }
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ShopLayout>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const { id = '' } = query
    const session: any = await getSession({ req })
    if (!session) {
        return {
            redirect: {
                destination: `/auth/login?p=/orders/${id}`,
                permanent: false
            }
        }
    }

    const order = await dbOrders.getOrderById(id.toString())

    if (!order) {
        return {
            redirect: {
                destination: `/orders/history`,
                permanent: false
            }
        }
    }

    if (order.name !== session.user._id) {
        return {
            redirect: {
                destination: `/orders/history`,
                permanent: false
            }
        }
    }

    return {
        props: {
            order
        }

    }
}

export default OrderPage;
