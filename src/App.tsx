import { Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { AdminFunding } from "./screens/Admin/AdminFundingApplication";
import { AdminHome } from "./screens/Admin/AdminHome";
import { AdminTransactionDetails } from "./screens/Admin/TransactionDetails";
import { ApplicationDetails } from "./screens/ApplicationDetails";
import { ForgotPassword } from "./screens/ForgotPasswordPage";
import { InvestorFunding } from "./screens/Investor/InvestorFundingApplication";
import { InvestorHome } from "./screens/Investor/InvestorHome";
import { InvestorRegister } from "./screens/Investor/InvestorRegisterPage";
import { EditProfile } from "./screens/Investor/ModifyProfile";
import { InvestorProfile } from "./screens/Investor/Profile";
import { InvestorTransaction } from "./screens/Investor/Transaction";
import { LandingPage } from "./screens/LandingPage";
import { Login } from "./screens/LoginPage";
import { Register } from "./screens/RegisterPage";
import { ResetPassword } from "./screens/ResetPasswordPage";
import { ProcessingFundingPage } from "./screens/Startup/ProcessingFundingPage";
import { SelectInvestor } from "./screens/Startup/SelectInvestor";
import { StartupFunding } from "./screens/Startup/StartupFundingApplication";
import { StartupHome } from "./screens/Startup/StartupHome";
import { StartupRegister } from "./screens/Startup/StartupRegisterPage";
import { StartupSubmitFunding } from "./screens/Startup/StartupSubmitFunding";
import { SuccessSubmitFunding } from "./screens/Startup/SuccessSubmitFunding";
import { StartupTransaction } from "./screens/Startup/Transaction";
import { TransactionDetails } from "./screens/Startup/TransactionDetails";

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/startup-register" element={<StartupRegister />} />
            <Route path="/investor-register" element={<InvestorRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/password-reset/:token" element={<ResetPassword />} />

            {/* Private Routes */}
            <Route element={<PrivateRoute />}>
                <Route path="/startup-home" element={<StartupHome />} />
                <Route path="/startup-funding" element={<StartupFunding />} />
                <Route path="/submit-funding" element={<StartupSubmitFunding />} />
                <Route path="/processing-funding" element={<ProcessingFundingPage />} />
                <Route path="/select-investor" element={<SelectInvestor />} />
                <Route path="/startup-transaction" element={<StartupTransaction />} />
                <Route path="/application/:id" element={<ApplicationDetailsWrapper />} />
                <Route path="/success-submit-funding" element={<SuccessSubmitFunding />} />
                <Route path="/transaction-details" element={<TransactionDetails />} />
                <Route path="/investor-home" element={<InvestorHome />} />
                <Route path="/investor-funding" element={<InvestorFunding />} />
                <Route path="/investor-profile" element={<InvestorProfile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/investor-transaction" element={<InvestorTransaction />} />
                <Route path="/admin-home" element={<AdminHome />} />
                <Route path="/admin-funding" element={<AdminFunding />} />
                <Route path="/admin-transaction-details/:id" element={<AdminTransactionDetails />} />
            </Route>
        </Routes>
    );
}

export function ApplicationDetailsWrapper() {
    const role = localStorage.getItem("role");
    return <ApplicationDetails userRole={role as "startup" | "investor" | "admin"} />;
}

export default App;
