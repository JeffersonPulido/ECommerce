import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import moment from "moment";
import {
    Chip,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    OutlinedInput,
    Select,
    Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { ShopLayout } from "@/components/layouts";
import { IPayments } from "@/interfaces";
import { currency } from "@/utils";
import { shopApi } from "@/axiosApi";
import { Save } from "@mui/icons-material";
import useSWR from "swr";

const MySales = () => {
    const { data, error } = useSWR<IPayments[]>("/api/orders/sell");
    const [productList, setProductList] = useState<IPayments[]>([]);
    const [guideNumberText, setGuideNumberText] = useState("");

    useEffect(() => {
        if (data) {
            setProductList(data);
        }
    }, [data]);

    if (!data && !error) return <></>;

    const onUpdateField = async (
        productId: string,
        newValue: boolean | string,
        fieldToUpdate: "shippingStatus" | "transportationName" | "guideNumber"
    ) => {
        const previusProduct = productList.map((product) => ({ ...product }));
        const updatedProduct = productList.map((product) => ({
            ...product,
            [fieldToUpdate]:
                productId === product._id ? newValue : product[fieldToUpdate],
        }));
        setProductList(updatedProduct);
        try {
            const requestBody = {
                productId,
                [fieldToUpdate]: newValue,
            };
            await shopApi.put("/orders/sell/", requestBody);
        } catch (error) {
            setProductList(previusProduct);
            if (fieldToUpdate === "shippingStatus") {
                alert("No se pudo actualizar el estado de envío");
            } else if (fieldToUpdate === "transportationName") {
                alert(
                    "No se pudo actualizar la empresa transportadora de envío"
                );
            }
        }
    };

    const columns: GridColDef[] = [
        { field: "title", headerName: "Nombre", width: 300 },
        { field: "quantity", headerName: "Cantidad", width: 100 },
        { field: "price", headerName: "Precio de venta", width: 150 },
        { field: "comission", headerName: "Comision", width: 150 },
        { field: "money", headerName: "Ganancia Neta", width: 150 },
        { field: "date", headerName: "Fecha venta", width: 210 },
        {
            field: "shippingStatus",
            headerName: "Estado de envio",
            width: 200,
            renderCell: ({ row }: GridRenderCellParams) => {
                return (
                    <Select
                        value={row.shippingStatus}
                        label="Estado de envio"
                        disabled={row.status !== "En tramite"}
                        sx={{ width: "100%" }}
                        onChange={({ target }) =>
                            onUpdateField(
                                row.id,
                                target.value,
                                "shippingStatus"
                            )
                        }
                    >
                        <MenuItem value="true">Enviado</MenuItem>
                        <MenuItem value="false">Pendiente</MenuItem>
                    </Select>
                );
            },
        },
        {
            field: "transportationName",
            headerName: "Transportadora",
            width: 200,
            renderCell: ({ row }: GridRenderCellParams) => {
                return (
                    <Select
                        value={row.transportationName}
                        label="Transportadora"
                        sx={{ width: "100%" }}
                        disabled={!row.shippingStatus}
                        onChange={({ target }) =>
                            onUpdateField(
                                row.id,
                                target.value,
                                "transportationName"
                            )
                        }
                    >
                        <MenuItem value="Servientrega">Servientrega</MenuItem>
                        <MenuItem value="Interrapidisimo">
                            Interrapidisimo
                        </MenuItem>
                        <MenuItem value="Envia">Envia</MenuItem>
                    </Select>
                );
            },
        },
        {
            field: "guideNumber",
            headerName: "N° de Guia",
            width: 250,
            renderCell: ({ row }: GridRenderCellParams) => {
                return (
                    <OutlinedInput
                        disabled={!row.transportationName}
                        value={
                            row.guideNumber ? row.guideNumber : guideNumberText
                        }
                        type="text"
                        onChange={(e) => {
                            setGuideNumberText(e.target.value);
                        }}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    disabled={!row.transportationName}
                                    onClick={(e) =>
                                        onUpdateField(
                                            row.id,
                                            guideNumberText,
                                            "guideNumber"
                                        )
                                    }
                                    edge="end"
                                >
                                    {!row.guideNumber ? <Save /> : <></>}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="guideNumber"
                    />
                );
            },
        },
        {
            field: "status",
            headerName: "Estado de pago",
            width: 150,
            renderCell: ({ row }: GridRenderCellParams) => {
                return row.status === "Consignado" ? (
                    <Chip
                        color="success"
                        label="Consignado"
                        variant="outlined"
                    />
                ) : row.status === "Pendiente" ? (
                    <Chip color="error" label="Pendiente" variant="outlined" />
                ) : (
                    <Chip
                        color="warning"
                        label="En tramite"
                        variant="outlined"
                    />
                );
            },
        },
    ];

    const rows = productList!.map((product) => ({
        id: product._id,
        title: product.item,
        quantity: product.quantityBuy,
        price: currency.format(product.total),
        comission: currency.format(product.comission),
        money: currency.format(product.total - product.comission),
        date: moment(product.createdAt).format("DD / MMM / YYYY, h:mm:ss a"),
        shippingStatus: product.shippingStatus,
        transportationName: product.transportationName,
        guideNumber: product.guideNumber,
        status: product.status,
    }));

    return (
        <ShopLayout
            title={`Mis ventas (${productList.length})`}
            pageDescription={"Pagina de ventas realizadas por el usuario"}
        >
            <Typography
                variant="h1"
                component="h1"
            >{`Mis Ventas (${productList.length})`}</Typography>
            <Grid container className="fadeIn" sx={{ mt: 2 }}>
                <Grid item xs={12} sx={{ height: 650, width: "100%" }}>
                    <DataGrid rows={rows} columns={columns} />
                </Grid>
            </Grid>
        </ShopLayout>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session: any = await getSession({ req });
    if (!session) {
        return {
            redirect: {
                destination: "/auth/login?p=/product/managment/mySales",
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
};

export default MySales;
