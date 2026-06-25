import AgentPortal from "../components/Agent/AgentPortal";
import { useAuth } from "../hooks/useAuth";

export default function AgentPortalPage() {
  const { role } = useAuth();
  if (role && role !== "AGENT") return <main className="p-4 text-red-300">Agent role required.</main>;
  return <AgentPortal />;
}
