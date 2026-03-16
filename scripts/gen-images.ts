import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateAndSave(prompt: string, filename: string) {
  console.log(`Generating ${filename}...`);
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });
    const base64 = response.generatedImages[0].image.imageBytes;
    fs.writeFileSync(path.join(process.cwd(), 'public', filename), Buffer.from(base64, 'base64'));
    console.log(`Saved ${filename}`);
  } catch (err) {
    console.error(`Failed to generate ${filename}:`, err);
  }
}

async function main() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  await generateAndSave("A glowing 'Cyber-Burger' on a dark plate, cyberpunk style, high quality, neon lighting, food photography", "cyber-burger.jpg");
  await generateAndSave("Neon Noodles in a bioluminescent bowl, cyberpunk style, high quality, neon lighting, food photography", "neon-noodles.jpg");
  await generateAndSave("Quantum Cola in a glass containment vessel, cyberpunk style, high quality, neon lighting, beverage photography", "quantum-cola.jpg");
}

main().catch(console.error);
