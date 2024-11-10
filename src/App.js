// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import UserTypeSelection from './components/UserTypeSelection';
import LogIn from './components/LogIn';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyCode from './components/VerifyCode';
import SignUpAdvisor from './components/SignUpAdvisor';
import SignUpClient from './components/SignUpClient';
import SignUpPromoter from './components/SignUpPromoter';
import ClientHome from './components/ClientDashboard';
import AdvisorHome from './components/AdvisorDashboard';
import PromoterHome from './components/PromoterDashboard';
import GeneralInfo from './components/GeneralInfo';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import HowItWorks from './components/HowItWorks';
import GeneralConditions from './components/GeneralConditions';
import FAQ from './components/FAQ';
import Documents from './components/Documents';
import EditAccountClient from './components/EditAccount';
import EditAccountAdvisor from './components/EditAdvisorAccount';
import BoardPage from './pages/BoardPage';
import PaymentPage from './components/PaymentPage';
import Chatbot from './components/Chatbot';
import RiskCalculator from './components/RiskCalculator';
import FinancialProjection from './components/FinancialProjectionForm';
import ManageUserAccounts from './components/ManageUserAccounts';
import FillRequestForm from './pages/FillRequestForm';
import NotFound from './components/NotFound';


import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/user-type-selection" element={<UserTypeSelection />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup-advisor" element={<SignUpAdvisor />} />
          <Route path="/signup-client" element={<SignUpClient />} />
          <Route path="/signup-promoter" element={<SignUpPromoter />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/client-home" element={<ClientHome />} />
          <Route path="/advisor-home" element={<AdvisorHome />} />
          <Route path="/promoter-home" element={<PromoterHome />} />
          <Route path="/general-info" element={<GeneralInfo />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product-detail/:productName" element={<ProductDetail />} /> 
          <Route path="/product/:productName/how-it-works" element={<HowItWorks />} />
          <Route path="/product/:productName/general-conditions" element={<GeneralConditions />} />
          <Route path="/product/:productName/faq" element={<FAQ />} />
          <Route path="/product/:productName/documents" element={<Documents />} />
          <Route path="/edit-account-client" element={<EditAccountClient />} />
          <Route path="/edit-account-advisor" element={<EditAccountAdvisor />} />
          <Route path="/pizarra" element={<BoardPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/calculator" element={<RiskCalculator/>}/>
          <Route path="/financial-projection" element={<FinancialProjection/>}/>
          <Route path="/manage-accounts" element={<ManageUserAccounts />} />
          <Route path="/fill-request" element={<FillRequestForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
