const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateText(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 250,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to generate text from OpenAI");
  }
}

module.exports = { generateText };
