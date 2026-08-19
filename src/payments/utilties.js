import { API } from "../App";

export async function BuyCoins(coins) {
    try {
        const response = await fetch(API + "/api/profile/payment/create", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ coins })
        });

        if (!response.ok) {
            if (response.status === 401) {
                return { transferReason: "must login first" };
            }

            const data = await response.json().catch(() => ({}));
            if (data.message === "must evaluat the user level first") {
                return { transferReason: "must evaluat the user level first" };
            }

            return {};
        }

        const responseBody = await response.json();
        return { data: responseBody };
    } catch (e) {
        console.error(e);
        return {};
    }
}