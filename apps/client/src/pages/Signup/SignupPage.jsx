import { useState } from 'react';
import EmailSignup from '../../components/Signup/EmailSignup';
import AccountSetup from '../../components/Signup/AccountSetup';
import SuccessMessage from '../../components/Signup/SuccessMessage';
import { SIGNUP_STEPS } from '../../utils/constants';
import './SignupPage.css';

const SignupPage = () => {
    const [currentStep, setCurrentStep] = useState(SIGNUP_STEPS.SIGNUP);
    const [userData, setUserData] = useState(null);
    const [activationToken, setActivationToken] = useState(null);

    const handleSignupSuccess = (data, token) => {
        setUserData(data);
        setActivationToken(token);
        setCurrentStep(SIGNUP_STEPS.SETUP);
    };

    const handleSetupComplete = (data) => {
        setUserData(data);
        setCurrentStep(SIGNUP_STEPS.SUCCESS);
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <div className="signup-header">
                    <div className="signup-logo">Arbitra</div>
                    <h1>Create your account</h1>
                </div>

                {currentStep === SIGNUP_STEPS.SIGNUP && (
                    <EmailSignup onSuccess={handleSignupSuccess} />
                )}

                {currentStep === SIGNUP_STEPS.SETUP && (
                    <AccountSetup
                        email={userData?.email}
                        token={activationToken}
                        onComplete={handleSetupComplete}
                    />
                )}

                {currentStep === SIGNUP_STEPS.SUCCESS && (
                    <SuccessMessage userData={userData} />
                )}
            </div>
        </div>
    );
};

export default SignupPage;