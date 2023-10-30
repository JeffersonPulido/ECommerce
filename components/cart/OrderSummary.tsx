import { FC, useContext } from "react";
import { CartContext } from "@/context";
import { currency } from "@/utils";
import {  Grid, Typography } from "@mui/material";

interface Props {
  dataPaid?: {
    numberOfItems: number;
    subTotal: number;
    tax: number;
    total: number;
}
}

export const OrderSummary: FC<Props> = ({ dataPaid }) => {

  const { numberOfItems, taxes, subTotal, total } = useContext(CartContext)
  
  const dataShow = dataPaid 
  ? {
    numberOfItems: dataPaid.numberOfItems,
    subTotal: dataPaid.subTotal,
    taxes: dataPaid.tax,
    total: dataPaid.total,
  } : {
    numberOfItems,
    subTotal,
    taxes,
    total,
  }

  return (
    <Grid container>
      <Grid item xs={6}>
        <Typography>N° Productos</Typography>
      </Grid>
      <Grid item xs={6} display="flex" justifyContent="end">
        <Typography>{dataShow.numberOfItems} {dataShow.numberOfItems > 1 ? 'productos' : 'producto' }</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography>SubTotal</Typography>
      </Grid>
      <Grid item xs={6} display="flex" justifyContent="end">
        <Typography>{ currency.format(dataShow.subTotal) }</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography>IVA ({Number(process.env.NEXT_PUBLIC_TAX_RATE) * 100} %)</Typography>
      </Grid>
      <Grid item xs={6} display="flex" justifyContent="end">
        <Typography>{ currency.format(dataShow.taxes) }</Typography>
      </Grid>

      <Grid item xs={6} sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Total a pagar:</Typography>
      </Grid>
      
      <Grid item xs={6} display="flex" justifyContent="end" sx={{ mt: 2 }}>
        <Typography variant="subtitle1">{ currency.format(dataShow.total) }</Typography>
      </Grid>
    </Grid>
  );
};
