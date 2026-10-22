const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateSplashAssets() {
  const bg = { r: 219, g: 84, b: 62, alpha: 1 }; // #db543e
  const transparentLogoPath = path.join(__dirname, '../public/assets/icons/logo-white-transparent.png');
  const logoBuffer = await sharp(transparentLogoPath).toBuffer();
  const logoMeta = await sharp(logoBuffer).metadata();
  const logoAspect = logoMeta.width / logoMeta.height; // ~3.14

  console.log('Logo dimensions:', logoMeta.width, 'x', logoMeta.height, 'Aspect:', logoAspect);

  // 1. Generate Android 12+ splash_icon.png (1024x1024)
  // Android 12+ circular safe area is diameter 640px. 520px width fits safely inside with plenty of breathing room.
  const iconTargetWidth = 520;
  const iconResized = await sharp(logoBuffer)
    .resize({ width: iconTargetWidth })
    .toBuffer();

  const splashIcon1024 = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: iconResized, gravity: 'center' }])
    .png()
    .toBuffer();

  const iconDestinations = [
    'android/app/src/main/res/drawable/splash_icon.png',
    'android/app/src/main/res/drawable-night/splash_icon.png',
  ];

  for (const dest of iconDestinations) {
    const fullPath = path.join(__dirname, '..', dest);
    if (fs.existsSync(path.dirname(fullPath))) {
      await sharp(splashIcon1024).toFile(fullPath);
      console.log('Generated Android 12+ splash icon:', dest);
    }
  }

  // 2. Scan and update all splash.png drawables in android/app/src/main/res/
  const resDir = path.join(__dirname, '../android/app/src/main/res');
  const splashDrawables = [];

  function findSplashFiles(dir) {
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        findSplashFiles(full);
      } else if (item === 'splash.png') {
        splashDrawables.push(full);
      }
    }
  }

  if (fs.existsSync(resDir)) {
    findSplashFiles(resDir);
    console.log(`Found ${splashDrawables.length} Android splash.png drawables to generate`);

    for (const file of splashDrawables) {
      const meta = await sharp(file).metadata();
      const width = meta.width;
      const height = meta.height;
      const isPortrait = height >= width;

      // Scale logo proportionally
      let targetW;
      if (isPortrait) {
        targetW = Math.min(Math.round(width * 0.58), Math.round(height * 0.3 * logoAspect));
      } else {
        targetW = Math.min(Math.round(width * 0.38), Math.round(height * 0.45 * logoAspect));
      }

      // Ensure minimum and maximum sanity
      targetW = Math.max(80, Math.min(width - 20, targetW));

      const scaledLogo = await sharp(logoBuffer)
        .resize({ width: targetW })
        .toBuffer();

      await sharp({
        create: {
          width,
          height,
          channels: 4,
          background: bg,
        },
      })
        .composite([{ input: scaledLogo, gravity: 'center' }])
        .png()
        .toFile(file);

      console.log(`Updated splash ${width}x${height} -> ${path.relative(path.join(__dirname, '..'), file)}`);
    }
  }

  // 3. Generate high-res web / PWA splash
  const webSplashPath = path.join(__dirname, '../public/assets/splash.png');
  const webWidth = 1080;
  const webHeight = 1920;
  const webLogoWidth = Math.round(webWidth * 0.55);
  const webScaledLogo = await sharp(logoBuffer).resize({ width: webLogoWidth }).toBuffer();

  await sharp({
    create: {
      width: webWidth,
      height: webHeight,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: webScaledLogo, gravity: 'center' }])
    .png()
    .toFile(webSplashPath);

  console.log('Generated Web/PWA Splash: public/assets/splash.png');
}

generateSplashAssets().catch((err) => {
  console.error('Error generating splash assets:', err);
  process.exit(1);
});
