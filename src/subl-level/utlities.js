import { API } from "../App";

export async function fetchSubLevelInfo(subLevelId) {
    try {
        const response = await fetch(
            API + "/api/profile/sub-level/" + subLevelId,
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

        return { data: responseBody.inquiredSubLevel };

    } catch (error) {
        console.log(error);
        return {}
    }
}

export async function toggleRecording(stream, recorder, chuncks, subLevelId) {
    let message = null;
    let evalData = null;

    try {
        if (!stream.current) {
            stream.current = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
        }
        if (!recorder.current) {
            recorder.current = new MediaRecorder(stream.current);
        }
        if (recorder.current.state === 'inactive') {
            recorder.current.start();
            chuncks.current = [];
            recorder.current.ondataavailable = (event => {
                chuncks.current.push(event.data);
            });
        } else {
            recorder.current.stop()
            await new Promise((resolve) => {
                recorder.current.onstop = resolve;
            });
            const recordingBlob = new Blob(
                chuncks.current,
                {
                    type: 'audio/webm'
                })
            const response = await fetch(API + '/api/profile/practice/send-audio' + `?subLevelId=${subLevelId}`,
                {
                    method: "POST",
                    credentials: "include",
                    body: recordingBlob,
                    headers: {
                        'Content-Type': 'audio/webm'
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
                } else if (message === "you must speak english") {
                    return { transferReason: 'you must speak english' }
                } else if (message === "you must buy more coins") {
                    return { transferReason: 'you must buy more coins' }
                }
                return {};
            }
            if (response.ok) {
                const responseBody = await response.json();
                // responseBody contains { result: { transcript, evaluation, speakingTime }, increaseHappened, userFinishedApp }
                message = responseBody.result?.transcript;
                evalData = responseBody;
            }


        }
    } catch (error) {
        console.log(error);
        return {}

    }
    return { message, evalData };
}

export async function getAiResponse(message,subLevelId) {
    let result = null;
    try {
        const response =await fetch(`${API}/api/profile/practice/ai-response?subLevelId=${subLevelId}`, {
                method: "POST",
                credentials: 'include',
                headers: { 'Content-Type': 'text/plain' },
                body: message
            })
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
        result = responseBody;
    }
    catch (e) {
        console.log(e);
    }
    return { data: result };
}

export async function getPreviousConvirsation(subLevelId, before) {
    try {
        const beforeQuery = before === undefined ? '' : '&before=' + before;
        const response = await fetch(API+'/api/profile/sublevel/get-messages?subLevel=' + subLevelId + beforeQuery,
            {
                method: "GET",
                credentials: 'include',
            });
        if (!response.ok) {
            if (response.status === 401) {
                return { transferReason: 'must login first' }
            }
            const { message } = await response.json()
            if (message === "must evaluat the user level first") {
                return { transferReason: 'must evaluat the user level first' }
            }
            if (response.status === 404 && message === 'no previous messages') {
                return { messages: [] };
            }
            return {};
        } 
        const responseBody = await response.json();
        return {
            messages: responseBody.messages,
            nextBefore: responseBody.nextBefore,
            hasMore: responseBody.hasMore
        };
    } catch (error) {
        console.log(error.message)
        return {}
    }
}
