import type { Village, WaterSource, DistrictStats } from "./types";
import { getStressLevel } from "./types";

export const villages: Village[] = [
  // Marathwada Region - historically drought prone
  {
    id: "v-001",
    name: "Latur",
    district: "Latur",
    taluka: "Latur",
    lat: 18.4088,
    lng: 76.5604,
    population: 42500,
    stressScore: 88,
    rainfallDeviation: -42,
    groundwaterLevel: 18.5,
    tankerDemand: 45,
  },
  {
    id: "v-002",
    name: "Beed",
    district: "Beed",
    taluka: "Beed",
    lat: 18.9892,
    lng: 75.76,
    population: 35200,
    stressScore: 82,
    rainfallDeviation: -38,
    groundwaterLevel: 16.2,
    tankerDemand: 38,
  },
  {
    id: "v-003",
    name: "Osmanabad (Dharashiv)",
    district: "Dharashiv",
    taluka: "Dharashiv",
    lat: 18.186,
    lng: 76.044,
    population: 28700,
    stressScore: 79,
    rainfallDeviation: -36,
    groundwaterLevel: 15.8,
    tankerDemand: 32,
  },
  {
    id: "v-004",
    name: "Jalna",
    district: "Jalna",
    taluka: "Jalna",
    lat: 19.8347,
    lng: 75.882,
    population: 31800,
    stressScore: 72,
    rainfallDeviation: -30,
    groundwaterLevel: 13.5,
    tankerDemand: 28,
  },
  {
    id: "v-005",
    name: "Parbhani",
    district: "Parbhani",
    taluka: "Parbhani",
    lat: 19.261,
    lng: 76.7748,
    population: 26400,
    stressScore: 76,
    rainfallDeviation: -33,
    groundwaterLevel: 14.1,
    tankerDemand: 30,
  },
  // Vidarbha Region
  {
    id: "v-006",
    name: "Yavatmal",
    district: "Yavatmal",
    taluka: "Yavatmal",
    lat: 20.3888,
    lng: 78.1204,
    population: 22100,
    stressScore: 68,
    rainfallDeviation: -28,
    groundwaterLevel: 12.4,
    tankerDemand: 22,
  },
  {
    id: "v-007",
    name: "Washim",
    district: "Washim",
    taluka: "Washim",
    lat: 20.1119,
    lng: 77.1332,
    population: 18500,
    stressScore: 64,
    rainfallDeviation: -25,
    groundwaterLevel: 11.8,
    tankerDemand: 18,
  },
  {
    id: "v-008",
    name: "Akola",
    district: "Akola",
    taluka: "Akola",
    lat: 20.7096,
    lng: 77.0084,
    population: 41200,
    stressScore: 55,
    rainfallDeviation: -20,
    groundwaterLevel: 10.2,
    tankerDemand: 15,
  },
  // Western Maharashtra
  {
    id: "v-009",
    name: "Sangli",
    district: "Sangli",
    taluka: "Miraj",
    lat: 16.8524,
    lng: 74.5815,
    population: 38900,
    stressScore: 48,
    rainfallDeviation: -15,
    groundwaterLevel: 8.5,
    tankerDemand: 10,
  },
  {
    id: "v-010",
    name: "Solapur",
    district: "Solapur",
    taluka: "Solapur North",
    lat: 17.6599,
    lng: 75.9064,
    population: 52300,
    stressScore: 71,
    rainfallDeviation: -31,
    groundwaterLevel: 14.0,
    tankerDemand: 35,
  },
  {
    id: "v-011",
    name: "Satara",
    district: "Satara",
    taluka: "Satara",
    lat: 17.6805,
    lng: 74.0183,
    population: 29600,
    stressScore: 35,
    rainfallDeviation: -10,
    groundwaterLevel: 6.2,
    tankerDemand: 5,
  },
  {
    id: "v-012",
    name: "Ahmednagar",
    district: "Ahmednagar",
    taluka: "Ahmednagar",
    lat: 19.0948,
    lng: 74.748,
    population: 44800,
    stressScore: 62,
    rainfallDeviation: -24,
    groundwaterLevel: 11.5,
    tankerDemand: 20,
  },
  // North Maharashtra
  {
    id: "v-013",
    name: "Nandurbar",
    district: "Nandurbar",
    taluka: "Nandurbar",
    lat: 21.3691,
    lng: 74.2405,
    population: 16200,
    stressScore: 42,
    rainfallDeviation: -12,
    groundwaterLevel: 7.8,
    tankerDemand: 8,
  },
  {
    id: "v-014",
    name: "Dhule",
    district: "Dhule",
    taluka: "Dhule",
    lat: 20.9042,
    lng: 74.7749,
    population: 25100,
    stressScore: 51,
    rainfallDeviation: -18,
    groundwaterLevel: 9.5,
    tankerDemand: 12,
  },
  {
    id: "v-015",
    name: "Jalgaon",
    district: "Jalgaon",
    taluka: "Jalgaon",
    lat: 21.0077,
    lng: 75.5626,
    population: 38600,
    stressScore: 45,
    rainfallDeviation: -14,
    groundwaterLevel: 8.0,
    tankerDemand: 9,
  },
  // Konkan (better water availability - for contrast)
  {
    id: "v-016",
    name: "Ratnagiri",
    district: "Ratnagiri",
    taluka: "Ratnagiri",
    lat: 16.9902,
    lng: 73.312,
    population: 21800,
    stressScore: 18,
    rainfallDeviation: 5,
    groundwaterLevel: 3.2,
    tankerDemand: 0,
  },
  {
    id: "v-017",
    name: "Sindhudurg",
    district: "Sindhudurg",
    taluka: "Oras",
    lat: 16.3487,
    lng: 73.6831,
    population: 14500,
    stressScore: 12,
    rainfallDeviation: 8,
    groundwaterLevel: 2.5,
    tankerDemand: 0,
  },
  {
    id: "v-018",
    name: "Hingoli",
    district: "Hingoli",
    taluka: "Hingoli",
    lat: 19.722,
    lng: 77.15,
    population: 19300,
    stressScore: 58,
    rainfallDeviation: -22,
    groundwaterLevel: 10.8,
    tankerDemand: 14,
  },
];

