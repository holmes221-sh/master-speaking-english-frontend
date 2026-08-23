import { useEffect, useRef, useState } from "react"
import { testToggleRecording } from "./utlities";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LoadingBar } from "../components/LoadingBar";
export function Test() {
    const [recording, setRecording] = useState(false);
    const recorder = useRef(null)
    const chuncks = useRef([]);
    const stream = useRef(null)
    const bars = useRef([]);
    const audioContext = useRef(null);
    const audioSource = useRef(null);
    const analyser = useRef(null);
    const animationFrame = useRef(null);
    const [messageLoading, setMessageLoading] = useState(false);
    const [generalErrorValue, setGeneralErrorValue] = useState(null);
    const [time, setTime] = useState(300)
    const timerRef = useRef(null);
    const navigate = useNavigate();
    function displayTime(seconds) {
        return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    async function start() {
        setRecording(true);
        await startWaveform();
        const isDone = await testToggleRecording(
            stream,
            recorder,
            chuncks,
        );
        if (isDone?.reason === 'needs permetion') {
            setRecording(false);
            toast.error('You must permet the mic access.')
            return;
        }
        timerRef.current = setInterval(() => {
            setTime(prev => prev - 1);
        }, 1000);
    }
    async function startWaveform() {
        try {
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
        catch (error) {
            console.log(error)
        }
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
    useEffect(() => {
        (async () => {
            if (time === 0) {
                async function stop() {
                    setRecording(false);
                    stopWaveform();
                    setMessageLoading(true);
                    const isItDone = await testToggleRecording(
                        stream,
                        recorder,
                        chuncks
                    );
                    if (!isItDone?.state) {
                        if (isItDone?.reason === "you must speak english") {
                            toast.error("You must speak english.");
                        } else {
                            console.log(isItDone)
                            setGeneralErrorValue("Something went wrong.");
                        }
                    } else {
                        console.log('no thing went wrong')
                        navigate('/profile')
                    }

                }
                await stop();
            }
        })();
    }, [time, navigate])
    if (generalErrorValue) {
        return <h3>{generalErrorValue}</h3>;
    }
    return (<div className="test-page">
        <h1>Let's start by evaluating your current level to put you at the right level.</h1>
        <h2>Answer these questions.</h2>
        <ol>
            <li>Introduce yourself in two minutes.</li>
            <li>Talk about a difficult situation you faced.</li>
            <li>Tell me why you want to improve your speaking skills.</li>
        </ol>
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
        {messageLoading &&
            <LoadingBar small={true} />
        }
        <button
            className="sub-level-page-mic-button" disabled={messageLoading || recording}
            onClick={async () => {
                await start()
            }}>
            {recording ? <div className="recording-timer">{displayTime(time)}</div> : '🎙️'}
        </button>
    </div>)
}
