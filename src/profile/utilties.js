import { API } from "../App";

export async function fetchMainLevels() {
    try {
        const response = await fetch(
            API + "/api/profile/main-levels",
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        if (!response.ok) {
            if (response.status === 401) {
                return { transferReason: 'must login first' }
            }
            const { message } = await response.json()
            if (message === "must evaluat the user level first") {
                return { transferReason: 'must evaluat the user level first' }
            }
            return {};
        }
        const responseBody = await response.json();
        return { data: responseBody.mainLevels }
    } catch (error) {
        console.log(error);
        return {}
    }
}



export async function fetchSublevels(pageNumber, mainLevelId) {
    try {
        const response = await fetch(
            `${API}/api/profile/sub-levels?page=${pageNumber}&mainLevelId=${mainLevelId}`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        if (!response.ok) {
            if (response.status === 401) {
                return { transferReason: 'must login first' }
            }
            const { message } = await response.json()
            if (message === "must evaluat the user level first") {
                return { transferReason: 'must evaluat the user level first' }
            }
            return {};
        }


        const responseBody = await response.json();


        return {
            subLevels: responseBody.subLevels,
            hasMore: responseBody.hasMore
        };


    } catch (error) {
        console.log(error);
        return {};
    }
}
export async function fetchProfileInfo() {
    try {
        const response = await fetch(API + '/api/profile', {
            method: "GET",
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            if (response.status === 401) {
                return { transferReason: 'must login first' }
            }
            const { message } = await response.json()
            if (message === "must evaluat the user level first") {
                return { transferReason: 'must evaluat the user level first' }
            }
            return {};
        }
        const { profile, user } = await response.json();
        return { profile, user };
    } catch (error) {
        console.log(error)
        return {}
    }

}
export async function fetchLastEvaluation() {
    try {
        const response = await fetch(API + '/api/profile/last-evaluation', {
            method: "GET",
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            if (response.status === 401) {
                return { transferReason: 'must login first' }
            }
            const { message } = await response.json()
            if (message === "must evaluat the user level first") {
                return { transferReason: 'must evaluat the user level first' }
            }
            return {};
        }
        const { lastEvaluation } = await response.json();
        return {data:lastEvaluation};
    } catch (error) {
        console.log(error)
        return{}
    }
}
export async function logout() {
    try {
        const response = await fetch(API + '/api/auth/logout', {
            method: "POST",
            credentials: 'include',
        });
        if (!response.ok) {
            if (response.status === 401) {
                return 'logedout already'
            }
            return 'something went wrong'
        } else {
            return 'done'
        }
    } catch (error) {
        console.log(error)
        return 'something went wrong'

    }
}