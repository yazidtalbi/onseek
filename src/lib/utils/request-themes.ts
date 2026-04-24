export function getRequestTheme(category?: string) {
  const c = (category || "").toLowerCase();

  // High-fidelity light themes
  if (c.includes("tech") || c.includes("digital"))
    return { bg: "bg-blue-50/80", text: "text-blue-900", fill: "fill-blue-600" };

  if (c.includes("grocery") || c.includes("food") || c.includes("health"))
    return { bg: "bg-emerald-50/80", text: "text-emerald-900", fill: "fill-emerald-600" };

  if (c.includes("fashion") || c.includes("beauty") || c.includes("artisanat"))
    return { bg: "bg-purple-50/80", text: "text-purple-900", fill: "fill-purple-600" };

  if (c.includes("family") || c.includes("pets"))
    return { bg: "bg-pink-50/80", text: "text-pink-900", fill: "fill-pink-600" };

  if (c.includes("home") || c.includes("property"))
    return { bg: "bg-orange-50/80", text: "text-orange-900", fill: "fill-orange-600" };

  if (c.includes("gaming") || c.includes("entertainment") || c.includes("culture"))
    return { bg: "bg-indigo-50/80", text: "text-indigo-900", fill: "fill-indigo-600" };

  if (c.includes("automotive") || c.includes("sports"))
    return { bg: "bg-slate-100/80", text: "text-slate-900", fill: "fill-slate-600" };

  if (c.includes("travel") || c.includes("experiences"))
    return { bg: "bg-teal-50/80", text: "text-teal-900", fill: "fill-teal-600" };

  if (c.includes("finance") || c.includes("learning") || c.includes("services"))
    return { bg: "bg-cyan-50/80", text: "text-cyan-900", fill: "fill-cyan-600" };

  // Default Onseek Slate
  return { bg: "bg-[#f5f6f9]", text: "text-[#1A1A1A]", fill: "fill-[#7755FF]" };
}
