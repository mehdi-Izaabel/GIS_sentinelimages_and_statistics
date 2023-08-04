import axios from "axios";
import qs from "qs";

const client_id = "d96154b9-4227-4288-acc7-e990b9b57fd6";
const client_secret = "I:8WD0*#iajX(l~|0d4Kk_~_jU9wc!/TI,HRx<QA";

const instance = axios.create({
    baseURL: "https://services.sentinel-hub.com",
});

const config = {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
};

const body = qs.stringify({
    client_id,
    client_secret,
    grant_type: "client_credentials",
});

export const accessTokenRequest = async() => {
    const response = await instance.post("/oauth/token", body, config);

    return response.data.access_token;
};