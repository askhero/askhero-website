import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const user = await login(email, password);
      navigate(user.role === "AGENT" ? "/agent" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <form onSubmit={submit} className="card w-full max-w-md space-y-4 p-5">
        <p className="label">AskHero Deal Room</p>
        <h1 className="font-display text-4xl">Sign in</h1>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="BUYER">Buyer</option>
          <option value="AGENT">Agent</option>
        </select>
        <button className="btn w-full">Login</button>
        <button type="button" className="btn-ghost w-full" onClick={() => navigate("/onboard")}>Create account</button>
        {error && <p className="text-sm text-red-300">{error}</p>}
      </form>
    </main>
  );
}
