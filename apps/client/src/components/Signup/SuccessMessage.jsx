import './SuccessMessage.css';

const SuccessMessage = ({ userData }) => {
  return (
    <div className="success-message">
      <div className="success-icon">✓</div>
      <h2>Welcome, {userData?.firstName}!</h2>
      <p>Your account has been created successfully.</p>
      
      <div className="user-details">
        <div className="detail-row">
          <span className="detail-label">Name</span>
          <span className="detail-value">{userData?.fullName}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Email</span>
          <span className="detail-value">{userData?.email}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Account Status</span>
          <span className="detail-value status-badge">
            {userData?.accountStatus}
          </span>
        </div>
        {userData?.tier && (
          <div className="detail-row">
            <span className="detail-label">Tier</span>
            <span className="detail-value">{userData?.tier}</span>
          </div>
        )}
      </div>

      <a href="/shop" className="continue-shopping-btn">
        Start Shopping
      </a>
    </div>
  );
};

export default SuccessMessage;