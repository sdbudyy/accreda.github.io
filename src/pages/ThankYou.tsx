import { useNavigate } from "react-router-dom";

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Thank you for your purchase!</h1>
      <p className="mb-2">Your subscription has been upgraded successfully.</p>
      <button
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-semibold text-lg shadow hover:bg-blue-700 transition-colors"
        onClick={() => navigate("/dashboard")}
      >
        Continue to Dashboard
      </button>
    </div>
  );
} 