import { useSearchParams } from "react-router-dom";
export function CheckYourEmailPage() {
    const [searchParams]=useSearchParams();
    return (
        <div className="auth-page">
            <div className="card card--wide">
                <div className="icon">✉️</div>
                <h1 className="page-title">Check Your Email</h1>
                <p>We've sent a verification email to</p>
                <p className="email">{searchParams.get('email')}</p>
                <p>Please open the email and click the verification link to activate your account.</p>
                <div className="tip"><strong>Can't find the email?</strong><br />Check your Spam or Junk folder. It may take a minute or two to arrive.</div>
                <div className="card-footer">Once your email has been verified, you can sign in to your account.</div>
            </div>
        </div>
    );
}