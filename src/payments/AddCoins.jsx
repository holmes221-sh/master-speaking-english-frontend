import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BuyCoins } from "./utilties";

export function AddCoins() {
    const MIN_COINS = 100;
    const MAX_COINS = 5000;
    const COIN_STEP = 100;
    const PRICE_PER_COIN = 0.01;
    const [generalErrorValue, setGeneralErrorValue] = useState(null);
    const [coinAmount, setCoinAmount] = useState(MIN_COINS);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const price = coinAmount * PRICE_PER_COIN;
    const progress =
        ((coinAmount - MIN_COINS) / (MAX_COINS - MIN_COINS)) * 100;
    const navigate = useNavigate();
    function handleSliderChange(e) {
        setCoinAmount(Number(e.target.value));
    }
    const handleAuthRedirect = (transferReason) => {
        if (transferReason === 'must evaluat the user level first') {
            navigate('/auth/test');
            return true;
        }
        if (transferReason === 'must login first') {
            navigate("/auth/login");
            return true;
        }
        return false;
    };
    async function handlePurchase() {
        setIsPurchasing(true);
        const result = await BuyCoins(coinAmount);

        if (!result.data) {
            setIsPurchasing(false);
            if (handleAuthRedirect(result?.transferReason)) {
                return;
            }
            setGeneralErrorValue("Something went wrong. Try again later.");
            return;
        }

        // Redirect user to Paymob Hosted Checkout
        if (result.data.checkoutUrl) {
            window.location.href = result.data.checkoutUrl;
        } else {
            setIsPurchasing(false);
            setGeneralErrorValue("Unable to initialize checkout.");
        }
    }
    if (generalErrorValue) {
        return <h1>{generalErrorValue}</h1>
    }
    return (
        <div className="add-coins-page">
            <div className="add-coins-container">
                <div className="add-coins-header">
                    <h1>Add Coins</h1>
                    <p>
                        Choose how many coins you want to add to your account.
                    </p>
                </div>

                <div className="coins-card">

                    <div className="coins-display">
                        <span className="coins-display-label">
                            Coins
                        </span>

                        <div className="coins-display-value">
                            <span className="coin-icon">🪙</span>
                            <span>{coinAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Slider */}
                    <div className="slider-section">

                        <div className="slider-labels">
                            <span>
                                {MIN_COINS.toLocaleString()}
                            </span>

                            <span>
                                {MAX_COINS.toLocaleString()}
                            </span>
                        </div>

                        <div className="slider-wrapper">

                            <div
                                className="slider-progress"
                                style={{
                                    height: `${progress}%`
                                }}
                            />

                            <input
                                type="range"
                                min={MIN_COINS}
                                max={MAX_COINS}
                                step={COIN_STEP}
                                value={coinAmount}
                                onChange={handleSliderChange}
                                className="coins-slider"
                                style={{
                                    "--slider-progress": `${progress}%`
                                }}
                                aria-label="Number of coins"
                            />

                        </div>

                        <p className="slider-help">
                            Drag the slider to choose your coin amount.
                        </p>

                    </div>
                    <div className="purchase-summary">
                        <div className="summary-row">
                            <span>Coins</span>
                            <strong>
                                {coinAmount.toLocaleString()}
                            </strong>
                        </div>

                        <div className="summary-row">
                            <span>Price</span>
                            <strong>
                                ${price.toFixed(2)}
                            </strong>
                        </div>

                    </div>

                    {/* Purchase button */}
                    <button
                        type="button"
                        className="purchase-button"
                        onClick={handlePurchase}
                        disabled={isPurchasing}
                    >
                        {isPurchasing
                            ? "Processing..."
                            : `Purchase ${coinAmount.toLocaleString()} Coins`
                        }
                    </button>

                </div>

                <div className="coins-info">
                    <span className="info-icon">ⓘ</span>

                    <p>
                        Coins can be used to access additional speaking
                        practice and other features in the application.
                    </p>
                </div>

            </div>

        </div>
    );
}