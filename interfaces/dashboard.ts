export interface DashboardSummaryResponse {
    numberOfOrders: number;
    paidOrders: number;
    numberOfAllUsers: number;
    numberOfClients: number;
    numberOfVendors: number;
    numberOfAdmins: number;
    numberOfProducts: number;
    productsWithNoStock: number;
    productsWithLowStock: number;
    totalMoneyOrdersPaid: number;
    totalMoneyOrdersUnPaid: number;
    totalMoneyOutIVA: number;
    notPaidOrders: number;
    monthlyPaymentsPaid: number;
    monthlyPaymentsUnPaid: number;
    comissionsPaid: number;
    comissionsUnPaid: number,
    monthlyPaymentsTotalPaid: number,
    monthlyPaymentsTotalUnPaid: number,
}