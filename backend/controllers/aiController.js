const openai = require('../utils/openai');

exports.generateSummary = async (req, res) => {
  try {
    const { title, chartType, xAxis, yAxisData } = req.body;

    if (!title || !chartType || !xAxis || !yAxisData) {
      return res.status(400).json({ message: "Missing chart data fields" });
    }

    const prompt = `
You are an expert data analyst. Analyze the following chart:
- Title: ${title}
- Chart Type: ${chartType}
- X-Axis: ${xAxis.join(', ')}
- Y-Axis Data: ${JSON.stringify(yAxisData)}

Provide a concise summary with insights, trends, or patterns.
    `;

    const summary = await openai.generateText(prompt);

    res.status(200).json({ summary });
  } catch (error) {
    console.error("AI Summary Error:", error);
    res.status(500).json({ message: "Failed to generate summary", error: error.message });
  }
};
