export function InvalidToken(){
    return (
    <div className="auth-page">
        <div className="card card--wide">
            <div className="icon icon--error">✕</div>
            <h1 className="page-title">Verification Failed</h1>
            <p>The verification link you used is invalid or has expired.</p>
            <div className="message">Verification links can only be used once and expire after a certain period of time for security reasons.</div>
            <a href="/auth/resend-verification" className="btn btn--primary btn--link">Resend Verification Email</a>
            <div className="card-footer">If you continue having trouble, please contact support.</div>
        </div>
    </div>
    );
}