import dayjs from "dayjs";

export const filedContainers = [
    { key: "bookingInfo", title: "Booking Details", id: "bookingDetails" },
    { key: "income", title: "Income Details", id: "amountDetails" },
    { key: "accountInfo", title: "Account Details", id: "accountDetails" },
    {
        key: "calculation",
        title: "Calculation Details",
        id: "calculationDetails",
    },
];

export const incomeFields = {
    bookingDetails: [
        {
            name: "Date of Entry",
            type: "datePicker",
            // value: null,
            container: "bookingDetails",
            apiKey: "date_of_entry",
            isRequired: true,
            order: 2,

        },
        {
            name: "Tenant Name",
            type: "text",
            // value: null,
            container: "bookingDetails",
            apiKey: "tenant_name",
            isRequired: true,
            order: 5,

        },
        {
            name: "Stay Name",
            type: "dropDown",
            // value: null,
            container: "bookingDetails",
            // options: [],
            apiKey: "stay_name",
            isRequired: true,
            order: 6,

        },
        {
            name: "Date Of Booking",
            type: "dateRangePicker",
            // value: [],
            container: "bookingDetails",
            apiKey: "date_of_booking",
            isRequired: true,
            order: 7
        },
        {
            name: "Booking From",
            type: "dropDown",
            // value: null,
            container: "bookingDetails",
            options: [],
            apiKey: "booking_from",
            isRequired: true,
            order: 8
        },
        {
            name: "Room No",
            type: "dropDown",
            // value: "",
            container: "bookingDetails",
            apiKey: "room_no",
            // options: [],
            isRequired: true,
            order: 9
        },
    ],
    amountDetails: [
        {
            name: "Adavance Amount",
            type: "number",
            value: 0,
            container: "amountDetails",
            apiKey: "adavance_amount",
            isRequired: true,
            order: 10
        },
        {
            name: "Balance Amount",
            type: "number",
            value: 0,
            container: "amountDetails",
            apiKey: "balance_amount",
            isRequired: true,
            order: 11
        },
        {
            name: "Extra Amount",
            type: "number",
            value: 0,
            container: "amountDetails",
            apiKey: "extra_amount",
            isRequired: true,
            order: 12
        },
        {
            name: "Extra Amount Detail",
            type: "text",
            value: "",
            container: "amountDetails",
            apiKey: "extra_amount_detail",
            order: 13
        },
        {
            name: "Total Income Amount",
            type: "text",
            value: 0,
            container: "amountDetails",
            apiKey: "total_amount",
            disabled: true,
            isDisabledPermanently: true,
            order: 14
        },
    ],
    accountDetails: [
        {
            name: "Amount Received in Cash",
            type: "number",
            value: 0,
            container: "accountDetails",
            apiKey: "cash_received",
            isRequired: false,
            order: 15
        },
        {
            name: "Amount Received in Gpay",
            type: "number",
            value: 0,
            container: "accountDetails",
            apiKey: "amount_received_in_gpay",
            isRequired: false,
            order: 16
        },
        {
            name: "Amount Received in Account",
            type: "number",
            value: 0,
            container: "accountDetails",
            apiKey: "amount_received_in_account",
            isRequired: false,
            order: 17
        },
        {
            name: "Amount Credited to",
            type: "multidropDown",
            value: null,
            container: "accountDetails",
            apiKey: "amount_credited_to",
            isRequired: true,
            order: 18
        },

        {
            name: "Currency Received",
            type: "dropDown",
            container: "accountDetails",
            options: [],
            value: null,
            apiKey: "currency_received",
            isRequired: true,
            order: 19
        },
    ],
    calculationDetails: [
        {
            name: "GST Transction",
            type: "radio",
            value: true,
            container: "calculationDetails",
            apiKey: "gst_transction",
            isRequired: true,
            order: 20
        },
        {
            name: "Broker Commission",
            type: "number",
            value: 0,
            container: "calculationDetails",
            apiKey: "broker_commission",
            isRequired: true,
            order: 21
        },
        {
            name: "GST Amount",
            type: "number",
            value: 0,
            container: "calculationDetails",
            apiKey: "gst_amount",
            isRequired: true,
            order: 22
        },
        {
            name: "TDS Amount",
            type: "number",
            value: 0,
            container: "calculationDetails",
            apiKey: "tds_amount",
            isRequired: true,
            order: 23
        },
        {
            name: "TCS Amount",
            type: "number",
            value: 0,
            container: "calculationDetails",
            apiKey: "tcs_amount",
            isRequired: true,
            order: 24
        },
        {
            name: "Income After tax",
            type: "text",
            value: 0,
            disabled: true,
            container: "calculationDetails",
            apiKey: "final_amount",
            isDisabledPermanently: true,
            order: 25
        },
    ],
};

export const expenseContainer = [{ key: "expense", title: "Expense Details" }];
export const expenseFileds = [
    {
        name: "Date Of Expense",
        type: "datePicker",
        value: null,
        container: "expense",
        apiKey: "expense_date",
        isRequired: true,
        order: 3
    },
    {
        name: "Expense for",
        type: "dropDown",
        value: null,
        container: "expense",
        apiKey: "expense_for",
        isRequired: true,
        order: 4
    },

    {
        name: "Expenses Explanation",
        type: "text",
        value: "",
        container: "expense",
        apiKey: "expenses_explanation",
        isRequired: true,
        order: 26

    },
    {
        name: "GST Transction (Expense)",
        type: "radio",
        value: true,
        container: "calculationDetails",
        apiKey: "gst_transction_expense",
        isRequired: true,
        order: 27
    },
    {
        name: "Inward GST Amount",
        type: "number",
        container: "calculationDetails",
        apiKey: "gst_amount_inward",
        isRequired: true,
        order: 28
    },

    {
        name: "Amount Debited from",
        type: "dropDown",
        value: null,
        container: "expense",
        apiKey: "amount_debited_from",
        isRequired: true,
        order: 29
    },
    {
        name: "Total Expense",
        type: "number",
        value: 0,
        container: "expenses",
        apiKey: "total_expense",
        isRequired: true,
        order: 30,
        rules: [{ min: 1, type: "number", message: `Expenses cannot be 0` }],
    },
];
export const fields = [
    {
        name: "Type",
        apiKey: "isIncome",
        order: 1,
    },
    ...incomeFields.bookingDetails,
    ...incomeFields.amountDetails,
    ...incomeFields.accountDetails,
    ...incomeFields.calculationDetails,
    ...expenseFileds,
    {
        name: "Profit / Loss Amount",
        apiKey: "profit_loss",
        order: 31,
    },
];

export const resetAccountDetails = [];
