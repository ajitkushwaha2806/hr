import sharp from "sharp";
import fs from "fs";

async function generateEdgeAssets() {
  console.log("Generating EDGE HR splash & icon assets from public/assets/logo/EDGE.png...");

  const inputPath = "public/assets/logo/EDGE.png";

  // 1. Trim input to get the exact logo bounding box
  const trimmedBuffer = await sharp(inputPath)
    .trim({
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      threshold: 15,
    })
    .toBuffer();

  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  console.log(`Trimmed logo bounds: ${trimmedMeta.width}x${trimmedMeta.height}`);

  // 2. Generate assets/icon.png (1024x1024)
  // Target width 720px for good balance inside 1024x1024
  const iconLogo = await sharp(trimmedBuffer)
    .resize({ width: 720, height: 720, fit: "inside" })
    .toBuffer();

  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: iconLogo, gravity: "center" }])
    .png()
    .toFile("assets/icon.png");

  console.log("Created assets/icon.png (1024x1024)");

  // 3. Generate assets/logo.png
  fs.copyFileSync("assets/icon.png", "assets/logo.png");
  console.log("Created assets/logo.png");

  // 4. Generate assets/icon-foreground.png (1024x1024, adaptive icon safe zone ~460px)
  const adaptiveLogo = await sharp(trimmedBuffer)
    .resize({ width: 500, height: 500, fit: "inside" })
    .toBuffer();

  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: adaptiveLogo, gravity: "center" }])
    .png()
    .toFile("assets/icon-foreground.png");

  console.log("Created assets/icon-foreground.png");

  // 5. Generate assets/icon-background.png (1024x1024, solid white)
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .png()
    .toFile("assets/icon-background.png");

  console.log("Created assets/icon-background.png");

  // 6. Generate assets/splash.png (2732x2732, white background with centered logo)
  const splashLogo = await sharp(trimmedBuffer)
    .resize({ width: 1100, height: 1100, fit: "inside" })
    .toBuffer();

  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: splashLogo, gravity: "center" }])
    .png()
    .toFile("assets/splash.png");

  console.log("Created assets/splash.png (2732x2732)");

  // 7. Generate assets/splash-dark.png (2732x2732, dark theme splash)
  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: { r: 18, g: 26, b: 22, alpha: 1 }, // dark brand slate
    },
  })
    .composite([{ input: splashLogo, gravity: "center" }])
    .png()
    .toFile("assets/splash-dark.png");

  console.log("Created assets/splash-dark.png (2732x2732)");

  console.log("All EDGE HR assets generated successfully!");
}

generateEdgeAssets().catch(console.error);
