import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get list of all available images
export const getImages = (req, res) => {
  try {
    const imagesDir = path.join(__dirname, "../../images");
    
    // Check if images directory exists
    if (!fs.existsSync(imagesDir)) {
      return res.status(200).json({ images: [] });
    }

    // Read all files from the images directory
    const files = fs.readdirSync(imagesDir);
    
    // Filter for image files only
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const images = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    res.json({
      message: "Available images",
      count: images.length,
      images: images.map((img) => ({
        name: img,
        url: `/images/${img}`,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve images" });
  }
};
