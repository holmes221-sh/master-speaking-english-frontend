import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingBar } from "../components/LoadingBar";
import { fetchProfileInfo } from "../profile/utilties";
import "../style/intro-page.css";

export function Intro() {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            const result = await fetchProfileInfo();
            if (result?.profile && result?.user) {
                setLoggedIn(true);
            } else {
                setLoggedIn(false);
            }
            setChecking(false);
        }
        checkAuth();
    }, []);

    if (checking) {
        return (
            <div className="intro-page">
                <LoadingBar />
            </div>
        );
    }

    return (
        <div className="intro-page">
            <section className="intro-card">
                <div className="intro-icon">🗣️</div>
                <h1 className="intro-title">Master Speaking English</h1>
                <p className="intro-subtitle">
                    Improve your English speaking with AI-powered evaluations, interactive
                    practice, and a structured learning path tailored to your level.
                </p>

                <ul className="intro-features">
                    <li>AI-powered pronunciation feedback</li>
                    <li>Structured Main and Sub levels</li>
                    <li>Personal progress tracking</li>
                    <li>Interactive conversation practice</li>
                </ul>

                {loggedIn ? (
                    <button className="btn btn--primary" onClick={() => navigate("/profile")}>
                        Start
                    </button>
                ) : (
                    <a href="/auth/login" className="btn btn--primary">
                        Login
                    </a>
                )}
            </section>
        </div>
    );
}