export const waterSources: WaterSource[] = [
  {
    id: "ws-001",
    name: "Jayakwadi Dam",
    type: "dam",
    lat: 19.5104,
    lng: 75.3507,
    capacity: 2909,
    currentLevel: 32,
    district: "Chhatrapati Sambhajinagar",
  },
  {
    id: "ws-002",
    name: "Ujjani Dam",
    type: "dam",
    lat: 18.05,
    lng: 75.1167,
    capacity: 3320,
    currentLevel: 45,
    district: "Solapur",
  },
  {
    id: "ws-003",
    name: "Koyna Dam",
    type: "dam",
    lat: 17.4,
    lng: 73.75,
    capacity: 2797,
    currentLevel: 68,
    district: "Satara",
  },
  {
    id: "ws-004",
    name: "Manjara Dam",
    type: "dam",
    lat: 18.5167,
    lng: 76.5333,
    capacity: 509,
    currentLevel: 18,
    district: "Latur",
  },
  {
    id: "ws-005",
    name: "Girna Dam",
    type: "dam",
    lat: 20.55,
    lng: 74.7333,
    capacity: 609,
    currentLevel: 52,
    district: "Jalgaon",
  },
];

export function computeDistrictStats(villageData: Village[]): DistrictStats[] {
  const districtMap = new Map<string, Village[]>();
  for (const v of villageData) {
    const existing = districtMap.get(v.district) || [];
    existing.push(v);
    districtMap.set(v.district, existing);
  }

  return Array.from(districtMap.entries())
    .map(([name, vils]) => ({
      name,
      totalVillages: vils.length,
      criticalCount: vils.filter(
        (v) => getStressLevel(v.stressScore) === "critical"
      ).length,
      warningCount: vils.filter(
        (v) => getStressLevel(v.stressScore) === "warning"
      ).length,
      safeCount: vils.filter((v) => getStressLevel(v.stressScore) === "safe")
        .length,
      avgStressScore: Math.round(
        vils.reduce((sum, v) => sum + v.stressScore, 0) / vils.length
      ),
      totalTankerDemand: vils.reduce((sum, v) => sum + v.tankerDemand, 0),
    }))
    .sort((a, b) => b.avgStressScore - a.avgStressScore);
}

export function computeOverallStats(villageData: Village[]) {
  return {
    totalVillages: villageData.length,
    criticalCount: villageData.filter(
      (v) => getStressLevel(v.stressScore) === "critical"
    ).length,
    warningCount: villageData.filter(
      (v) => getStressLevel(v.stressScore) === "warning"
    ).length,
    safeCount: villageData.filter(
      (v) => getStressLevel(v.stressScore) === "safe"
    ).length,
    totalTankerDemand: villageData.reduce((sum, v) => sum + v.tankerDemand, 0),
    avgStressScore: Math.round(
      villageData.reduce((sum, v) => sum + v.stressScore, 0) /
        villageData.length
    ),
  };
}
