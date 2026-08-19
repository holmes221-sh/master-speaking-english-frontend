import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../App";
import { LoadingBar } from "../components/LoadingBar";
export function SignUp() {
    const navigate = useNavigate();
    const usernameInput = useRef();
    const emailInput = useRef();
    const passwordInput = useRef();
    const [usernameErrorValue, setUsernameError] = useState('');
    const [emailErrorValue, setEmailError] = useState('')
    const [passwordErrorValue, setPasswordError] = useState('')
    const [generalErrorValue, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);
    async function register() {
        try {
            setLoading(true);
            const response = await fetch(API + '/auth/register', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: usernameInput.current.value,
                    email: emailInput.current.value,
                    password: passwordInput.current.value,
                })
            });
            if (!response.ok) {
                const responseBody = await response.json();
                if (responseBody.message) {
                    if (responseBody.errorField === 'password') {
                        setPasswordError(responseBody.message);
                    }
                    else if (responseBody.errorField === 'username') {
                        setUsernameError(responseBody.message);
                    }
                    else if (responseBody.errorField === 'email') {
                        setEmailError(responseBody.message);
                    }
                    else if (responseBody.errorField === 'general') {
                        setGeneralError(responseBody.message);
                    } else if (!responseBody.errorField) {
                        setGeneralError(responseBody.message);
                    }
                } else {
                    setGeneralError('Somthing went wrong');
                }
            }
            const responseBody_1 = await response.json();
            navigate(`/auth/check-your-email?email=${responseBody_1.email}`);
        } catch (e) {
            setGeneralError(e.message);
        } finally {
            setLoading(false);
        }
    };
    function googleLogin() {
        document.location.assign(API + '/auth/google');

    }
    return (
        <>
            {loading && <LoadingBar />}
            <div className="auth-page">
                <div className="card">
                    <h1 className="page-title">Create Account</h1>
                    <p className="subtitle">
                        Sign up with your email to continue.
                    </p>
                    <div className="general-error">{generalErrorValue}</div>
                    <div className="form">
                        <input
                            type="text"
                            ref={usernameInput}
                            className="input"
                            placeholder="Enter your username" />
                        <p className="field-error">{usernameErrorValue}</p>
                        <input
                            type="email"
                            ref={emailInput}
                            className="input"
                            placeholder="Enter your email address" />
                        <p className="field-error">{emailErrorValue}</p>
                        <input
                            type="password"
                            ref={passwordInput}
                            className="input"
                            placeholder="Create a password" />
                        <p className="field-error">{passwordErrorValue}</p>
                        <button
                            className="btn btn--outline" onClick={googleLogin}>
                            Sign up with Google
                        </button>
                        <a href="/auth/login" className="link">
                            Already have an account?
                        </a>
                    </div>
                    <button
                        className="btn btn--primary btn--submit" onClick={register}>
                        Sign Up
                    </button>
                </div>
            </div>
        </>
    );
}