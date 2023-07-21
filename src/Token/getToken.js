import axios from "axios";
import qs from "qs";

const client_id = "f41c8d96-3d3a-4364-ac63-d4886ef63e04";
const client_secret = ")<]J8(*1Zyt(KcDw28qdg(6~UdUZn}USE()z<>@I";

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