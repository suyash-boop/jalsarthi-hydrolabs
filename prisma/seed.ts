import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Villages (all 36 districts of Maharashtra represented) ──
const villageData = [
  // ── Nagpur Region ──
  { villageCode: "NGP-01", name: "Nagpur Urban", district: "Nagpur", taluka: "Nagpur Urban", lat: 21.1458, lng: 79.0882, population: 2540000, groundwaterLevel: 9.8, historicalAvgRainfall: 95, stressScore: 42, rainfallDeviation: -12, tankerDemand: 5 },
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

  // ── Marathwada (Drought Prone) ──
  { villageCode: "v-001", name: "Latur City", district: "Latur", taluka: "Latur", lat: 18.4088, lng: 76.5604, population: 382900, groundwaterLevel: 18.5, historicalAvgRainfall: 55, stressScore: 88, rainfallDeviation: -42, tankerDemand: 45 },
  { villageCode: "v-002", name: "Beed City", district: "Beed", taluka: "Beed", lat: 18.9892, lng: 75.7600, population: 146700, groundwaterLevel: 16.2, historicalAvgRainfall: 60, stressScore: 82, rainfallDeviation: -38, tankerDemand: 38 },
  { villageCode: "v-003", name: "Dharashiv", district: "Dharashiv", taluka: "Dharashiv", lat: 18.1860, lng: 76.0440, population: 112000, groundwaterLevel: 15.8, historicalAvgRainfall: 58, stressScore: 79, rainfallDeviation: -36, tankerDemand: 32 },
  { villageCode: "v-004", name: "Jalna City", district: "Jalna", taluka: "Jalna", lat: 19.8347, lng: 75.8820, population: 285000, groundwaterLevel: 13.5, historicalAvgRainfall: 65, stressScore: 72, rainfallDeviation: -30, tankerDemand: 28 },
  { villageCode: "v-010", name: "Solapur City", district: "Solapur", taluka: "Solapur North", lat: 17.6599, lng: 75.9064, population: 951500, groundwaterLevel: 14.0, historicalAvgRainfall: 48, stressScore: 71, rainfallDeviation: -31, tankerDemand: 35 },
  { villageCode: "v-012", name: "Ahmednagar", district: "Ahmednagar", taluka: "Ahmednagar", lat: 19.0948, lng: 74.7480, population: 350800, groundwaterLevel: 11.5, historicalAvgRainfall: 52, stressScore: 62, rainfallDeviation: -24, tankerDemand: 20 },
  { villageCode: "MRW-01", name: "Chh. Sambhajinagar", district: "Chh. Sambhajinagar", taluka: "Aurangabad", lat: 19.8762, lng: 75.3433, population: 1175000, groundwaterLevel: 14.8, historicalAvgRainfall: 60, stressScore: 74, rainfallDeviation: -32, tankerDemand: 30 },
  { villageCode: "MRW-02", name: "Nanded City", district: "Nanded", taluka: "Nanded", lat: 19.1383, lng: 77.3210, population: 550200, groundwaterLevel: 13.0, historicalAvgRainfall: 72, stressScore: 66, rainfallDeviation: -26, tankerDemand: 22 },
  { villageCode: "MRW-03", name: "Parbhani", district: "Parbhani", taluka: "Parbhani", lat: 19.2610, lng: 76.7748, population: 307000, groundwaterLevel: 15.5, historicalAvgRainfall: 68, stressScore: 76, rainfallDeviation: -34, tankerDemand: 30 },
  { villageCode: "MRW-04", name: "Hingoli", district: "Hingoli", taluka: "Hingoli", lat: 19.7173, lng: 77.1510, population: 115000, groundwaterLevel: 14.0, historicalAvgRainfall: 70, stressScore: 70, rainfallDeviation: -28, tankerDemand: 22 },
  { villageCode: "MRW-05", name: "Aundha Nagnath", district: "Hingoli", taluka: "Aundha", lat: 19.6372, lng: 77.0594, population: 45000, groundwaterLevel: 16.0, historicalAvgRainfall: 65, stressScore: 77, rainfallDeviation: -35, tankerDemand: 28 },
  { villageCode: "MRW-06", name: "Tuljapur", district: "Dharashiv", taluka: "Tuljapur", lat: 18.0079, lng: 76.0679, population: 55000, groundwaterLevel: 17.2, historicalAvgRainfall: 52, stressScore: 84, rainfallDeviation: -40, tankerDemand: 36 },
  { villageCode: "MRW-07", name: "Nilanga", district: "Latur", taluka: "Nilanga", lat: 18.1166, lng: 76.7516, population: 74000, groundwaterLevel: 17.8, historicalAvgRainfall: 50, stressScore: 86, rainfallDeviation: -44, tankerDemand: 40 },
  { villageCode: "MRW-08", name: "Ambajogai", district: "Beed", taluka: "Ambajogai", lat: 18.7340, lng: 76.3863, population: 84000, groundwaterLevel: 15.5, historicalAvgRainfall: 58, stressScore: 78, rainfallDeviation: -33, tankerDemand: 28 },
  { villageCode: "MRW-09", name: "Barshi", district: "Solapur", taluka: "Barshi", lat: 18.2310, lng: 75.6930, population: 118000, groundwaterLevel: 16.5, historicalAvgRainfall: 50, stressScore: 80, rainfallDeviation: -38, tankerDemand: 34 },

  // ── Vidarbha Districts ──
  { villageCode: "v-113", name: "Wardha", district: "Wardha", taluka: "Wardha", lat: 20.7453, lng: 78.6022, population: 106000, groundwaterLevel: 13.2, historicalAvgRainfall: 80, stressScore: 63, rainfallDeviation: -27, tankerDemand: 20 },
  { villageCode: "v-114", name: "Chandrapur", district: "Chandrapur", taluka: "Chandrapur", lat: 19.9615, lng: 79.2961, population: 320300, groundwaterLevel: 10.8, historicalAvgRainfall: 105, stressScore: 45, rainfallDeviation: -12, tankerDemand: 6 },
  { villageCode: "v-118", name: "Amravati City", district: "Amravati", taluka: "Amravati", lat: 20.9374, lng: 77.7796, population: 647000, groundwaterLevel: 12.5, historicalAvgRainfall: 75, stressScore: 67, rainfallDeviation: -30, tankerDemand: 28 },
  { villageCode: "v-008", name: "Akola City", district: "Akola", taluka: "Akola", lat: 20.7096, lng: 77.0084, population: 425000, groundwaterLevel: 10.2, historicalAvgRainfall: 70, stressScore: 55, rainfallDeviation: -20, tankerDemand: 15 },
  { villageCode: "VID-01", name: "Yavatmal", district: "Yavatmal", taluka: "Yavatmal", lat: 20.3899, lng: 78.1307, population: 164000, groundwaterLevel: 14.5, historicalAvgRainfall: 78, stressScore: 70, rainfallDeviation: -29, tankerDemand: 24 },
  { villageCode: "VID-02", name: "Buldhana", district: "Buldhana", taluka: "Buldhana", lat: 20.5294, lng: 76.1845, population: 75000, groundwaterLevel: 13.8, historicalAvgRainfall: 68, stressScore: 65, rainfallDeviation: -25, tankerDemand: 18 },
  { villageCode: "VID-03", name: "Washim", district: "Washim", taluka: "Washim", lat: 20.1120, lng: 77.1330, population: 70000, groundwaterLevel: 15.0, historicalAvgRainfall: 72, stressScore: 72, rainfallDeviation: -30, tankerDemand: 24 },
  { villageCode: "VID-04", name: "Gondia", district: "Gondia", taluka: "Gondia", lat: 21.4602, lng: 80.1920, population: 133000, groundwaterLevel: 8.5, historicalAvgRainfall: 120, stressScore: 32, rainfallDeviation: -6, tankerDemand: 0 },
  { villageCode: "VID-05", name: "Bhandara", district: "Bhandara", taluka: "Bhandara", lat: 21.1670, lng: 79.6515, population: 84000, groundwaterLevel: 9.0, historicalAvgRainfall: 115, stressScore: 34, rainfallDeviation: -7, tankerDemand: 0 },
  { villageCode: "VID-06", name: "Gadchiroli", district: "Gadchiroli", taluka: "Gadchiroli", lat: 20.1882, lng: 80.0057, population: 54000, groundwaterLevel: 7.5, historicalAvgRainfall: 140, stressScore: 25, rainfallDeviation: -3, tankerDemand: 0 },
  { villageCode: "VID-07", name: "Pandharkawda", district: "Yavatmal", taluka: "Pandharkawda", lat: 20.0197, lng: 78.5571, population: 40000, groundwaterLevel: 15.8, historicalAvgRainfall: 85, stressScore: 74, rainfallDeviation: -32, tankerDemand: 26 },

  // ── Western Maharashtra ──
  { villageCode: "WM-01", name: "Pune City", district: "Pune", taluka: "Haveli", lat: 18.5204, lng: 73.8567, population: 3124000, groundwaterLevel: 8.0, historicalAvgRainfall: 110, stressScore: 30, rainfallDeviation: -8, tankerDemand: 0 },
  { villageCode: "WM-02", name: "Baramati", district: "Pune", taluka: "Baramati", lat: 18.1530, lng: 74.5770, population: 119000, groundwaterLevel: 12.5, historicalAvgRainfall: 55, stressScore: 60, rainfallDeviation: -22, tankerDemand: 16 },
  { villageCode: "WM-03", name: "Kolhapur City", district: "Kolhapur", taluka: "Karvir", lat: 16.7050, lng: 74.2433, population: 549000, groundwaterLevel: 5.5, historicalAvgRainfall: 180, stressScore: 22, rainfallDeviation: 2, tankerDemand: 0 },
  { villageCode: "WM-04", name: "Satara City", district: "Satara", taluka: "Satara", lat: 17.6868, lng: 74.0005, population: 121000, groundwaterLevel: 9.0, historicalAvgRainfall: 85, stressScore: 40, rainfallDeviation: -12, tankerDemand: 4 },
  { villageCode: "WM-05", name: "Sangli City", district: "Sangli", taluka: "Miraj", lat: 16.8524, lng: 74.5815, population: 436600, groundwaterLevel: 10.5, historicalAvgRainfall: 60, stressScore: 52, rainfallDeviation: -18, tankerDemand: 12 },
  { villageCode: "WM-06", name: "Man", district: "Satara", taluka: "Man", lat: 17.2640, lng: 74.4950, population: 32000, groundwaterLevel: 15.0, historicalAvgRainfall: 50, stressScore: 75, rainfallDeviation: -34, tankerDemand: 26 },
  { villageCode: "WM-07", name: "Indapur", district: "Pune", taluka: "Indapur", lat: 18.1114, lng: 75.0241, population: 52000, groundwaterLevel: 14.2, historicalAvgRainfall: 48, stressScore: 72, rainfallDeviation: -30, tankerDemand: 22 },
  { villageCode: "WM-08", name: "Pandharpur", district: "Solapur", taluka: "Pandharpur", lat: 17.6788, lng: 75.3273, population: 105000, groundwaterLevel: 15.5, historicalAvgRainfall: 46, stressScore: 78, rainfallDeviation: -36, tankerDemand: 30 },

  // ── North Maharashtra ──
  { villageCode: "NM-01", name: "Nashik City", district: "Nashik", taluka: "Nashik", lat: 19.9975, lng: 73.7898, population: 1486000, groundwaterLevel: 10.0, historicalAvgRainfall: 90, stressScore: 38, rainfallDeviation: -10, tankerDemand: 3 },
  { villageCode: "NM-02", name: "Dhule City", district: "Dhule", taluka: "Dhule", lat: 20.9042, lng: 74.7749, population: 379000, groundwaterLevel: 13.0, historicalAvgRainfall: 58, stressScore: 64, rainfallDeviation: -26, tankerDemand: 20 },
  { villageCode: "NM-03", name: "Jalgaon City", district: "Jalgaon", taluka: "Jalgaon", lat: 21.0077, lng: 75.5626, population: 462000, groundwaterLevel: 11.0, historicalAvgRainfall: 65, stressScore: 56, rainfallDeviation: -20, tankerDemand: 14 },
  { villageCode: "NM-04", name: "Nandurbar", district: "Nandurbar", taluka: "Nandurbar", lat: 21.3690, lng: 74.2401, population: 100000, groundwaterLevel: 12.0, historicalAvgRainfall: 75, stressScore: 54, rainfallDeviation: -18, tankerDemand: 12 },
  { villageCode: "NM-05", name: "Malegaon", district: "Nashik", taluka: "Malegaon", lat: 20.5514, lng: 74.5241, population: 472000, groundwaterLevel: 14.0, historicalAvgRainfall: 55, stressScore: 68, rainfallDeviation: -28, tankerDemand: 22 },
  { villageCode: "NM-06", name: "Shirpur", district: "Dhule", taluka: "Shirpur", lat: 21.3488, lng: 74.8802, population: 105000, groundwaterLevel: 14.5, historicalAvgRainfall: 52, stressScore: 70, rainfallDeviation: -30, tankerDemand: 24 },
  { villageCode: "NM-07", name: "Sinnar", district: "Nashik", taluka: "Sinnar", lat: 19.8468, lng: 73.9953, population: 68000, groundwaterLevel: 11.5, historicalAvgRainfall: 70, stressScore: 50, rainfallDeviation: -16, tankerDemand: 8 },
  { villageCode: "NM-08", name: "Chopda", district: "Jalgaon", taluka: "Chopda", lat: 21.2471, lng: 75.2949, population: 62000, groundwaterLevel: 12.8, historicalAvgRainfall: 60, stressScore: 58, rainfallDeviation: -22, tankerDemand: 14 },

  // ── Konkan (Coastal) ──
  { villageCode: "v-016", name: "Ratnagiri", district: "Ratnagiri", taluka: "Ratnagiri", lat: 16.9902, lng: 73.3120, population: 76200, groundwaterLevel: 3.2, historicalAvgRainfall: 250, stressScore: 18, rainfallDeviation: 5, tankerDemand: 0 },
  { villageCode: "v-017", name: "Sindhudurg", district: "Sindhudurg", taluka: "Oras", lat: 16.3487, lng: 73.6831, population: 28500, groundwaterLevel: 2.5, historicalAvgRainfall: 280, stressScore: 12, rainfallDeviation: 8, tankerDemand: 0 },
  { villageCode: "KON-01", name: "Thane City", district: "Thane", taluka: "Thane", lat: 19.2183, lng: 72.9781, population: 1841000, groundwaterLevel: 6.0, historicalAvgRainfall: 200, stressScore: 24, rainfallDeviation: 3, tankerDemand: 0 },
  { villageCode: "KON-02", name: "Palghar", district: "Palghar", taluka: "Palghar", lat: 19.6929, lng: 72.7637, population: 150000, groundwaterLevel: 5.0, historicalAvgRainfall: 220, stressScore: 20, rainfallDeviation: 4, tankerDemand: 0 },
  { villageCode: "KON-03", name: "Alibag", district: "Raigad", taluka: "Alibag", lat: 18.6414, lng: 72.8790, population: 24000, groundwaterLevel: 4.0, historicalAvgRainfall: 260, stressScore: 15, rainfallDeviation: 6, tankerDemand: 0 },
  { villageCode: "KON-04", name: "Dapoli", district: "Ratnagiri", taluka: "Dapoli", lat: 17.7518, lng: 73.1837, population: 18000, groundwaterLevel: 3.5, historicalAvgRainfall: 270, stressScore: 14, rainfallDeviation: 7, tankerDemand: 0 },
  { villageCode: "KON-05", name: "Vengurla", district: "Sindhudurg", taluka: "Vengurla", lat: 15.8619, lng: 73.6363, population: 14000, groundwaterLevel: 2.8, historicalAvgRainfall: 290, stressScore: 10, rainfallDeviation: 10, tankerDemand: 0 },
];

