const axios = require("axios");

async function generateInsightsFromData(data) {
  const prompt = `Give a summary and key insights based on the following data:\n\n${JSON.stringify(data, null, 2)}`;
  
  const response = await axios.post("https://api.openai.com/v1/chat/completions", {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  }, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    }
  });

  return response.data.choices[0].message.content;
}

module.exports = generateInsightsFromData;
