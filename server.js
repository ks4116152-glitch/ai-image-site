const express = require("express");
const dotenv = require("dotenv");
const { InferenceClient } = require("@huggingface/inference");

dotenv.config();

const app = express();
const PORT = 3000;

const hf = new InferenceClient(process.env.HF_TOKEN);

app.use(express.json());
app.use(express.static("public"));

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Please enter a prompt." });
    }

    console.log("Generating image...");

    const imageBlob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt.trim()
    });

    const buffer = Buffer.from(await imageBlob.arrayBuffer());
    const base64 = buffer.toString("base64");

    res.json({
      image: `data:image/png;base64,${base64}`
    });

  } catch (error) {
  console.error("FULL HUGGING FACE ERROR:", error);

  res.status(500).json({
    error: error.message || "Image generation failed.",
    details: error.response?.data || error.cause?.message || null
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Image Generator running at http://0.0.0.0:${PORT}`);
});

