import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const villageData = [
  // ── Nagpur District (12 villages) ──
  { villageCode: "v-101", name: "Nagpur City", district: "Nagpur", taluka: "Nagpur Urban", lat: 21.1458, lng: 79.0882, population: 48500, groundwaterLevel: 9.8, historicalAvgRainfall: 95, stressScore: 52, rainfallDeviation: -18, tankerDemand: 14 },
  { villageCode: "v-102", name: "Kamptee", district: "Nagpur", taluka: "Kamptee", lat: 21.2330, lng: 79.1920, population: 12800, groundwaterLevel: 11.2, historicalAvgRainfall: 90, stressScore: 58, rainfallDeviation: -22, tankerDemand: 18 },
  { villageCode: "v-103", name: "Katol", district: "Nagpur", taluka: "Katol", lat: 21.2740, lng: 78.5870, population: 8900, groundwaterLevel: 13.5, historicalAvgRainfall: 82, stressScore: 65, rainfallDeviation: -28, tankerDemand: 22 },
  { villageCode: "v-104", name: "Saoner", district: "Nagpur", taluka: "Saoner", lat: 21.3870, lng: 78.9180, population: 7200, groundwaterLevel: 12.1, historicalAvgRainfall: 85, stressScore: 60, rainfallDeviation: -25, tankerDemand: 16 },
  { villageCode: "v-105", name: "Umred", district: "Nagpur", taluka: "Umred", lat: 20.8500, lng: 79.3260, population: 6800, groundwaterLevel: 14.8, historicalAvgRainfall: 78, stressScore: 70, rainfallDeviation: -32, tankerDemand: 24 },
  { villageCode: "v-106", name: "Ramtek", district: "Nagpur", taluka: "Ramtek", lat: 21.3970, lng: 79.3280, population: 5400, groundwaterLevel: 10.5, historicalAvgRainfall: 92, stressScore: 48, rainfallDeviation: -15, tankerDemand: 8 },
  { villageCode: "v-107", name: "Parseoni", district: "Nagpur", taluka: "Parseoni", lat: 21.0220, lng: 79.1530, population: 4200, groundwaterLevel: 15.2, historicalAvgRainfall: 75, stressScore: 72, rainfallDeviation: -35, tankerDemand: 20 },
  { villageCode: "v-108", name: "Narkhed", district: "Nagpur", taluka: "Narkhed", lat: 21.4420, lng: 78.4920, population: 5100, groundwaterLevel: 16.0, historicalAvgRainfall: 70, stressScore: 76, rainfallDeviation: -38, tankerDemand: 26 },
  { villageCode: "v-109", name: "Hingna", district: "Nagpur", taluka: "Hingna", lat: 21.0890, lng: 78.8640, population: 9500, groundwaterLevel: 11.8, historicalAvgRainfall: 88, stressScore: 55, rainfallDeviation: -20, tankerDemand: 15 },
  { villageCode: "v-110", name: "Kalmeshwar", district: "Nagpur", taluka: "Kalmeshwar", lat: 21.2340, lng: 78.9220, population: 6100, groundwaterLevel: 12.8, historicalAvgRainfall: 83, stressScore: 62, rainfallDeviation: -26, tankerDemand: 18 },
  { villageCode: "v-111", name: "Kuhi", district: "Nagpur", taluka: "Kuhi", lat: 20.7880, lng: 79.2280, population: 3800, groundwaterLevel: 17.2, historicalAvgRainfall: 65, stressScore: 78, rainfallDeviation: -40, tankerDemand: 22 },
  { villageCode: "v-112", name: "Bhiwapur", district: "Nagpur", taluka: "Bhiwapur", lat: 20.6630, lng: 79.5480, population: 4500, groundwaterLevel: 15.8, historicalAvgRainfall: 72, stressScore: 74, rainfallDeviation: -36, tankerDemand: 20 },

  // ── Broader Vidarbha (6 villages) ──
  { villageCode: "v-113", name: "Wardha", district: "Wardha", taluka: "Wardha", lat: 20.7453, lng: 78.6022, population: 11200, groundwaterLevel: 13.2, historicalAvgRainfall: 80, stressScore: 63, rainfallDeviation: -27, tankerDemand: 20 },
  { villageCode: "v-114", name: "Chandrapur", district: "Chandrapur", taluka: "Chandrapur", lat: 19.9615, lng: 79.2961, population: 15600, groundwaterLevel: 10.8, historicalAvgRainfall: 105, stressScore: 45, rainfallDeviation: -12, tankerDemand: 6 },
  { villageCode: "v-115", name: "Gadchiroli", district: "Gadchiroli", taluka: "Gadchiroli", lat: 20.1826, lng: 80.0091, population: 4200, groundwaterLevel: 8.5, historicalAvgRainfall: 120, stressScore: 28, rainfallDeviation: -5, tankerDemand: 0 },
  { villageCode: "v-116", name: "Gondia", district: "Gondia", taluka: "Gondia", lat: 21.4624, lng: 80.1940, population: 8700, groundwaterLevel: 9.2, historicalAvgRainfall: 110, stressScore: 35, rainfallDeviation: -8, tankerDemand: 3 },
  { villageCode: "v-117", name: "Bhandara", district: "Bhandara", taluka: "Bhandara", lat: 21.1669, lng: 79.6517, population: 7300, groundwaterLevel: 10.1, historicalAvgRainfall: 100, stressScore: 42, rainfallDeviation: -14, tankerDemand: 5 },
  { villageCode: "v-118", name: "Amravati", district: "Amravati", taluka: "Amravati", lat: 20.9374, lng: 77.7796, population: 22800, groundwaterLevel: 12.5, historicalAvgRainfall: 75, stressScore: 67, rainfallDeviation: -30, tankerDemand: 28 },

  // ── Existing Marathwada + Western MH (18 villages from mock-data) ──
  { villageCode: "v-001", name: "Latur", district: "Latur", taluka: "Latur", lat: 18.4088, lng: 76.5604, population: 42500, groundwaterLevel: 18.5, historicalAvgRainfall: 55, stressScore: 88, rainfallDeviation: -42, tankerDemand: 45 },
  { villageCode: "v-002", name: "Beed", district: "Beed", taluka: "Beed", lat: 18.9892, lng: 75.76, population: 35200, groundwaterLevel: 16.2, historicalAvgRainfall: 60, stressScore: 82, rainfallDeviation: -38, tankerDemand: 38 },
  { villageCode: "v-003", name: "Osmanabad (Dharashiv)", district: "Dharashiv", taluka: "Dharashiv", lat: 18.186, lng: 76.044, population: 28700, groundwaterLevel: 15.8, historicalAvgRainfall: 58, stressScore: 79, rainfallDeviation: -36, tankerDemand: 32 },
  { villageCode: "v-004", name: "Jalna", district: "Jalna", taluka: "Jalna", lat: 19.8347, lng: 75.882, population: 31800, groundwaterLevel: 13.5, historicalAvgRainfall: 65, stressScore: 72, rainfallDeviation: -30, tankerDemand: 28 },
  { villageCode: "v-005", name: "Parbhani", district: "Parbhani", taluka: "Parbhani", lat: 19.261, lng: 76.7748, population: 26400, groundwaterLevel: 14.1, historicalAvgRainfall: 62, stressScore: 76, rainfallDeviation: -33, tankerDemand: 30 },
  { villageCode: "v-006", name: "Yavatmal", district: "Yavatmal", taluka: "Yavatmal", lat: 20.3888, lng: 78.1204, population: 22100, groundwaterLevel: 12.4, historicalAvgRainfall: 75, stressScore: 68, rainfallDeviation: -28, tankerDemand: 22 },
  { villageCode: "v-007", name: "Washim", district: "Washim", taluka: "Washim", lat: 20.1119, lng: 77.1332, population: 18500, groundwaterLevel: 11.8, historicalAvgRainfall: 72, stressScore: 64, rainfallDeviation: -25, tankerDemand: 18 },
  { villageCode: "v-008", name: "Akola", district: "Akola", taluka: "Akola", lat: 20.7096, lng: 77.0084, population: 41200, groundwaterLevel: 10.2, historicalAvgRainfall: 70, stressScore: 55, rainfallDeviation: -20, tankerDemand: 15 },
  { villageCode: "v-009", name: "Sangli", district: "Sangli", taluka: "Miraj", lat: 16.8524, lng: 74.5815, population: 38900, groundwaterLevel: 8.5, historicalAvgRainfall: 50, stressScore: 48, rainfallDeviation: -15, tankerDemand: 10 },
  { villageCode: "v-010", name: "Solapur", district: "Solapur", taluka: "Solapur North", lat: 17.6599, lng: 75.9064, population: 52300, groundwaterLevel: 14.0, historicalAvgRainfall: 48, stressScore: 71, rainfallDeviation: -31, tankerDemand: 35 },
  { villageCode: "v-011", name: "Satara", district: "Satara", taluka: "Satara", lat: 17.6805, lng: 74.0183, population: 29600, groundwaterLevel: 6.2, historicalAvgRainfall: 90, stressScore: 35, rainfallDeviation: -10, tankerDemand: 5 },
  { villageCode: "v-012", name: "Ahmednagar", district: "Ahmednagar", taluka: "Ahmednagar", lat: 19.0948, lng: 74.748, population: 44800, groundwaterLevel: 11.5, historicalAvgRainfall: 52, stressScore: 62, rainfallDeviation: -24, tankerDemand: 20 },
  { villageCode: "v-013", name: "Nandurbar", district: "Nandurbar", taluka: "Nandurbar", lat: 21.3691, lng: 74.2405, population: 16200, groundwaterLevel: 7.8, historicalAvgRainfall: 80, stressScore: 42, rainfallDeviation: -12, tankerDemand: 8 },
  { villageCode: "v-014", name: "Dhule", district: "Dhule", taluka: "Dhule", lat: 20.9042, lng: 74.7749, population: 25100, groundwaterLevel: 9.5, historicalAvgRainfall: 55, stressScore: 51, rainfallDeviation: -18, tankerDemand: 12 },
  { villageCode: "v-015", name: "Jalgaon", district: "Jalgaon", taluka: "Jalgaon", lat: 21.0077, lng: 75.5626, population: 38600, groundwaterLevel: 8.0, historicalAvgRainfall: 60, stressScore: 45, rainfallDeviation: -14, tankerDemand: 9 },
  { villageCode: "v-016", name: "Ratnagiri", district: "Ratnagiri", taluka: "Ratnagiri", lat: 16.9902, lng: 73.312, population: 21800, groundwaterLevel: 3.2, historicalAvgRainfall: 250, stressScore: 18, rainfallDeviation: 5, tankerDemand: 0 },
  { villageCode: "v-017", name: "Sindhudurg", district: "Sindhudurg", taluka: "Oras", lat: 16.3487, lng: 73.6831, population: 14500, groundwaterLevel: 2.5, historicalAvgRainfall: 280, stressScore: 12, rainfallDeviation: 8, tankerDemand: 0 },
  { villageCode: "v-018", name: "Hingoli", district: "Hingoli", taluka: "Hingoli", lat: 19.722, lng: 77.15, population: 19300, groundwaterLevel: 10.8, historicalAvgRainfall: 68, stressScore: 58, rainfallDeviation: -22, tankerDemand: 14 },
];