// ── Water Sources ──
const waterSourceData = [
  // Marathwada Dams
  { sourceCode: "WS-001", name: "Manjara Dam", type: "dam" as const, lat: 18.4500, lng: 76.5300, capacity: 320, currentLevel: 85, district: "Latur" },
  { sourceCode: "WS-002", name: "Bindusara Dam", type: "dam" as const, lat: 18.9700, lng: 75.7800, capacity: 250, currentLevel: 62, district: "Beed" },
  { sourceCode: "WS-003", name: "Sina Kolegaon Dam", type: "dam" as const, lat: 18.2000, lng: 76.0500, capacity: 410, currentLevel: 48, district: "Dharashiv" },
  { sourceCode: "WS-004", name: "Jayakwadi Dam", type: "dam" as const, lat: 19.5083, lng: 75.3833, capacity: 2909, currentLevel: 55, district: "Chh. Sambhajinagar" },
  { sourceCode: "WS-005", name: "Ujjani Dam", type: "dam" as const, lat: 18.0500, lng: 75.1167, capacity: 3320, currentLevel: 42, district: "Solapur" },
  { sourceCode: "WS-025", name: "Vishnupuri Dam", type: "dam" as const, lat: 19.1600, lng: 77.3000, capacity: 270, currentLevel: 58, district: "Nanded" },
  { sourceCode: "WS-026", name: "Lower Dudhna Dam", type: "dam" as const, lat: 19.3500, lng: 76.8000, capacity: 195, currentLevel: 44, district: "Parbhani" },
  { sourceCode: "WS-027", name: "Yerala Dam", type: "dam" as const, lat: 18.2400, lng: 75.7200, capacity: 140, currentLevel: 38, district: "Solapur" },

  // Nagpur Region
  { sourceCode: "WS-006", name: "Gorewada Reservoir", type: "reservoir" as const, lat: 21.1900, lng: 79.0500, capacity: 180, currentLevel: 72, district: "Nagpur" },
  { sourceCode: "WS-007", name: "Totladoh Dam", type: "dam" as const, lat: 21.4100, lng: 79.5300, capacity: 1015, currentLevel: 68, district: "Nagpur" },
  { sourceCode: "WS-008", name: "Navegaon Bandh Dam", type: "dam" as const, lat: 21.1200, lng: 79.6000, capacity: 220, currentLevel: 75, district: "Nagpur" },

  // Vidarbha
  { sourceCode: "WS-009", name: "Upper Wardha Dam", type: "dam" as const, lat: 21.4000, lng: 78.3000, capacity: 510, currentLevel: 58, district: "Amravati" },
  { sourceCode: "WS-010", name: "Erai Dam", type: "dam" as const, lat: 19.9700, lng: 79.3200, capacity: 380, currentLevel: 82, district: "Chandrapur" },
  { sourceCode: "WS-028", name: "Ithiadoh Dam", type: "dam" as const, lat: 21.5200, lng: 80.0800, capacity: 260, currentLevel: 70, district: "Gondia" },
  { sourceCode: "WS-029", name: "Bawanthadi Dam", type: "dam" as const, lat: 21.2500, lng: 79.6800, capacity: 340, currentLevel: 65, district: "Bhandara" },
  { sourceCode: "WS-030", name: "Pus Dam", type: "dam" as const, lat: 20.4000, lng: 78.1500, capacity: 170, currentLevel: 52, district: "Yavatmal" },

  // Western Maharashtra
  { sourceCode: "WS-015", name: "Khadakwasla Dam", type: "dam" as const, lat: 18.4420, lng: 73.7684, capacity: 1965, currentLevel: 78, district: "Pune" },
  { sourceCode: "WS-016", name: "Radhanagari Dam", type: "dam" as const, lat: 16.4100, lng: 73.9700, capacity: 230, currentLevel: 88, district: "Kolhapur" },
  { sourceCode: "WS-017", name: "Koyna Dam", type: "dam" as const, lat: 17.3942, lng: 73.7577, capacity: 2797, currentLevel: 72, district: "Satara" },
  { sourceCode: "WS-031", name: "Vir Dam", type: "dam" as const, lat: 18.0400, lng: 74.5000, capacity: 380, currentLevel: 55, district: "Satara" },
  { sourceCode: "WS-032", name: "Nira Deoghar Dam", type: "dam" as const, lat: 18.1200, lng: 74.7800, capacity: 560, currentLevel: 48, district: "Pune" },

  // North Maharashtra
  { sourceCode: "WS-018", name: "Gangapur Dam", type: "dam" as const, lat: 19.9500, lng: 73.6800, capacity: 560, currentLevel: 68, district: "Nashik" },
  { sourceCode: "WS-019", name: "Girna Dam", type: "dam" as const, lat: 20.8500, lng: 74.6500, capacity: 610, currentLevel: 55, district: "Jalgaon" },
  { sourceCode: "WS-033", name: "Hathnur Dam", type: "dam" as const, lat: 21.0500, lng: 74.7200, capacity: 420, currentLevel: 50, district: "Dhule" },
  { sourceCode: "WS-034", name: "Darna Dam", type: "dam" as const, lat: 19.8600, lng: 73.8900, capacity: 280, currentLevel: 62, district: "Nashik" },

  // Konkan
  { sourceCode: "WS-020", name: "Barvi Dam", type: "dam" as const, lat: 19.2500, lng: 73.2000, capacity: 480, currentLevel: 90, district: "Thane" },
  { sourceCode: "WS-035", name: "Surya Dam", type: "dam" as const, lat: 19.8700, lng: 73.0500, capacity: 320, currentLevel: 85, district: "Palghar" },
  { sourceCode: "WS-036", name: "Tillari Dam", type: "dam" as const, lat: 15.9800, lng: 74.0100, capacity: 450, currentLevel: 92, district: "Sindhudurg" },

  // Borewells
  { sourceCode: "WS-011", name: "Latur Borewell Cluster", type: "borewell" as const, lat: 18.4200, lng: 76.5800, capacity: 50, currentLevel: 30, district: "Latur" },
  { sourceCode: "WS-012", name: "Beed Borewell Network", type: "borewell" as const, lat: 19.0000, lng: 75.7500, capacity: 40, currentLevel: 25, district: "Beed" },
  { sourceCode: "WS-021", name: "Solapur Borewell Network", type: "borewell" as const, lat: 17.6600, lng: 75.9200, capacity: 45, currentLevel: 22, district: "Solapur" },
  { sourceCode: "WS-022", name: "Dhule Borewell Cluster", type: "borewell" as const, lat: 20.9100, lng: 74.7600, capacity: 35, currentLevel: 28, district: "Dhule" },

  // Rivers
  { sourceCode: "WS-013", name: "Godavari River - Nanded Point", type: "river" as const, lat: 19.1383, lng: 77.3210, capacity: 5000, currentLevel: 60, district: "Nanded" },
  { sourceCode: "WS-014", name: "Nag River - Nagpur", type: "river" as const, lat: 21.1500, lng: 79.1000, capacity: 800, currentLevel: 45, district: "Nagpur" },
  { sourceCode: "WS-023", name: "Bhima River - Solapur", type: "river" as const, lat: 17.7500, lng: 75.8500, capacity: 4000, currentLevel: 40, district: "Solapur" },
  { sourceCode: "WS-024", name: "Krishna River - Sangli", type: "river" as const, lat: 16.8700, lng: 74.5600, capacity: 6000, currentLevel: 55, district: "Sangli" },
];

