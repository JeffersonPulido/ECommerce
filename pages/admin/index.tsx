import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { SummaryTile } from '@/components/admin'
import { AdminLayout } from '@/components/layouts'
import { AccessTimeOutlined, AccountBalanceOutlined, AdminPanelSettingsOutlined, AssignmentInd, AttachMoneyOutlined, CancelPresentationOutlined, CategoryOutlined, CreditCardOffOutlined, DashboardOutlined, GroupOutlined, PendingActionsOutlined, ProductionQuantityLimitsOutlined, ReceiptLongOutlined, SavingsOutlined } from '@mui/icons-material'
import { Grid, Typography } from '@mui/material'
import { DashboardSummaryResponse } from '@/interfaces';
import { currency } from '@/utils';

const DashboardPage = () => {

    const { data, error } = useSWR<DashboardSummaryResponse>('/api/admin/dashboard', {
        refreshInterval: 30 * 1000 // 30 seconds
    })

    const [refreshIn, setRefreshIn] = useState(30)

    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshIn(refreshIn => refreshIn > 0 ? refreshIn - 1 : 30)
        }, 1000)

        return () => clearInterval(interval)
    }, [])


    if (!error && !data) {
        return <></>
    }

    if (error) {
        console.log(error)
        return <Typography>Error al cargar informacion</Typography>
    }
    
    const {
        numberOfOrders,
        paidOrders,
        numberOfAllUsers,
        numberOfClients,
        numberOfVendors,
        numberOfAdmins,
        numberOfProducts,
        productsWithNoStock,
        productsWithLowStock,
        totalMoneyOrdersPaid,
        totalMoneyOrdersUnPaid,
        totalMoneyOutIVA,
        notPaidOrders,
    } = data!
    
    return (
        <AdminLayout
            title='Dashboard'
            subTitle='Estadisticas generales'
            icon={<DashboardOutlined />}
        >
            <Grid container spacing={2}>
                <SummaryTile title={numberOfOrders} subTitle='Ordenes totales' urlPage='/admin/orders' icon={<ReceiptLongOutlined color='secondary' sx={{ fontSize: 50 }} />} />
                <SummaryTile title={paidOrders} subTitle='Ordenes pagadas' urlPage='/admin/orders' icon={<AttachMoneyOutlined color='success' sx={{ fontSize: 50 }} />} />
                <SummaryTile title={notPaidOrders} subTitle='Ordenes pendientes' urlPage='/admin/orders' icon={<PendingActionsOutlined color='error' sx={{ fontSize: 50 }} />} />

                <SummaryTile title={numberOfAllUsers} subTitle='Usuarios totales' urlPage='/admin/users' icon={<AssignmentInd color='secondary' sx={{ fontSize: 50 }} />} />
                <SummaryTile title={numberOfClients} subTitle={`Clientes registrados - (${numberOfVendors} ${numberOfVendors > 1 ? 'Vendedores' : 'Vendedor'})`} urlPage='/admin/users' icon={<GroupOutlined color='success' sx={{ fontSize: 50 }} />} />
                <SummaryTile title={numberOfAdmins} subTitle='Administradores registrados' urlPage='/admin/users' icon={<AdminPanelSettingsOutlined sx={{ fontSize: 50, color: '#78281F' }} />} />

                <SummaryTile title={numberOfProducts} subTitle='Productos totales' urlPage='/admin/products' icon={<CategoryOutlined color='secondary' sx={{ fontSize: 50 }} />} />
                <SummaryTile title={productsWithLowStock} subTitle='Productos con bajo stock' urlPage='/admin/products' icon={<ProductionQuantityLimitsOutlined color='warning' sx={{ fontSize: 50 }} />} />
                <SummaryTile title={productsWithNoStock} subTitle='Productos sin stock' urlPage='/admin/products' icon={<CancelPresentationOutlined color='error' sx={{ fontSize: 50 }} />} />

                <SummaryTile title={currency.format(totalMoneyOutIVA)} subTitle='Dinero recaudado neto' icon={<AccountBalanceOutlined color='success' sx={{ fontSize: 50 }} />} />
                <SummaryTile title={currency.format(totalMoneyOrdersPaid)} subTitle='Dinero ordenes pagadas + IVA' icon={<SavingsOutlined color='success' sx={{ fontSize: 50 }} />} />
                <SummaryTile title={currency.format(totalMoneyOrdersUnPaid)} subTitle='Dinero ordenes sin pagar + IVA' icon={<CreditCardOffOutlined color='error' sx={{ fontSize: 50 }} />} />

                <SummaryTile title={refreshIn} subTitle='Actualizacion en: ' icon={<AccessTimeOutlined color='secondary' sx={{ fontSize: 50 }} />} />
            </Grid>
        </AdminLayout>
    )
}

export default DashboardPage