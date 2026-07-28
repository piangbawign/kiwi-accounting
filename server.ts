import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: "10mb" }));

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "KiwiLedger NZ Accounting" });
});

// AI Receipt Scanner using Gemini 3.6 Flash
app.post("/api/scan-receipt", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 payload" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `You are a Senior NZ Chartered Accountant. Analyze this receipt/tax invoice image for New Zealand GST and tax deductible business expenses.
Return a clean JSON object with the following schema:
{
  "merchant": "Name of the NZ business or vendor (e.g., Bunnings Warehouse, Z Energy, Spark NZ, Countdown)",
  "date": "YYYY-MM-DD",
  "totalAmount": 0.00,
  "gstAmount": 0.00,
  "currency": "NZD",
  "gstType": "STANDARD_15" | "ZERO_RATED" | "EXEMPT" | "NO_GST",
  "category": "Office Supplies" | "Motor Vehicle & Fuel" | "Subscriptions & Software" | "Tools & Equipment" | "Travel & Meals" | "Utilities & Telco" | "Professional Fees" | "General Expense",
  "irdCode": "Standard Expense Category",
  "items": [
    { "description": "Item name", "price": 0.00 }
  ],
  "confidenceScore": 0.95,
  "notes": "Short accountant summary or GST note"
}
Ensure amounts are numbers. NZ GST is standard 15% (GST portion is Total * 3 / 23). If GST amount is printed on receipt, use that exact amount.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini API");
    }

    const parsedData = JSON.parse(text);
    return res.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error("Error scanning receipt with Gemini:", error);
    return res.status(500).json({
      error: error?.message || "Failed to parse receipt with AI scanner",
    });
  }
});

// AI Tax & Accounting Advisor Endpoint
app.post("/api/ai-advisor", async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt parameter" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `You are a Senior NZ Chartered Accountant and Tax Advisor for "Small Business Company Limited".
Provide accurate New Zealand Inland Revenue Department (IRD) advice, GST guidance (15% rate, Payments or Invoice basis), PAYE & KiwiSaver rules (3.5% employee rate / 3% employer rate), provisional tax options (Standard vs AIM), company dividend imputation credits, and business financial optimization strategies.

Maintain a professional, practical tone. Use bullet points and clear markdown sections when applicable.
Company context: Small Business Company Limited (NZBN: 9429041234567, GST 2-Monthly Payments Basis).`;

    const fullMessage = context
      ? `Company Context:\n${JSON.stringify(context, null, 2)}\n\nUser Question/Request: ${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullMessage,
      config: {
        systemInstruction,
      },
    });

    const text = response.text || "No response received from AI advisor.";
    return res.json({ success: true, answer: text });
  } catch (error: any) {
    console.error("Error in AI advisor:", error);
    return res.status(500).json({ error: error?.message || "Failed to generate AI tax advice" });
  }
});

// AI Tax Gap Analysis Endpoint
app.post("/api/tax-gap-analysis", async (req, res) => {
  try {
    const { transactions, companySettings } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `You are a Senior NZ Chartered Accountant and IRD Tax Auditor for "${companySettings?.legalName || 'New Zealand Business'}".
Perform a rigorous NZ Tax Gap & Savings Analysis on the provided list of ledger transactions.

Compare each transaction against New Zealand Inland Revenue Department (IRD) regulations:
1. Identify missed GST claimable expenses (where GST was set to NO_GST or EXEMPT for standard GST vendors like Spark, Vodafone, Bunnings, Z Energy, Microsoft, PB Tech, Uber, Adobe, etc.).
2. Identify missed business expense tax deductions (e.g., tools, home office utilities, vehicle costs, staff training, low-value asset instant write-offs under $1,000 threshold).
3. Check 50% entertainment deductibility limits on cafes/restaurants vs 100% travel/client meals.
4. Calculate exact potential tax & GST savings in NZD for each identified gap.

Return a valid JSON object matching this structure:
{
  "summary": {
    "totalPotentialTaxSavings": 0,
    "totalMissedGstClaims": 0,
    "totalDeductibleGap": 0,
    "totalGapsFound": 0,
    "overallHealthScore": 85,
    "executiveSummary": "Concise 2-3 sentence overview of company tax efficiency and top opportunity areas under IRD rules."
  },
  "gaps": [
    {
      "transactionId": "ID of transaction if matched, or empty string",
      "description": "Transaction description",
      "amount": 0,
      "currentCategory": "Current category",
      "currentGstType": "Current GST type",
      "issueType": "MISSED_GST" | "MISSED_DEDUCTION" | "ENTERTAINMENT_LIMIT" | "LOW_VALUE_ASSET" | "HOME_OFFICE_GAP" | "VEHICLE_LOGBOOK",
      "recommendedCategory": "Recommended Category",
      "recommendedGstType": "STANDARD_15" | "ZERO_RATED" | "EXEMPT" | "NO_GST",
      "recommendedIrdCode": "IRD tax code string",
      "estimatedTaxSavings": 0,
      "irdGuidelineRef": "Exact IRD reference e.g., IR264 or Section EE 38 Income Tax Act 2007",
      "explanation": "Clear explanation of why this gap exists and how to claim it legally under IRD rules."
    }
  ],
  "generalStrategies": [
    {
      "title": "Strategy Name (e.g. Home Office Square Metre Rate)",
      "potentialValue": 0,
      "irdRef": "IRD Reference (e.g. IR1036)",
      "actionPlan": "Actionable steps to implement"
    }
  ]
}

Transactions Data:
${JSON.stringify(transactions ? transactions.slice(0, 30) : [], null, 2)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No output received from Gemini for Tax Gap Analysis");
    }

    const parsedData = JSON.parse(text);
    return res.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error("Error in AI tax gap analysis:", error);
    return res.status(500).json({ error: error?.message || "Failed to analyze tax gaps with Gemini" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KiwiLedger NZ Accounting Server running on port ${PORT}`);
  });
}

startServer();
