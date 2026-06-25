import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DealProvider } from "./context/DealContext";
import AgentPortalPage from "./pages/AgentPortalPage";
import BuyerDashboard from "./pages/BuyerDashboard";
import DealRoomPage from "./pages/DealRoomPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import { useAuth } from "./hooks/useAuth";

function Protected({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <DealProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboard" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<Protected><BuyerDashboard /></Protected>} />
            <Route path="/deal/:dealId" element={<Protected><DealRoomPage /></Protected>} />
            <Route path="/agent" element={<Protected><AgentPortalPage /></Protected>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </DealProvider>
    </AuthProvider>
  );
}
