import { useState } from 'react';
import EmailSignup from './EmailSignup';
import AccountSetup from './AccountSetup';
import SuccessMessage from './SuccessMessage';
import './SignupFlow.css';

const SignupFlow = () => {
  const [step, setStep] = useState('signup');
  const [signupData, setSignupData] = useState(null);
  const [activationToken, setActivationToken] = useState(null);

  const handleSignupSuccess = (data, token) => {
    setSignupData(data);
    setActivationToken(token);
    setStep('setup');
  };

  const handleSetupComplete = (data) => {
    setSignupData(data);
    setStep('success');
  };

  return (
    <div className="signup-container">
      <div className="signup-header">
        <div className="logo">SHOP</div>
        <h1>Create your account</h1>
      </div>

      {step === 'signup' && (
        <EmailSignup onSuccess={handleSignupSuccess} />
      )}

      {step === 'setup' && (
        <AccountSetup
          email={signupData?.email}
          token={activationToken}
          onComplete={handleSetupComplete}
        />
      )}

      {step === 'success' && (
        <SuccessMessage userData={signupData} />
      )}
    </div>
  );
};

export default SignupFlow;