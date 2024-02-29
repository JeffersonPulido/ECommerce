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
    monthlyPaymentsInProcess: number;
    comissionsPaid: number;
    comissionsUnPaid: number,
    comissionsInProcess: number,
    monthlyPaymentsTotalPaid: number,
    monthlyPaymentsTotalUnPaid: number,
    monthlyPaymentsTotalInProcess: number,
}