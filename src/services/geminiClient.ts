export async function scanReceipt(imageBase64: string, mimeType: string, apiKey: string) {
  if (!apiKey) throw new Error("API Key is missing");

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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No text returned from Gemini API");
  }

  return JSON.parse(text);
}

export async function analyzeTaxGaps(transactions: any[], companySettings: any, apiKey: string) {
  if (!apiKey) throw new Error("API Key is missing");

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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No output received from Gemini for Tax Gap Analysis");
  }

  return JSON.parse(text);
}

export async function chatAdvisor(prompt: string, context: any, apiKey: string) {
  if (!apiKey) throw new Error("API Key is missing");

  const systemInstruction = `You are a Senior NZ Chartered Accountant and Tax Advisor for "Small Business Company Limited".
Provide accurate New Zealand Inland Revenue Department (IRD) advice, GST guidance (15% rate, Payments or Invoice basis), PAYE & KiwiSaver rules (3.5% employee rate / 3% employer rate), provisional tax options (Standard vs AIM), company dividend imputation credits, and business financial optimization strategies.

Maintain a professional, practical tone. Use bullet points and clear markdown sections when applicable.
Company context: Small Business Company Limited (NZBN: 9429041234567, GST 2-Monthly Payments Basis).`;

  const fullMessage = context
    ? \`Company Context:\\n\${JSON.stringify(context, null, 2)}\\n\\nUser Question/Request: \${prompt}\`
    : prompt;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [{ parts: [{ text: fullMessage }] }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from AI advisor.";
}
