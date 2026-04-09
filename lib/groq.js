import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateText(prompt) {
  try {
    // 🛡️ Ensure prompt is always a string
    const safePrompt = typeof prompt === "string" ? prompt : JSON.stringify(prompt || "");

    console.log("📤 Sending prompt to Groq:");
    console.log(safePrompt.substring(0, 200)); // preview only

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: safePrompt,
        },
      ],
      model: "llama-3.3-70b-versatile", // ✅ latest stable model
      temperature: 0.7,
    });

    // 🔍 Log full response for debugging
    console.log("📥 FULL GROQ RESPONSE:", JSON.stringify(response, null, 2));

    // 🛡️ Safe response handling
    if (!response || !response.choices || response.choices.length === 0) {
      console.error("❌ No choices returned from Groq");
      throw new Error("No response from Groq");
    }

    const text = response.choices[0]?.message?.content;

    if (!text) {
      console.error("❌ Empty content in Groq response");
      throw new Error("Empty response content");
    }

    console.log("✅ Groq response received successfully");

    return text;

  } catch (error) {
    // 🔥 Show REAL error (no hiding)
    console.error("🚨 GROQ ERROR DETAILS:");
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error);
    }

    throw error; // rethrow real error
  }
}