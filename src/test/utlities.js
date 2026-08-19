import { API } from "../App";
export async function testToggleRecording(stream, recorder, chuncks) {
    let done = { state: false };
    try {
        if (!stream.current) {
            stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        if (!recorder.current) {
            recorder.current = new MediaRecorder(stream.current);
        }
        if (recorder.current.state === 'inactive') {
            recorder.current.start();
            chuncks.current = [];
            recorder.current.ondataavailable = (event) => {
                chuncks.current.push(event.data);
            };
            done.state = true;
            return done;
        } else {
            recorder.current.stop();
            await new Promise((resolve) => {
                recorder.current.onstop = resolve;
            });
            const recordingBlob = new Blob(chuncks.current, { type: 'audio/webm' });
            const response = await fetch(API + '/api/profile/test/send-audio', {
                method: "POST",
                credentials: "include",
                body: recordingBlob,
                headers: { 'Content-Type': 'audio/webm' }
            });
            if (!response.ok) {
                done.state=false;
                if (response.status === 401) {
                    document.location.assign("/auth/login");
                    return done;
                }
                let responseBody = {};
                    responseBody = await response.json();
                    if (!responseBody) {
                        return done;
                    }
                if (responseBody?.message === "you must speak english") {
                    done.reason = 'you must speak english';
                } else {
                    done.reason = 'server error';
                }
                done.state=false;
                return done;
            }
            done.state = true;
            return done;
        }
    } catch (error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError' || error.code === 0) {
            done.reason = 'needs permetion';
        } else {
            done.reason = 'network error';
        }
        done.state = false;
        return done;
    }
}