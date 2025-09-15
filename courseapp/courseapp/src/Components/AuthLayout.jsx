// components/AuthLayout.jsx
export default function AuthLayout({ title, children }) {
    return (
    <div
        className="fixed inset-0 z-50 flex justify-center items-center"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 0% 20%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 100% 0%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      >
        <div className="auth-box">
          {/* Title */}
          <h2>{title}</h2>
  
          {/* Form Fields */}
          {children}
        </div>
      </div>
    );
  }