const waterSourceData = [
  // Existing 5
  { sourceCode: "ws-001", name: "Jayakwadi Dam", type: "dam" as const, lat: 19.5104, lng: 75.3507, capacity: 2909, currentLevel: 32, district: "Chhatrapati Sambhajinagar" },
  { sourceCode: "ws-002", name: "Ujjani Dam", type: "dam" as const, lat: 18.05, lng: 75.1167, capacity: 3320, currentLevel: 45, district: "Solapur" },
  { sourceCode: "ws-003", name: "Koyna Dam", type: "dam" as const, lat: 17.4, lng: 73.75, capacity: 2797, currentLevel: 68, district: "Satara" },
  { sourceCode: "ws-004", name: "Manjara Dam", type: "dam" as const, lat: 18.5167, lng: 76.5333, capacity: 509, currentLevel: 18, district: "Latur" },
  { sourceCode: "ws-005", name: "Girna Dam", type: "dam" as const, lat: 20.55, lng: 74.7333, capacity: 609, currentLevel: 52, district: "Jalgaon" },
  // New Vidarbha sources
  { sourceCode: "ws-006", name: "Totladoh Dam", type: "dam" as const, lat: 21.4667, lng: 79.5333, capacity: 1517, currentLevel: 55, district: "Nagpur" },
  { sourceCode: "ws-007", name: "Navegaon Bandh", type: "reservoir" as const, lat: 21.1, lng: 79.5833, capacity: 212, currentLevel: 38, district: "Nagpur" },
  { sourceCode: "ws-008", name: "Gosikhurd Dam", type: "dam" as const, lat: 20.45, lng: 79.6333, capacity: 740, currentLevel: 42, district: "Bhandara" },
];