// ── Tankers (with driver phones for WhatsApp notifications) ──
const tankerData = [
  // Marathwada Tankers
  { registrationNo: "MH-24-AB-1001", driverName: "Ramesh Jadhav", driverPhone: "9876543210", capacity: 10000, depotLocation: "Latur Depot", depotLat: 18.4000, depotLng: 76.5500, status: "available" as const },
  { registrationNo: "MH-24-CD-2002", driverName: "Suresh Pawar", driverPhone: "9876543211", capacity: 12000, depotLocation: "Latur Depot", depotLat: 18.4100, depotLng: 76.5700, status: "available" as const },
  { registrationNo: "MH-23-EF-3003", driverName: "Manoj Shinde", driverPhone: "9876543212", capacity: 10000, depotLocation: "Beed Depot", depotLat: 18.9800, depotLng: 75.7500, status: "available" as const },
  { registrationNo: "MH-23-GH-4004", driverName: "Vikram Gaikwad", driverPhone: "9876543213", capacity: 8000, depotLocation: "Beed Depot", depotLat: 18.9900, depotLng: 75.7700, status: "available" as const },
  { registrationNo: "MH-25-IJ-5005", driverName: "Santosh Deshmukh", driverPhone: "9876543214", capacity: 15000, depotLocation: "Dharashiv Depot", depotLat: 18.1800, depotLng: 76.0300, status: "available" as const },
  { registrationNo: "MH-20-KL-6006", driverName: "Anil Bhosle", driverPhone: "9876543215", capacity: 10000, depotLocation: "Solapur Depot", depotLat: 17.6700, depotLng: 75.9100, status: "available" as const },
  { registrationNo: "MH-20-MN-7007", driverName: "Pravin Kale", driverPhone: "9876543216", capacity: 12000, depotLocation: "Solapur Depot", depotLat: 17.6500, depotLng: 75.9000, status: "available" as const },
  { registrationNo: "MH-19-OP-1601", driverName: "Amol Suryawanshi", driverPhone: "9876543240", capacity: 10000, depotLocation: "Chh. Sambhajinagar Depot", depotLat: 19.8800, depotLng: 75.3500, status: "available" as const },
  { registrationNo: "MH-19-QR-1602", driverName: "Raju Walunj", driverPhone: "9876543241", capacity: 12000, depotLocation: "Chh. Sambhajinagar Depot", depotLat: 19.8700, depotLng: 75.3300, status: "available" as const },
  { registrationNo: "MH-26-ST-1603", driverName: "Shankar Borate", driverPhone: "9876543242", capacity: 10000, depotLocation: "Nanded Depot", depotLat: 19.1400, depotLng: 77.3100, status: "available" as const },
  { registrationNo: "MH-22-UV-1604", driverName: "Ramdas Shete", driverPhone: "9876543243", capacity: 8000, depotLocation: "Parbhani Depot", depotLat: 19.2700, depotLng: 76.7800, status: "available" as const },

  // Nagpur Region Tankers
  { registrationNo: "MH-31-OP-8008", driverName: "Rajesh Meshram", driverPhone: "9876543217", capacity: 10000, depotLocation: "Nagpur Central Depot", depotLat: 21.1500, depotLng: 79.0900, status: "available" as const },
  { registrationNo: "MH-31-QR-9009", driverName: "Deepak Wasnik", driverPhone: "9876543218", capacity: 12000, depotLocation: "Nagpur Central Depot", depotLat: 21.1400, depotLng: 79.0800, status: "available" as const },
  { registrationNo: "MH-31-ST-1010", driverName: "Ganesh Ingle", driverPhone: "9876543219", capacity: 8000, depotLocation: "Kamptee Depot", depotLat: 21.2200, depotLng: 79.1900, status: "available" as const },
  { registrationNo: "MH-31-UV-1111", driverName: "Kishor Wankhede", driverPhone: "9876543220", capacity: 10000, depotLocation: "Katol Depot", depotLat: 21.2700, depotLng: 78.5900, status: "available" as const },

  // Vidarbha Tankers
  { registrationNo: "MH-27-WX-1212", driverName: "Sachin Raut", driverPhone: "9876543221", capacity: 10000, depotLocation: "Amravati Depot", depotLat: 20.9300, depotLng: 77.7700, status: "available" as const },
  { registrationNo: "MH-34-YZ-1313", driverName: "Nitin Thakre", driverPhone: "9876543222", capacity: 12000, depotLocation: "Chandrapur Depot", depotLat: 19.9600, depotLng: 79.2900, status: "available" as const },
  { registrationNo: "MH-29-AB-1414", driverName: "Vishal Chavhan", driverPhone: "9876543223", capacity: 8000, depotLocation: "Wardha Depot", depotLat: 20.7400, depotLng: 78.6000, status: "available" as const },
  { registrationNo: "MH-28-CD-1605", driverName: "Prashant Gawande", driverPhone: "9876543244", capacity: 10000, depotLocation: "Yavatmal Depot", depotLat: 20.3900, depotLng: 78.1300, status: "available" as const },
  { registrationNo: "MH-30-EF-1606", driverName: "Dinesh Khule", driverPhone: "9876543245", capacity: 8000, depotLocation: "Buldhana Depot", depotLat: 20.5300, depotLng: 76.1800, status: "available" as const },

  // Western Maharashtra Tankers
  { registrationNo: "MH-15-CD-1515", driverName: "Ajay More", driverPhone: "9876543224", capacity: 10000, depotLocation: "Ahmednagar Depot", depotLat: 19.0900, depotLng: 74.7400, status: "available" as const },
  { registrationNo: "MH-12-EF-1607", driverName: "Kiran Patil", driverPhone: "9876543246", capacity: 12000, depotLocation: "Pune Depot", depotLat: 18.5300, depotLng: 73.8500, status: "available" as const },
  { registrationNo: "MH-09-GH-1608", driverName: "Sandip Jagtap", driverPhone: "9876543247", capacity: 10000, depotLocation: "Kolhapur Depot", depotLat: 16.7100, depotLng: 74.2500, status: "available" as const },
  { registrationNo: "MH-11-IJ-1609", driverName: "Sunil Nikam", driverPhone: "9876543248", capacity: 10000, depotLocation: "Satara Depot", depotLat: 17.6900, depotLng: 74.0000, status: "available" as const },
  { registrationNo: "MH-10-KL-1610", driverName: "Yogesh Kadam", driverPhone: "9876543249", capacity: 12000, depotLocation: "Sangli Depot", depotLat: 16.8600, depotLng: 74.5800, status: "available" as const },

  // North Maharashtra Tankers
  { registrationNo: "MH-15-MN-1611", driverName: "Devendra Sonawane", driverPhone: "9876543250", capacity: 10000, depotLocation: "Nashik Depot", depotLat: 20.0000, depotLng: 73.7900, status: "available" as const },
  { registrationNo: "MH-15-OP-1612", driverName: "Bharat Chavan", driverPhone: "9876543251", capacity: 12000, depotLocation: "Nashik Depot", depotLat: 19.9900, depotLng: 73.7800, status: "available" as const },
  { registrationNo: "MH-18-QR-1613", driverName: "Mukesh Mahajan", driverPhone: "9876543252", capacity: 10000, depotLocation: "Dhule Depot", depotLat: 20.9000, depotLng: 74.7700, status: "available" as const },
  { registrationNo: "MH-17-ST-1614", driverName: "Sagar Sapkal", driverPhone: "9876543253", capacity: 10000, depotLocation: "Jalgaon Depot", depotLat: 21.0100, depotLng: 75.5600, status: "available" as const },
];

