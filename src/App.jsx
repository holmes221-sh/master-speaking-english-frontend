import { CheckYourEmailPage } from "./auth/CheckYourEmailPage";
import { InvalidToken } from "./auth/InvalidToken";
import { ResendVerification } from "./auth/ResendVerification";
import { SignIn } from "./auth/sign-in";
import { SignUp } from "./auth/Sign-Up";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Profile } from "./profile/Profile";
import { SubLevel } from "./subl-level/SubLevel";
import { useState } from "react";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Confetti from 'react-confetti';
import { Test } from "./test/Test";
import { AddCoins } from "./payments/AddCoins";
import { PaymentCallback } from "./payments/PaymentCallback";
const API = import.meta.env.VITE_API_URL;
export { API };
function App() {
  const [showToast, setShowToast] = useState(null);
  useEffect(() => {
    if (showToast) {
      if (showToast.failure) {
        toast.error(showToast.toast)
      } else {
        toast.success(showToast.toast)
      }
      setTimeout(() => setShowToast(null), 20000);
    }
  }, [showToast]);
  return (
    <>
      <Toaster position="top-center" />
      {showToast && showToast?.congrat && <Confetti />}
      <BrowserRouter>
        <Routes>
          <Route path="/auth/register" element={<SignUp />} />
          <Route path="/auth/login" element={<SignIn />} />
          <Route path="/auth/test" element={<Test/>} />
          <Route path="/auth/resend-verification" element={<ResendVerification />} />
          <Route path="/auth/check-your-email" element={<CheckYourEmailPage />} />
          <Route path="/auth/invalid-token" element={<InvalidToken />} />
          <Route path="/profile" element={<Profile setShowToast={setShowToast} />} />
          <Route path="/profile/sub-level/:subLevelId" element={<SubLevel setShowToast={setShowToast} />} />
          <Route path="/add-coins" element={<AddCoins/>}/>
          <Route path="/payment-status" element={<PaymentCallback />}/>
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App