const tankerData = [
  { registrationNo: "MH-31-AB-1234", driverName: "Rajesh Patil", driverPhone: "9876543210", capacity: 10000, depotLocation: "Nagpur", depotLat: 21.1458, depotLng: 79.0882, status: "available" as const },
  { registrationNo: "MH-31-CD-5678", driverName: "Suresh Deshmukh", driverPhone: "9876543211", capacity: 12000, depotLocation: "Nagpur", depotLat: 21.1520, depotLng: 79.0750, status: "available" as const },
  { registrationNo: "MH-31-EF-9012", driverName: "Vinod Kale", driverPhone: "9876543212", capacity: 8000, depotLocation: "Kamptee", depotLat: 21.2330, depotLng: 79.1920, status: "available" as const },
  { registrationNo: "MH-31-GH-3456", driverName: "Manoj Wankhede", driverPhone: "9876543213", capacity: 10000, depotLocation: "Wardha", depotLat: 20.7453, depotLng: 78.6022, status: "available" as const },
  { registrationNo: "MH-31-IJ-7890", driverName: "Ashok Thakre", driverPhone: "9876543214", capacity: 6000, depotLocation: "Amravati", depotLat: 20.9374, depotLng: 77.7796, status: "available" as const },
  { registrationNo: "MH-31-KL-2345", driverName: "Pravin Ingle", driverPhone: "9876543215", capacity: 10000, depotLocation: "Chandrapur", depotLat: 19.9615, depotLng: 79.2961, status: "available" as const },
  { registrationNo: "MH-31-MN-6789", driverName: "Nilesh Borkar", driverPhone: "9876543216", capacity: 8000, depotLocation: "Bhandara", depotLat: 21.1669, depotLng: 79.6517, status: "maintenance" as const },
  { registrationNo: "MH-31-OP-0123", driverName: "Ganesh Meshram", driverPhone: "9876543217", capacity: 12000, depotLocation: "Yavatmal", depotLat: 20.3888, depotLng: 78.1204, status: "available" as const },
];

async function main() {
  console.log("Clearing existing data...");
  await prisma.dispatch.deleteMany();
  await prisma.tanker.deleteMany();
  await prisma.weatherRecord.deleteMany();
  await prisma.village.deleteMany();
  await prisma.waterSource.deleteMany();

  console.log(`Seeding ${villageData.length} villages...`);
  await prisma.village.createMany({ data: villageData });

  console.log(`Seeding ${waterSourceData.length} water sources...`);
  await prisma.waterSource.createMany({ data: waterSourceData });

  console.log(`Seeding ${tankerData.length} tankers...`);
  await prisma.tanker.createMany({ data: tankerData });

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
