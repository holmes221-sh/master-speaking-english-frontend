import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSubLevelInfo, getAiResponse, getPreviousConvirsation, toggleRecording } from "./utlities";
import { fetchProfileInfo } from "../profile/utilties";
import { useCallback } from "react";
import userImage from "../assets/user.jpg";
import robotImage from "../assets/rebot.webp";
import { FeedBack } from "../components/Feedback";
import { LoadingBar } from "../components/LoadingBar";
import toast from "react-hot-toast";
export function SubLevel({ setShowToast }) {
    const navigate = useNavigate()
    const [levelValue, setLevelValue] = useState({});
    const { subLevelId } = useParams();
    const [profileAndUserValue, setProfileAndUserValue] = useState({});
    const [generalErrorValue, setGeneralErrorValue] = useState(null);
    const [loadingValue, setLoadingValue] = useState(true);
    const [messageLoading, setMessageLoading] = useState(false);
    const stream = useRef(null);
    const recorder = useRef(null);
    const chuncks = useRef([]);
    const audioContext = useRef(null);
    const audioSource = useRef(null);
    const analyser = useRef(null);
    const animationFrame = useRef(null);
    const bars = useRef([]);
    const [recording, setRecording] = useState(false);
    const [messsages, setMessages] = useState([]);
    const forStoping = useRef(false);
    const [feedback, setFeedBack] = useState(null)
    const conversationBody = useRef(null);
    const nextBefore = useRef(0);
    const hasMoreMessages = useRef(false);
    const historyLoading = useRef(false);
    const initialHistoryLoaded = useRef(false);
    const initialViewportFilled = useRef(false);
    const pendingPrepend = useRef(null);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const loadOlderMessages = useCallback(async (fillingViewport = false) => {
        if (historyLoading.current || !hasMoreMessages.current) return;

        historyLoading.current = true;
        const body = conversationBody.current;
        pendingPrepend.current = {
            scrollHeight: body?.scrollHeight || 0,
            scrollTop: body?.scrollTop || 0,
            fillingViewport
        };
        const previousMessages = await getPreviousConvirsation(subLevelId, nextBefore.current);
        historyLoading.current = false;

        if (previousMessages.transferReason) {
            if (previousMessages.transferReason === 'must evaluat the user level first') {
                navigate('/auth/test');
            } else if (previousMessages.transferReason === 'must login first') {
                navigate('/auth/login');
            }
            return;
        }
        if (!previousMessages.messages) {
            pendingPrepend.current = null;
            setGeneralErrorValue("Something went wrong. Try again later.");
            return;
        }
        nextBefore.current = previousMessages.nextBefore;
        hasMoreMessages.current = previousMessages.hasMore;
        setMessages(prev => [...previousMessages.messages, ...prev]);
    }, [subLevelId, navigate]);
    const loadData = useCallback(async () => {
        const levelInfo = await fetchSubLevelInfo(subLevelId);
        const userFile = await fetchProfileInfo();

        if (userFile.transferReason) {
            if (userFile.transferReason === 'must evaluat the user level first') {
                navigate('/auth/test');
            } else if (userFile.transferReason === 'must login first') {
                navigate("/auth/login");
            }
            return;
        }
        if (levelInfo.transferReason) {
            if (levelInfo.transferReason === 'must evaluat the user level first') {
                navigate('/auth/test');
            } else if (levelInfo.transferReason === 'must login first') {
                navigate("/auth/login");
            }
            return;
        }
        if (!levelInfo.data || !userFile.profile) {
            setGeneralErrorValue(
                "Something went wrong. Try again later."
            );
            return;
        }
        setLevelValue(levelInfo.data);
        setProfileAndUserValue({
            profile: userFile.profile,
            user: userFile.user
        });
        setLoadingValue(false);
    }, [subLevelId, navigate]);
    useEffect(() => {
        async function start() {
            initialHistoryLoaded.current = false;
            initialViewportFilled.current = false;
            hasMoreMessages.current = false;
            nextBefore.current = 0;
            pendingPrepend.current = null;
            setHistoryLoaded(false);
            setMessages([]);
            setLoadingValue(true);
            await loadData();
        }
        start()
    }, [loadData, subLevelId]);

    useEffect(() => {
        if (loadingValue || initialHistoryLoaded.current) return;

        async function loadInitialMessages() {
            historyLoading.current = true;
            const previousMessages = await getPreviousConvirsation(subLevelId);
            historyLoading.current = false;

            if (previousMessages.transferReason) {
                if (previousMessages.transferReason === 'must evaluat the user level first') {
                    navigate('/auth/test');
                } else if (previousMessages.transferReason === 'must login first') {
                    navigate('/auth/login');
                }
                return;
            }
            if (!previousMessages.messages) {
                setGeneralErrorValue("Something went wrong. Try again later.");
                return;
            }
            nextBefore.current = previousMessages.nextBefore;
            hasMoreMessages.current = previousMessages.hasMore;
            initialHistoryLoaded.current = true;
            setMessages(previousMessages.messages);
            setHistoryLoaded(true);
        }

        loadInitialMessages();
    }, [loadingValue, subLevelId, navigate]);

    useLayoutEffect(() => {
        const body = conversationBody.current;
        const prepend = pendingPrepend.current;
        if (!body || !prepend) return;

        if (prepend.fillingViewport) {
            body.scrollTop = body.scrollHeight;
        } else {
            body.scrollTop = prepend.scrollTop + (body.scrollHeight - prepend.scrollHeight);
        }
        pendingPrepend.current = null;
    }, [messsages]);

    useEffect(() => {
        if (!historyLoaded) return;

        const frame = requestAnimationFrame(() => {
            const body = conversationBody.current;
            if (body && body.scrollHeight <= body.clientHeight && hasMoreMessages.current) {
                loadOlderMessages(true);
            } else if (body && !initialViewportFilled.current) {
                body.scrollTop = body.scrollHeight;
                initialViewportFilled.current = true;
            }
        });
        return () => cancelAnimationFrame(frame);
    }, [historyLoaded, messsages, loadOlderMessages]);

    async function startWaveform() {
        if (!stream.current) {
            stream.current =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });
        }
        if (!audioContext.current) {
            audioContext.current =
                new AudioContext();
        }
        if (!audioSource.current) {
            audioSource.current =
                audioContext.current
                    .createMediaStreamSource(
                        stream.current
                    );
        }
        analyser.current =
            audioContext.current.createAnalyser();
        analyser.current.fftSize = 64;
        audioSource.current.connect(
            analyser.current
        );
        const dataArray =
            new Uint8Array(
                analyser.current.frequencyBinCount
            );
        function animate() {
            if (!analyser.current) return;
            analyser.current.getByteFrequencyData(
                dataArray
            );
            const volume =
                dataArray.reduce(
                    (a, b) => a + b,
                    0
                )
                /
                dataArray.length;
            bars.current.forEach((bar, index) => {
                if (!bar) return;
                const variation =
                    Math.sin(
                        Date.now() / 150 + index
                    ) * 10;

                const height =
                    Math.max(
                        8,
                        volume / 2 + variation
                    );
                bar.style.height =
                    `${height}px`;
            });
            animationFrame.current =
                requestAnimationFrame(
                    animate
                );
        }
        animate();
    }
    function stopWaveform() {
        cancelAnimationFrame(
            animationFrame.current
        );
        if (audioContext.current) {
            audioContext.current.close();
            audioContext.current = null;
        }
        audioSource.current = null;
        analyser.current = null;
        bars.current.forEach(bar => {
            if (bar) {
                bar.style.height = "8px";
            }
        });
    }
    if (loadingValue) {
        return (
            <div className="loading-screen">
                <LoadingBar />
            </div>
        );
    }
    if (generalErrorValue) {
        return <h3>{generalErrorValue}</h3>;
    }

    return (
        <>
            {feedback && <FeedBack onClose={(e) => {
                e.preventDefault();
                setFeedBack(null);
            }}>
                {feedback.feedback}
            </FeedBack>}
            <div className="sub-level-page">
                <header className="sub-level-header">
                    <div className="sub-level-header-column">
                        <div className="bot-name">
                            <img className="message-image" src={robotImage}></img>
                            Botty, your english teacher.
                            He will help you finish sub-level number {levelValue?.number}
                        </div>
                        <div className="progress-text">
                            Your progress so far in the current level.
                        </div>
                        <div className="progress-bar">
                            <div
                                className="filled-progress"
                                style={{
                                    width:
                                        `${profileAndUserValue?.profile.currentSubLevelId === subLevelId ? profileAndUserValue?.profile?.currentSubLevelProgress * 100 : 100}%`
                                }}
                            />
                        </div>
                    </div>
                </header>
                <main
                    className="sub-level-body"
                    ref={conversationBody}
                    onScroll={(event) => {
                        if (event.currentTarget.scrollTop === 0) {
                            loadOlderMessages();
                        }
                    }}
                >
                    {messsages.map((message, index) => {
                        if (message.role === 'user') {
                            return (<div className="message-flex" key={index}>
                                <div className="message-box-user">
                                    <div className="user-message">
                                        {message.message}
                                    </div>
                                    <img className="message-image" src={userImage}></img>
                                </div>
                                <button className="feedback-button" onClick={() => {
                                    setFeedBack({ feedback: message.feedBack })
                                }}> show feedback</button>
                            </div>);
                        } else {
                            return (<div className="message-box-bot" key={index}
                            >   <img className="message-image" src={robotImage}></img>
                                <div
                                    className="bot-message"
                                >
                                    {message.message}
                                </div>
                            </div>)
                        }
                    }
                    )}
                    {messageLoading &&
                        <LoadingBar small={true} />
                    }
                </main>
                <footer className="sub-level-footer">
                    {recording &&
                        <div className="voice-wave">
                            {
                                Array.from({ length: 10 })
                                    .map((_, index) => (
                                        <span
                                            key={index}
                                            ref={(element) =>
                                                bars.current[index] = element
                                            }
                                        />
                                    ))
                            }
                        </div>
                    }
                    <button
                        className="sub-level-page-mic-button"
                        disabled={messageLoading}
                        onClick={async () => {
                            // START RECORDING
                            if (!forStoping.current) {
                                forStoping.current = true;
                                setRecording(true);
                                await startWaveform();
                                const funState = await toggleRecording(
                                    stream,
                                    recorder,
                                    chuncks,
                                    subLevelId,
                                );
                                if (funState.transferReason) {
                                    if (funState.transferReason === 'must evaluat the user level first') {
                                        navigate('/auth/test');
                                    } else if (funState.transferReason === 'must login first') {
                                        navigate("/auth/login");
                                    }
                                    return;
                                }
                                return;
                            }

                            // STOP RECORDING
                            forStoping.current = false;
                            setRecording(false);
                            stopWaveform();
                            setMessageLoading(true);
                            const returnedData =
                                await toggleRecording(
                                    stream,
                                    recorder,
                                    chuncks,
                                    subLevelId,
                                );
                            if (returnedData.transferReason) {
                                if (returnedData.transferReason === 'must evaluat the user level first') {
                                    navigate('/auth/test');
                                } else if (returnedData.transferReason === 'must login first') {
                                    navigate("/auth/login");
                                } else if (returnedData.transferReason === 'you must buy more coins') {
                                    navigate("/add-coins");
                                } else if (returnedData.transferReason === 'you must speak english') {
                                    toast.error('No english detected!')
                                    setMessageLoading(false)
                                }
                                return;
                            }
                            if (!returnedData.message) {
                                setMessageLoading(false);
                                setGeneralErrorValue(
                                    "Something went wrong. Try again later."
                                );
                                return;
                            }
                            console.log(returnedData);
                            setMessages(
                                prev => [
                                    ...prev,
                                    {
                                        role: 'user',
                                        message: returnedData.message,
                                        feedBack: returnedData.evalData.result.evaluation.feedback,
                                    }
                                ]
                            );
                            console.log( returnedData.evalData.result.evaluation.feedback)
                            const aiResponse =
                                await getAiResponse(
                                    returnedData.message,
                                    subLevelId
                                );
                            if (aiResponse.transferReason) {
                                if (aiResponse.transferReason === 'must evaluat the user level first') {
                                    navigate('/auth/test');
                                } else if (aiResponse.transferReason === 'must login first') {
                                    navigate("/auth/login");
                                }
                                return;
                            }
                            if (!aiResponse.data) {
                                setMessageLoading(false);
                                setGeneralErrorValue(
                                    "Something went wrong. Try again later."
                                );
                                return;
                            }
                            setMessages(
                                prev => [
                                    ...prev,
                                    {
                                        role: 'agent',
                                        message: aiResponse.data.reply
                                    }
                                ]
                            );

                            if (returnedData.evalData.userFinishedApp) {
                                navigate('/finished-app')
                            }
                            else if (returnedData.evalData.userFinishedCurrentMainLevel) {
                                setShowToast({ congart: true, toast: `🏆 Congratulations! You completed this level! Your English has grown stronger. Get ready for the next stage of your journey!`, failure: false })
                                navigate('/profile')
                            }
                            else if (returnedData.evalData.userFinishedCurrentSubLevel) {
                                setShowToast({ congart: true, toast: `🎉 Great job! You completed this sub-level. Keep practicing and you're one step closer to mastering English!`, failure: false })
                                navigate('/profile')
                            }
                            else {
                                await loadData()
                                setMessageLoading(false);
                            }

                        }}
                    >
                        🎙️
                    </button>
                </footer>
            </div>
        </>
    );
}