async function main() {
  console.log("Seeding database...\n");

  // ── Clear existing data (order matters for relations) ──
  console.log("Clearing existing data...");
  await prisma.dispatch.deleteMany();
  await prisma.tanker.deleteMany();
  await prisma.weatherRecord.deleteMany();
  await prisma.waterSource.deleteMany();
  await prisma.village.deleteMany();
  console.log("  Cleared all domain data.\n");

  // ── Seed Villages ──
  console.log("Seeding villages...");
  for (const v of villageData) {
    await prisma.village.create({ data: v });
  }
  console.log(`  Created ${villageData.length} villages.\n`);

  // ── Seed Water Sources ──
  console.log("Seeding water sources...");
  for (const ws of waterSourceData) {
    await prisma.waterSource.create({ data: ws });
  }
  console.log(`  Created ${waterSourceData.length} water sources.\n`);

  // ── Seed Tankers ──
  console.log("Seeding tankers...");
  for (const t of tankerData) {
    await prisma.tanker.create({ data: t });
  }
  console.log(`  Created ${tankerData.length} tankers.\n`);

  // ── Summary ──
  const villageCount = await prisma.village.count();
  const sourceCount = await prisma.waterSource.count();
  const tankerCount = await prisma.tanker.count();

  console.log("Seed complete!");
  console.log(`  Villages:      ${villageCount}`);
  console.log(`  Water Sources: ${sourceCount}`);
  console.log(`  Tankers:       ${tankerCount}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
