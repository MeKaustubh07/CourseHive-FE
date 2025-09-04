// components/AuthLayout.jsx
export default function AuthLayout({ title, children }) {
    return (
      <div className="auth">
        <div className="auth-box">
          {/* Title */}
          <h2>{title}</h2>
  
          {/* Form Fields */}
          {children}
        </div>
      </div>
    );
  }