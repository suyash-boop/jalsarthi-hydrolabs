Project Name: JalSarthi (Teamname: Hydro Labs)

Theme: SDG 6 – Clean Water & Sanitation | Maharashtra Context Track: Integrated Drought Warning & Smart Tanker Management System 
🎯 The Motto & Vision

Our core mission is to shift response from crisis management to preventive water governance. In Maharashtra, authorities often wait until a village is completely dry before sending water tankers. Our platform changes this by predicting the drought before it happens and automatically dispatching resources.
🚨 Problem Statement

We are building an integrated digital platform that predicts emerging drought stress using rainfall and groundwater trends. This system enables district authorities to proactively plan and optimize water tanker allocation.
⚙️ Tech Stack

    Frontend: Next.js, Tailwind CSS, Mapbox GL JS 

    Backend: Node.js, Express.js (MERN Stack) 

    Database: MongoDB, Prisma ORM

    APIs: Free Weather API (for rainfall data) , Mapbox Directions API (for routing) -- (Or you choose if something is more better)

    AI Integration: OpenClaw Agent (for autonomous dispatch messaging)

    Algorithms: Basic optimization algorithm for routing 

🧠 Core System Modules 
1. Data Analytics Engine (Backend)

This module handles the ingestion and processing of environmental data.

    Feature: Rainfall deviation and groundwater trend analysis.

    Logic: Fetch the last 30 days of rainfall data via a Weather API and compare it against historical averages stored in MongoDB. Combine this with mock current groundwater levels.

2. The Drought Prediction Algorithm (Backend)

This is the mathematical core of the platform.

    Feature: Village-level Water Stress Index generation.

    Logic: A JavaScript function that ingests the rainfall and groundwater data and outputs a "Stress Score" from 0 (Safe) to 100 (Critical Drought) for each village.

    Feature: Predictive tanker demand estimation.

    Logic: Based on the Stress Score and the village population, calculate exactly how many liters of water (and thus, how many tankers) will be needed in the next 7 days.

3. Smart Allocation & Routing (Backend)

This handles the logistics of saving the villages.

    Feature: Priority-based allocation (population + severity).

    Logic: A sorting algorithm that ranks villages. A small village with a score of 95 gets priority over a large town with a score of 60.

    Feature: Route optimization for tanker dispatch.

    Logic: Use Mapbox or Google Maps APIs to calculate the shortest, most fuel-efficient route connecting the water source to the top-priority villages.

4. The District Authority Dashboard (Frontend)

The user interface for the government officials.

    Feature: Real-time monitoring and decision dashboard.

    Logic: A React dashboard displaying a Mapbox map. Villages are plotted as markers. Green = Safe (< 50 Stress), Yellow = Warning (50-75 Stress), Red = Critical (> 75 Stress). It also displays a sidebar with the predictive tanker demand.

5. Autonomous Dispatch (The OpenClaw Agent)

The "wow" factor of the project.

    Logic: When the backend flags a route as "Ready for Dispatch," an OpenClaw AI agent is triggered. It reads the optimized route and autonomously sends a WhatsApp/Telegram message to the tanker driver with the exact Google Maps navigation link and drop-off instructions.
