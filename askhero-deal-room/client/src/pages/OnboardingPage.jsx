import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function OnboardingPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ role: "BUYER", targetMarkets: [] });
  const markets = ["Charlotte", "Raleigh", "Atlanta", "Nashville"];

  function update(key, value) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function finish() {
    const user = await register({
      email: form.email,
      password: form.password,
      name: form.name,
      role: form.role,
      phone: form.phone,
      preQualLimit: Number(form.preQualLimit || 0),
      preQualRate: 6.5
    });
    navigate(user.role === "AGENT" ? "/agent" : "/dashboard");
  }

  return (
    <main className="min-h-screen bg-bg-primary p-4">
      <div className="mx-auto max-w-2xl card p-5">
        <p className="label">Onboarding Step {step}</p>
        {step === 1 && (
          <div className="mt-4 space-y-3">
            <input className="input" placeholder="Name" onChange={(e) => update("name", e.target.value)} />
            <input className="input" placeholder="Email" type="email" onChange={(e) => update("email", e.target.value)} />
            <input className="input" placeholder="Password" type="password" onChange={(e) => update("password", e.target.value)} />
            <select className="input" onChange={(e) => update("role", e.target.value)}><option value="BUYER">Buyer</option><option value="AGENT">Agent</option></select>
            <button className="btn" onClick={() => setStep(2)}>Next</button>
          </div>
        )}
        {step === 2 && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-text-muted">Blend pre-qualification can be embedded when `BLEND_API_KEY` is configured. This simple form captures launch-ready buyer inputs.</p>
            <input className="input" placeholder="Income" onChange={(e) => update("income", e.target.value)} />
            <input className="input" placeholder="Credit range" onChange={(e) => update("creditRange", e.target.value)} />
            <input className="input" placeholder="Down payment" onChange={(e) => update("downPayment", e.target.value)} />
            <input className="input" placeholder="Pre-qual limit" onChange={(e) => update("preQualLimit", e.target.value)} />
            <button className="btn" onClick={() => setStep(3)}>Next</button>
          </div>
        )}
        {step === 3 && (
          <div className="mt-4 space-y-3">
            {markets.map((market) => <label key={market} className="block"><input type="checkbox" className="mr-2" />{market}</label>)}
            <button className="btn" onClick={finish}>Finish</button>
          </div>
        )}
      </div>
    </main>
  );
}
