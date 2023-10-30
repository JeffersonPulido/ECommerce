import { CartList, OrderSummary } from "@/components/cart";
import { AdminLayout } from "@/components/layouts";
import { GetServerSideProps, NextPage } from "next";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Typography,
} from "@mui/material";
import {
    AirplaneTicketOutlined,
    CreditCardOffOutlined,
    CreditScoreOutlined,
} from "@mui/icons-material";
import { dbOrders } from "@/database";
import { IOrder } from "@/interfaces";

interface Props {
    order: IOrder
}

const OrderPage: NextPage<Props> = ({ order }) => {

    const { shippingAddress, numberOfItems, subTotal, tax, total } = order
    const dataPaid = { numberOfItems, subTotal, tax, total }

    return (
        <AdminLayout
            title="Resumen de la order"
            subTitle={`Orden ID: ${order._id}`}
            icon={< AirplaneTicketOutlined/>}
        >
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
                                            <Chip
                                                sx={{ my: 2 }}
                                                label='Pendiente de pago'
                                                variant="outlined"
                                                color="error"
                                                icon={<CreditCardOffOutlined />}
                                            />
                                        )
                                }
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </AdminLayout>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const { id = '' } = query

    const order = await dbOrders.getOrderById(id.toString())

    if (!order) {
        return {
            redirect: {
                destination: `/admin/orders`,
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
