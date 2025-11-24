import dayjs from "dayjs";


export const expenseContainer = [{ key: "expense", title: "Expense Details" }];

export const expenseFileds = [
    {
        name: "Date Of Expense",
        type: "datePicker",
        value: null,
        container: "expense",
        apiKey: "expense_date",
        isRequired: true,
    },
    {
        name: "Expense for",
        type: "dropDown",
        value: null,
        container: "expense",
        apiKey: "expense_for",
        isRequired: true,
    },
    {
        name: "Expenses Explanation",
        type: "text",
        value: "",
        container: "expense",
        apiKey: "expenses_explanation",
        isRequired: true,
    },
    {
        name: "GST Transction (Expense)",
        type: "radio",
        value: true,
        container: "calculationDetails",
        apiKey: "gst_transction_expense",
        isRequired: true,
    },
    {
        name: "Inward GST Amount",
        type: "number",
        container: "calculationDetails",
        apiKey: "gst_amount_inward",
        isRequired: true,
    },
    {
        name: "Amount Debited from",
        type: "dropDown",
        value: null,
        container: "expense",
        apiKey: "amount_debited_from",
        isRequired: true,
    },
    {
        name: "Total Expense",
        type: "number",
        value: 0,
        container: "expenses",
        apiKey: "total_expense",
        isRequired: true,
        calculateTotal: true,
        rules: [{ min: 1, type: "number", message: `Expenses cannot be 0` }],
    },
];

export const fields = [
    { name: "Date of Entry", apiKey: "date_of_entry" },
    { name: "Income / Expense", apiKey: "isIncome" },
    { name: "Tenant Name", apiKey: "tenant_name" },
    { name: "Stay Name", apiKey: "stay_name" },
    { name: "Room No", apiKey: "room_no" },
    { name: "Booking Source", apiKey: "booking_from" },
    { name: "Booking Dates", apiKey: "date_of_booking" },
    { name: "GST Transaction", apiKey: "gst_transction" },
    { name: "Total Without Taxes", apiKey: "total_without_taxes" },
    { name: "Tax Slab (%)", apiKey: "tax_slab" },
    { name: "Tax Amount (GST)", apiKey: "totalTaxAmount" },
    { name: "Total With Taxes", apiKey: "totalWithTaxes" },
    { name: "Commission Percentage", apiKey: "commission_percentage" },
    { name: "Commission Amount", apiKey: "commission_amount" },
    { name: "Commission GST", apiKey: "commission_amount_gst" },
    { name: "Total Commission Amount", apiKey: "total_commission_amount" },
    { name: "TCS Amount", apiKey: "tcs_amount" },
    { name: "TDS Amount", apiKey: "tds_amount" },
    { name: "Net Profit", apiKey: "net_profit" },
    { name: "Credited Accounts", apiKey: "creditedAccounts" },
];

export const resetAccountDetails = [];
