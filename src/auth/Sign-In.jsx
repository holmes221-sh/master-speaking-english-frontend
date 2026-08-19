import { API } from "../App";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingBar } from "../components/LoadingBar";
export function SignIn() {
    const navigate = useNavigate();
    const emailInput = useRef();
    const passwordInput = useRef();
    const [emailErrorValue, setEmailError] = useState('')
    const [passwordErrorValue, setPasswordError] = useState('')
    const [generalErrorValue, setGeneralError] = useState('')
    const [loading, setLoading] = useState(false);
    async function login() {
        try {
            setLoading(true);
            const response = await fetch(API + '/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: emailInput.current.value,
                    password: passwordInput.current.value,
                })
            });
            if (!response.ok) {
                const responseBody = await response.json();
                if (responseBody.message) {
                    if (responseBody.errorField === "password") {
                        setPasswordError(responseBody.message);
                    } else if (responseBody.errorField === "email") {
                        setEmailError(responseBody.message);
                    }else if(responseBody.message==="must evaluat the user level first"){
                        navigate('/auth/test')
                    }
                     else {
                        setGeneralError(responseBody.message);
                    }
                } else {
                    setGeneralError("Something went wrong");
                }
                return;
            }
            navigate('/profile')
        } catch (e) {
            setGeneralError(e.message);
        } finally {
            setLoading(false)
        };
    };
    function googleLogin() {
        document.location.assign(API + '/auth/google');

    }
    return (
        <>
            {loading&&<LoadingBar />}
            <div className="auth-page">
                <div className="card">
                    <h1 className="page-title">Welcome Back</h1>
                    <p className="subtitle">
                        Sign in with your email to continue.
                    </p>
                    <div className="general-error">{generalErrorValue}</div>
                    <div className="form">
                        <input
                            ref={emailInput}
                            type="email"
                            className="input"
                            placeholder="Enter your email address" />
                        <p className="field-error">{emailErrorValue}</p>
                        <input
                            ref={passwordInput}
                            type="password"
                            className="input"
                            placeholder="Enter your password" />
                        <p className="field-error">{passwordErrorValue}</p>
                        <button
                            onClick={googleLogin}
                            className="btn btn--outline">
                            Sign in with Google
                        </button>
                        <a href="/auth/register" className="link">
                            Don't have an account?
                        </a>
                    </div>
                    <button
                        onClick={async () => {
                            await login()
                        }}
                        className="btn btn--primary btn--submit">
                        Sign In
                    </button>
                </div>
            </div>
        </>
    )
}