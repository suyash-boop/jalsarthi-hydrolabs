import Groq from "groq-sdk";
import { calculateDistance } from "./tanker-allocation";

// --- Types ---

export interface VillageData {
  id: string;
  villageCode: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  population: number;
  stressScore: number;
  rainfallDeviation: number;
  groundwaterLevel: number;
  tankerDemand: number;
  hasActiveDispatch: boolean;
}

export interface TankerData {
  id: string;
  registrationNo: string;
  driverName: string;
  capacity: number;
  depotLocation: string;
  depotLat: number;
  depotLng: number;
}

export interface WaterSourceData {
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  currentLevel: number;
  district: string;
}

export interface AIAssignment {
  tankerId: string;
  tankerReg: string;
  villageId: string;
  villageName: string;
  priority: "low" | "medium" | "high" | "urgent";
  reasoning: string;
  estimatedDistance: number;
}

export interface AIPlan {
  summary: string;
  assignments: AIAssignment[];
}

// --- Prompt Builder ---

export function buildOptimizerPrompt(
  villages: VillageData[],
  tankers: TankerData[],
  waterSources: WaterSourceData[]
): { system: string; user: string } {
  const system = `You are an expert water resource dispatch optimizer for Maharashtra's drought response system (JalSarthi).

Your job: Given a list of water-stressed villages and available tankers, produce an OPTIMAL dispatch plan that minimizes total travel distance while prioritizing the most critical villages.

Rules:
- Each tanker can be assigned to exactly ONE village.
- Prioritize villages with higher stress scores (>75 = critical, 50-75 = warning).
- Among critical villages, prioritize those with larger populations.
- Prefer assigning tankers that are geographically closer to the target village.
- Do NOT assign tankers to villages that already have active dispatches.
- Only assign available tankers from the provided list.
- Set priority: "urgent" for stress > 75, "high" for > 60, "medium" for > 40, "low" otherwise.

You MUST respond with ONLY valid JSON matching this exact structure:
{
  "summary": "Brief strategy explanation (2-3 sentences)",
  "assignments": [
    {
      "tankerId": "exact tanker id from the list",
      "tankerReg": "registration number",
      "villageId": "exact villageCode from the list",
      "villageName": "village name",
      "priority": "urgent|high|medium|low",
      "reasoning": "Why this tanker for this village (1 sentence)",
      "estimatedDistance": <number in km>
    }
  ]
}

If no assignments are possible (no available tankers or no unserved critical villages), return:
{ "summary": "No assignments possible - ...", "assignments": [] }`;

  const villageTable = villages
    .map(
      (v) =>
        `- ${v.name} (${v.district}) | Code: ${v.villageCode} | Stress: ${v.stressScore} | Pop: ${v.population} | Demand: ${v.tankerDemand} trips/wk | Lat: ${v.lat}, Lng: ${v.lng} | Has dispatch: ${v.hasActiveDispatch}`
    )
    .join("\n");

  const tankerTable = tankers
    .map(
      (t) =>
        `- ${t.registrationNo} | ID: ${t.id} | Capacity: ${t.capacity}L | Depot: ${t.depotLocation} (${t.depotLat}, ${t.depotLng}) | Driver: ${t.driverName}`
    )
    .join("\n");

  const sourceTable =
    waterSources.length > 0
      ? waterSources
          .map(
            (s) =>
              `- ${s.name} (${s.district}) | Capacity: ${s.capacity}ML | Level: ${s.currentLevel}% | Lat: ${s.lat}, Lng: ${s.lng}`
          )
          .join("\n")
      : "None available";

  const user = `Current Situation:
- ${villages.length} villages with stress score >= 50
- ${villages.filter((v) => v.stressScore > 75).length} in CRITICAL state (>75)
- ${villages.filter((v) => !v.hasActiveDispatch).length} without active dispatches
- ${tankers.length} tankers available for dispatch

VILLAGES:
${villageTable}

AVAILABLE TANKERS:
${tankerTable}

WATER SOURCES:
${sourceTable}

Generate the optimal dispatch plan.`;

  return { system, user };
}

// --- Groq Call ---

export async function callOpenAI(
  system: string,
  user: string
): Promise<AIPlan> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }

  const groq = new Groq({ apiKey });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.2,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from Groq");
  }

  const parsed = JSON.parse(content) as AIPlan;

  if (!parsed.summary || !Array.isArray(parsed.assignments)) {
    throw new Error("Invalid response structure from Groq");
  }

  return parsed;
}

// --- Validation ---

export function validatePlan(
  plan: AIPlan,
  villages: VillageData[],
  tankers: TankerData[]
): AIPlan {
  const tankerMap = new Map(tankers.map((t) => [t.id, t]));
  const villageMap = new Map(villages.map((v) => [v.villageCode, v]));
  const usedTankers = new Set<string>();
  const usedVillages = new Set<string>();

  const validAssignments = plan.assignments.filter((a) => {
    const tanker = tankerMap.get(a.tankerId);
    const village = villageMap.get(a.villageId);

    if (!tanker || !village) return false;
    if (village.hasActiveDispatch) return false;
    if (usedTankers.has(a.tankerId)) return false;
    if (usedVillages.has(a.villageId)) return false;

    usedTankers.add(a.tankerId);
    usedVillages.add(a.villageId);

    // Recalculate actual distance
    a.estimatedDistance =
      Math.round(
        calculateDistance(tanker.depotLat, tanker.depotLng, village.lat, village.lng) * 10
      ) / 10;

    // Ensure valid priority
    const validPriorities = ["low", "medium", "high", "urgent"];
    if (!validPriorities.includes(a.priority)) {
      a.priority = village.stressScore > 75 ? "urgent" : village.stressScore > 60 ? "high" : "medium";
    }

    return true;
  });

  return {
    summary: plan.summary,
    assignments: validAssignments,
  };
}
