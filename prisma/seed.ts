import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const villageData = [
  // ── Nagpur Region (Updated with real-world census estimates) ──
  {{ villageCode: "NGP-01", name: "Nagpur Urban", district: "Nagpur", taluka: "Nagpur Urban", lat: 21.1458, lng: 79.0882, population: 2540000, groundwaterLevel: 9.8, historicalAvgRainfall: 95, stressScore: 42, rainfallDeviation: -12, tankerDemand: 5 },
  { villageCode: "NGP-02", name: "Nagpur Rural", district: "Nagpur", taluka: "Nagpur Rural", lat: 21.1000, lng: 79.0500, population: 350000, groundwaterLevel: 11.5, historicalAvgRainfall: 90, stressScore: 45, rainfallDeviation: -15, tankerDemand: 8 },
  { villageCode: "NGP-03", name: "Kamptee", district: "Nagpur", taluka: "Kamptee", lat: 21.2231, lng: 79.2004, population: 245000, groundwaterLevel: 10.2, historicalAvgRainfall: 92, stressScore: 40, rainfallDeviation: -10, tankerDemand: 4 },
  { villageCode: "NGP-04", name: "Hingna", district: "Nagpur", taluka: "Hingna", lat: 21.0631, lng: 78.9694, population: 265000, groundwaterLevel: 12.8, historicalAvgRainfall: 88, stressScore: 55, rainfallDeviation: -18, tankerDemand: 12 },
  { villageCode: "NGP-05", name: "Katol", district: "Nagpur", taluka: "Katol", lat: 21.2704, lng: 78.5915, population: 185000, groundwaterLevel: 14.5, historicalAvgRainfall: 80, stressScore: 68, rainfallDeviation: -25, tankerDemand: 20 },
  { villageCode: "NGP-06", name: "Narkhed", district: "Nagpur", taluka: "Narkhed", lat: 21.4654, lng: 78.5292, population: 165000, groundwaterLevel: 15.2, historicalAvgRainfall: 78, stressScore: 72, rainfallDeviation: -30, tankerDemand: 25 },
  { villageCode: "NGP-07", name: "Saoner", district: "Nagpur", taluka: "Saoner", lat: 21.3912, lng: 78.9168, population: 210000, groundwaterLevel: 11.8, historicalAvgRainfall: 85, stressScore: 48, rainfallDeviation: -14, tankerDemand: 9 },
  { villageCode: "NGP-08", name: "Kalmeshwar", district: "Nagpur", taluka: "Kalmeshwar", lat: 21.2330, lng: 78.9174, population: 175000, groundwaterLevel: 13.1, historicalAvgRainfall: 82, stressScore: 52, rainfallDeviation: -20, tankerDemand: 15 },
  { villageCode: "NGP-09", name: "Ramtek", district: "Nagpur", taluka: "Ramtek", lat: 21.3941, lng: 79.3283, population: 190000, groundwaterLevel: 10.5, historicalAvgRainfall: 110, stressScore: 35, rainfallDeviation: -5, tankerDemand: 0 },
  { villageCode: "NGP-10", name: "Parseoni", district: "Nagpur", taluka: "Parseoni", lat: 21.3853, lng: 79.1558, population: 155000, groundwaterLevel: 11.2, historicalAvgRainfall: 105, stressScore: 38, rainfallDeviation: -8, tankerDemand: 2 },
  { villageCode: "NGP-11", name: "Mauda", district: "Nagpur", taluka: "Mauda", lat: 21.1578, lng: 79.4820, population: 145000, groundwaterLevel: 10.8, historicalAvgRainfall: 95, stressScore: 41, rainfallDeviation: -11, tankerDemand: 5 },
  { villageCode: "NGP-12", name: "Umred", district: "Nagpur", taluka: "Umred", lat: 20.8547, lng: 79.3278, population: 180000, groundwaterLevel: 14.2, historicalAvgRainfall: 85, stressScore: 65, rainfallDeviation: -24, tankerDemand: 18 },
  { villageCode: "NGP-13", name: "Kuhi", district: "Nagpur", taluka: "Kuhi", lat: 20.9167, lng: 79.3583, population: 140000, groundwaterLevel: 13.5, historicalAvgRainfall: 88, stressScore: 58, rainfallDeviation: -21, tankerDemand: 14 },
  { villageCode: "NGP-14", name: "Bhiwapur", district: "Nagpur", taluka: "Bhiwapur", lat: 20.6125, lng: 79.5167, population: 115000, groundwaterLevel: 14.8, historicalAvgRainfall: 82, stressScore: 69, rainfallDeviation: -28, tankerDemand: 20 },

  // ── Marathwada (Drought Prone Zone - The "Winning" Demo Data) ──
  { villageCode: "v-001", name: "Latur City", district: "Latur", taluka: "Latur", lat: 18.4088, lng: 76.5604, population: 382900, groundwaterLevel: 18.5, historicalAvgRainfall: 55, stressScore: 88, rainfallDeviation: -42, tankerDemand: 45 },
  { villageCode: "v-002", name: "Beed City", district: "Beed", taluka: "Beed", lat: 18.9892, lng: 75.7600, population: 146700, groundwaterLevel: 16.2, historicalAvgRainfall: 60, stressScore: 82, rainfallDeviation: -38, tankerDemand: 38 },
  { villageCode: "v-003", name: "Dharashiv", district: "Dharashiv", taluka: "Dharashiv", lat: 18.1860, lng: 76.0440, population: 112000, groundwaterLevel: 15.8, historicalAvgRainfall: 58, stressScore: 79, rainfallDeviation: -36, tankerDemand: 32 },
  { villageCode: "v-004", name: "Jalna City", district: "Jalna", taluka: "Jalna", lat: 19.8347, lng: 75.8820, population: 285000, groundwaterLevel: 13.5, historicalAvgRainfall: 65, stressScore: 72, rainfallDeviation: -30, tankerDemand: 28 },
  { villageCode: "v-010", name: "Solapur City", district: "Solapur", taluka: "Solapur North", lat: 17.6599, lng: 75.9064, population: 951500, groundwaterLevel: 14.0, historicalAvgRainfall: 48, stressScore: 71, rainfallDeviation: -31, tankerDemand: 35 },
  { villageCode: "v-012", name: "Ahmednagar", district: "Ahmednagar", taluka: "Ahmednagar", lat: 19.0948, lng: 74.7480, population: 350800, groundwaterLevel: 11.5, historicalAvgRainfall: 52, stressScore: 62, rainfallDeviation: -24, tankerDemand: 20 },

  // ── Vidarbha Districts ──
  { villageCode: "v-113", name: "Wardha", district: "Wardha", taluka: "Wardha", lat: 20.7453, lng: 78.6022, population: 106000, groundwaterLevel: 13.2, historicalAvgRainfall: 80, stressScore: 63, rainfallDeviation: -27, tankerDemand: 20 },
  { villageCode: "v-114", name: "Chandrapur", district: "Chandrapur", taluka: "Chandrapur", lat: 19.9615, lng: 79.2961, population: 320300, groundwaterLevel: 10.8, historicalAvgRainfall: 105, stressScore: 45, rainfallDeviation: -12, tankerDemand: 6 },
  { villageCode: "v-118", name: "Amravati City", district: "Amravati", taluka: "Amravati", lat: 20.9374, lng: 77.7796, population: 647000, groundwaterLevel: 12.5, historicalAvgRainfall: 75, stressScore: 67, rainfallDeviation: -30, tankerDemand: 28 },
  { villageCode: "v-008", name: "Akola City", district: "Akola", taluka: "Akola", lat: 20.7096, lng: 77.0084, population: 425000, groundwaterLevel: 10.2, historicalAvgRainfall: 70, stressScore: 55, rainfallDeviation: -20, tankerDemand: 15 },

  // ── Coastal & High Rainfall (For Comparison) ──
  { villageCode: "v-016", name: "Ratnagiri", district: "Ratnagiri", taluka: "Ratnagiri", lat: 16.9902, lng: 73.3120, population: 76200, groundwaterLevel: 3.2, historicalAvgRainfall: 250, stressScore: 18, rainfallDeviation: 5, tankerDemand: 0 },
  { villageCode: "v-017", name: "Sindhudurg", district: "Sindhudurg", taluka: "Oras", lat: 16.3487, lng: 73.6831, population: 28500, groundwaterLevel: 2.5, historicalAvgRainfall: 280, stressScore: 12, rainfallDeviation: 8, tankerDemand: 0 }
];

// ... (Keep the rest of your waterSourceData and tankerData logic as it was)