import dayjs from "dayjs";

export const stayNames = [
    { label: "Benny Stay", value: "bennyStay" },
    { label: "Albert Stay", value: "AlbertStay" },
];
export const bookingOptions = [
    { label: "Walk In", value: "walkin" },
    { label: "Online", value: "Online" },
];
export const filedContainers = [
    { key: "bookingInfo", title: "Booking Details" },
    { key: "income", title: "Income Details" },
    { key: "expense", title: "Expense Details" },
    { key: "accountInfo", title: "Account Details" },
    { key: "calculation", title: "Calculation Details" },
];
export const fields = [
    {
        "name": "Tenant Name",
        "type": "text",
        "value": "",
        "container": "bookingInfo",
        "apikey": "Tenant_Name",
        order: 2

    },
    {
        "name": "Income From (Stay Name)",
        "type": "dropDown",
        "value": "",
        "container": "bookingInfo",
        "options": stayNames,
        "apikey": "Income_From_(Stay_Name)",
        order: 3
    },
    {
        "name": "Date Of Booking",
        "type": "datePicker",
        value: dayjs(),
        "container": "bookingInfo",
        "apikey": "Date_Of_Booking",
        order: 1
    },
    {
        "name": "Booking From",
        "type": "dropDown",
        "value": "",
        "container": "bookingInfo",
        "options": bookingOptions,
        "apikey": "Booking_From",
        order: 4
    },
    {
        "name": "Room No",
        "type": "text",
        "value": "",
        "container": "bookingInfo",
        "apikey": "Room_No",
        order: 5
    },
    {
        "name": "Share Percentage",
        "type": "text",
        "value": null,
        "convertToNumber": true,
        "container": "bookingInfo",
        "apikey": "Share_Percentage",
        order: 18
    },
    {
        "name": "Adavance Amount",
        "type": "text",
        "convertToNumber": true,
        "value": null,
        "container": "income",
        "apikey": "Adavance_Amount",
        order: 6
    },
    {
        "name": "Balance Amount",
        "type": "text",
        "convertToNumber": true,
        "value": null,
        "container": "income",
        "apikey": "Balance_Amount",
        order: 7
    },
    {
        "name": "Extra Amount",
        "type": "text",
        "convertToNumber": true,
        "value": null,
        "container": "income",
        "apikey": "Extra_Amount",
        order: 8
    },
    {
        "name": "Extra Amount Detail",
        "type": "text",
        "value": "",
        "container": "income",
        "apikey": "Extra_Amount_Detail",
        order: 9
    },
    {
        "name": "Expenses",
        "type": "text",
        "convertToNumber": true,
        "value": null,
        "container": "expense",
        "apikey": "Expenses",
        order: 10
    },
    {
        "name": "Expenses Explanation",
        "type": "text",
        "value": "",
        "container": "expense",
        "apikey": "Expenses_Explanation",
        order: 11
    },
    {
        "name": "Amount Debited from",
        "type": "dropDown",
        "value": "",
        "container": "accountInfo",
        "apikey": "Amount_Debited_from"
        ,
        order: 13
    },
    {
        "name": "Debited Amount",
        "type": "text",
        "convertToNumber": true,
        "value": null,
        "container": "accountInfo",
        "apikey": "Debited_Amount",
        order: 12
    },
    {
        "name": "Amount Credited to",
        "type": "dropDown",
        "value": "",
        "container": "accountInfo",
        "apikey": "Amount_Credited_to",
        order: 14
    },
    {
        "name": "Credited Amount",
        "type": "text",
        "convertToNumber": true,
        "value": null,
        "container": "accountInfo",
        "apikey": "Credited_Amount",
        order: 13

    },
    {
        "name": "Amount Received As (Rs / Euro)",
        "type": "dropDown",
        "value": null,
        "container": "calculation",
        "options": [],
        "apikey": "Amount_Received_As_(Rs_/_Euro)",
        order: 15
    },
    {
        "name": "Is GST Included",
        "type": "radio",
        "value": true,
        "container": "calculation",
        "apikey": "Is_GST_Included",
        order: 16
    },
    {
        "name": "GST Percentage",
        "type": "text",
        "convertToNumber": true,
        "value": null,
        "container": "calculation",
        "apikey": "GST_Percentage",
        order: 17
    },
    {
        "name": "Final Amount",
        "type": "text",
        "convertToNumber": true,
        "readOnly": true,
        "value": 0,
        "disabled": true,
        "container": "calculation",
        "apikey": "Final_Amount",
        order: 19
    }
]