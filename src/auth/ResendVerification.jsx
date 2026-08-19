import { useRef } from "react";
import { API } from "../App";
import toast from "react-hot-toast";

export function ResendVerification() {
    const emailInput = useRef();

    const showToast = (message) => {
        toast(message);
    };

    function sendVerification() {
        fetch(API + '/resend-verification', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: emailInput.current.value })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(responseBody => {
                    if (responseBody.message) {
                        showToast(responseBody.message);
                        return;
                    }
                    showToast('Something went wrong. Check your internet and try again later.');
                });
            }
            showToast('If you have an account, check your email inbox to activate your account.');
        })
        .catch((e) => {
            console.log(e);
            showToast('Something went wrong. Check your internet and try again later.');
        });
    }

    return (
        <div className="auth-page">
            <div className="card card--wide">
                <div className="icon">✉️</div>
                <h1 className="page-title">Resend Verification Email</h1>
                <p>
                    Enter the email address associated with your account, and we'll send you a new verification link.
                </p>
                <div className="form">
                    <input
                        ref={emailInput}
                        type="email"
                        className="input"
                        placeholder="Email address"
                        required
                    />
                    <button className="btn btn--primary" onClick={sendVerification}>
                        Send Verification Email
                    </button>
                </div>
                <div className="card-footer">
                    If your account exists and hasn't been verified yet, you'll receive a new verification email shortly.
                </div>
            </div>
        </div>
    );
}