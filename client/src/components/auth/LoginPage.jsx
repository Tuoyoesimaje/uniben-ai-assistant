import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [loginType, setLoginType] = useState(null); // null, 'student', 'staff'
  const [credentials, setCredentials] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [requiresSecurity, setRequiresSecurity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginStudent, loginStaff, loginGuest } = useAuth();
  const navigate = useNavigate();

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    if (!credentials.trim()) {
      setError('Please enter your matriculation number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await loginStudent(credentials.trim());
      navigate('/chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    if (!credentials.trim()) {
      setError('Please enter your staff ID');
      return;
    }

    if (requiresSecurity && !securityAnswer.trim()) {
      setError('Security answer is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await loginStaff(credentials.trim(), securityAnswer.trim());
      navigate('/admin');
    } catch (err) {
      if (err.message.includes('Security verification required')) {
        setRequiresSecurity(true);
        setError('Additional security verification required for system admin access');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      await loginGuest();
      navigate('/chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  const resetForm = () => {
    setLoginType(null);
    setCredentials('');
    setSecurityAnswer('');
    setRequiresSecurity(false);
    setError('');
  };

  // Custom SVG Logo Component
  const LogoIcon = () => (
    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="logo-icon">
      <g clipPath="url(#clip0_6_535)">
        <path
          clipRule="evenodd"
          d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="clip0_6_535">
          <rect fill="white" height="48" width="48" />
        </clipPath>
      </defs>
    </svg>
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 group/design-root" style={{fontFamily: 'Manrope, "Noto Sans", sans-serif'}}>
      <div className="w-full max-w-md mx-auto">
        {/* When a modal is active, make the underlying card transparent and remove its shadow
            so only the modal is visible on top of the page background. */}
        <div className={`login-card ${loginType ? 'hidden' : ''}`}>
          {/* Header */}
          <header className="flex items-center justify-center gap-3 text-center mb-6">
            <LogoIcon />
            <h2 className="text-[#111816] text-xl font-bold leading-tight tracking-[-0.015em]">
              UNIBEN AI Assistant
            </h2>
          </header>

          <h1 className="text-[#111816] tracking-tight text-3xl font-bold leading-tight text-center pb-8">
            Your Campus Companion
          </h1>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login Options */}
          {!loginType && (
            <div className="flex w-full flex-col items-stretch gap-4">
              <button
                onClick={handleGuestLogin}
                disabled={isLoading}
                className="btn-guest"
              >
                <span className="truncate">Continue as Guest</span>
              </button>

              <button
                onClick={() => setLoginType('student')}
                disabled={isLoading}
                className="btn-student"
              >
                <span className="truncate">Student Login</span>
              </button>

              <button
                onClick={() => setLoginType('staff')}
                disabled={isLoading}
                className="btn-staff"
              >
                <span className="truncate">Staff Login</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render modal as a top-level overlay so it's not nested inside the card
          This ensures the background card doesn't inherit hover/transform effects. */}
      {loginType && (
        <div className="modal-overlay">
          <div className="login-modal">
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-3xl font-bold text-slate-800 mb-6">
              Welcome Back
            </h2>

            <form onSubmit={loginType === 'student' ? handleStudentLogin : handleStaffLogin}>
              <div className="relative w-full mb-6">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  badge
                </span>
                <input
                  type="text"
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value.toUpperCase())}
                  placeholder={loginType === 'student' ? 'Matric Number' : 'Staff ID'}
                  className="input-field"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {requiresSecurity && (
                <div className="relative w-full mb-6">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    security
                  </span>
                  <input
                    type="password"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Security Answer"
                    className="input-field"
                    disabled={isLoading}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !credentials.trim()}
                className="btn-login"
              >
                {isLoading ? (
                  <span className="truncate">Signing in...</span>
                ) : (
                  <>
                    <span className="truncate">Let's Go!</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}