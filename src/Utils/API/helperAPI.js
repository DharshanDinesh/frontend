import axios from "axios";

export const helperApi = async (params) => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/${params}`);
    return response.data;
};