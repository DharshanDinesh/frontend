import axios from "axios";

export const helperApi = async (params) => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/${params}`);
    return response.data;
};
export const updateObjectInArray = (
    array,
    matchKey,
    matchValue,
    updateKey,
    newValue
) => {
    return array.map((obj) => {
        if (obj[matchKey] === matchValue) {
            return {
                ...obj,
                [updateKey]: newValue,
            };
        }
        return obj;
    });
};

export const calculateTotal = (array) => {
    const adavance_amount = array.find(item => item.apiKey === "adavance_amount")?.value
    const balance_amount = array.find(item => item.apiKey === "balance_amount")?.value
    const extra_amount = array.find(item => item.apiKey === "extra_amount")?.value
    return adavance_amount + balance_amount + extra_amount
}

export const calculateTotalForGST = (array) => {
    const gst_amount = array.find(item => item.apiKey === "gst_amount")?.value
    const tds_amount = array.find(item => item.apiKey === "tds_amount")?.value
    const tcs_amount = array.find(item => item.apiKey === "tcs_amount")?.value
    return tcs_amount + tds_amount + gst_amount
}

