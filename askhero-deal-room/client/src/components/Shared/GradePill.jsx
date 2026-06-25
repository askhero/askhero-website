export default function GradePill({ grade = "B", label = "Grade" }) {
  const tone = grade.includes("A") ? "bg-green-950 text-success" : grade.includes("B") ? "bg-yellow-950 text-gold-light" : "bg-red-950 text-red-300";
  return (
    <span title={`${label}: ${grade}`} className={`inline-flex rounded-full px-2 py-1 text-xs ${tone}`}>
      {label}: {grade}
    </span>
  );
}
