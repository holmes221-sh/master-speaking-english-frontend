import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function PaymentCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const isSuccess = searchParams.get("success") === "true";
    const isPending = searchParams.get("pending") === "true";

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/profile');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="callback-container">
            {isSuccess && !isPending ? (
                <div>
                    <h1>Payment Successful! 🪙</h1>
                    <p>Your coins are being added to your account. Redirecting to profile...</p>
                </div>
            ) : (
                <div>
                    <h1>Payment Failed or Pending</h1>
                    <p>We could not complete your transaction. Redirecting...</p>
                </div>
            )}
        </div>
    );
}