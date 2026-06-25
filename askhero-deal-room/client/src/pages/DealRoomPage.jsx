import DealRoom from "../components/DealRoom/DealRoom";
import { useAuth } from "../hooks/useAuth";

export default function DealRoomPage() {
  const { role } = useAuth();
  if (role && role !== "BUYER" && role !== "AGENT") return <main className="p-4 text-red-300">Deal not found or unavailable.</main>;
  return <DealRoom />;
}
