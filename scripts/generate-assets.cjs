const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BG_COLOR = { r: 219, g: 84, b: 62, alpha: 1 }; 
const BG_HEX = '#db543e';

async function run() {
  const transparentLogoPath = path.join(__dirname, '../public/assets/icons/logo-white-transparent.png');
  const masterLogoPath = path.join(__dirname, '../public/assets/icons/logo.png');

  if (!fs.existsSync(transparentLogoPath)) {
    console.error('Missing logo-white-transparent.png');
    process.exit(1);
  }

  const logoBuffer = await sharp(transparentLogoPath).toBuffer();
  const logoMeta = await sharp(logoBuffer).metadata();
  const logoAspect = logoMeta.width / logoMeta.height;

  console.log('Logo dimensions:', logoMeta.width, 'x', logoMeta.height, 'Aspect:', logoAspect);

  console.log('\n--- 1. Generating BIGGER Splash Screen Assets ---');

  const iconTargetWidth = 620;
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
      console.log('Generated bigger Android 12+ splash icon:', dest);
    }
  }

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
    console.log(`Updating ${splashDrawables.length} splash.png drawables with MUCH BIGGER logo (78% width)`);

    for (const file of splashDrawables) {
      const meta = await sharp(file).metadata();
      const width = meta.width;
      const height = meta.height;
      const isPortrait = height >= width;

      let targetW;
      if (isPortrait) {
        targetW = Math.min(Math.round(width * 0.78), Math.round(height * 0.35 * logoAspect));
      } else {
        targetW = Math.min(Math.round(width * 0.50), Math.round(height * 0.55 * logoAspect));
      }

      targetW = Math.max(90, Math.min(width - 24, targetW));

      const scaledLogo = await sharp(logoBuffer)
        .resize({ width: targetW })
        .toBuffer();

      await sharp({
        create: {
          width,
          height,
          channels: 4,
          background: BG_COLOR,
        },
      })
        .composite([{ input: scaledLogo, gravity: 'center' }])
        .png()
        .toFile(file);
    }
    console.log('Updated all Android splash drawables.');
  }

  const webSplashPath = path.join(__dirname, '../public/assets/splash.png');
  const webWidth = 1080;
  const webHeight = 1920;
  const webLogoWidth = Math.round(webWidth * 0.78); 
  const webScaledLogo = await sharp(logoBuffer).resize({ width: webLogoWidth }).toBuffer();

  await sharp({
    create: {
      width: webWidth,
      height: webHeight,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([{ input: webScaledLogo, gravity: 'center' }])
    .png()
    .toFile(webSplashPath);

  console.log('Generated Web/PWA Splash (842px logo): public/assets/splash.png');

  console.log('\n--- 2. Generating App Icons using Final Logo ---');
  async function createSquareIcon(size, logoScale = 0.75) {
    const targetW = Math.round(size * logoScale);
    const scaledLogo = await sharp(logoBuffer).resize({ width: targetW }).toBuffer();
    return await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BG_COLOR,
      },
    })
      .composite([{ input: scaledLogo, gravity: 'center' }])
      .png()
      .toBuffer();
  }

  async function createRoundIcon(size, logoScale = 0.68) {
    const square = await createSquareIcon(size, logoScale);
    const radius = Math.floor(size / 2);
    const circleMask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="#ffffff"/></svg>`
    );
    return await sharp(square)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
  }

  async function createForegroundIcon(size, logoScale = 0.65) {
    const targetW = Math.round(size * logoScale);
    const scaledLogo = await sharp(logoBuffer).resize({ width: targetW }).toBuffer();
    return await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: scaledLogo, gravity: 'center' }])
      .png()
      .toBuffer();
  }

  async function createSolidBackgroundIcon(size) {
    return await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BG_COLOR,
      },
    })
      .png()
      .toBuffer();
  }

  const androidDensities = {
    ldpi: 36,
    mdpi: 48,
    hdpi: 72,
    xhdpi: 96,
    xxhdpi: 144,
    xxxhdpi: 192,
  };

  for (const [density, size] of Object.entries(androidDensities)) {
    const dir = path.join(resDir, `mipmap-${density}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // ic_launcher.png
    const launcherBuf = await createSquareIcon(size, 0.74);
    await sharp(launcherBuf).toFile(path.join(dir, 'ic_launcher.png'));

    // ic_launcher_round.png
    const roundBuf = await createRoundIcon(size, 0.68);
    await sharp(roundBuf).toFile(path.join(dir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png (Adaptive icon layer)
    const fgBuf = await createForegroundIcon(size, 0.64);
    await sharp(fgBuf).toFile(path.join(dir, 'ic_launcher_foreground.png'));

    // ic_launcher_background.png
    const bgBuf = await createSolidBackgroundIcon(size);
    await sharp(bgBuf).toFile(path.join(dir, 'ic_launcher_background.png'));

    console.log(`Generated Android mipmap-${density} (${size}x${size}) launcher icons`);
  }

  // 2B. Update Android values/ic_launcher_background.xml
  const icLauncherBgXml = path.join(resDir, 'values/ic_launcher_background.xml');
  if (fs.existsSync(icLauncherBgXml)) {
    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${BG_HEX}</color>
</resources>
`;
    fs.writeFileSync(icLauncherBgXml, xmlContent);
    console.log('Updated values/ic_launcher_background.xml to', BG_HEX);
  }

  // Clean up any stale vector drawables that could override mipmaps
  const oldFgXml = path.join(resDir, 'drawable-v24/ic_launcher_foreground.xml');
  if (fs.existsSync(oldFgXml)) {
    fs.unlinkSync(oldFgXml);
    console.log('Removed stale drawable-v24/ic_launcher_foreground.xml');
  }
  const oldBgXml = path.join(resDir, 'drawable/ic_launcher_background.xml');
  if (fs.existsSync(oldBgXml)) {
    fs.unlinkSync(oldBgXml);
    console.log('Removed stale drawable/ic_launcher_background.xml');
  }

  // 2C. Web / Next.js icons in src/app/
  const appDir = path.join(__dirname, '../src/app');

  // src/app/icon.png (512x512)
  const webIcon512 = await createSquareIcon(512, 0.75);
  await sharp(webIcon512).toFile(path.join(appDir, 'icon.png'));
  console.log('Updated src/app/icon.png (512x512)');

  // src/app/apple-icon.png (180x180)
  const appleIcon = await createSquareIcon(180, 0.75);
  await sharp(appleIcon).toFile(path.join(appDir, 'apple-icon.png'));
  console.log('Updated src/app/apple-icon.png (180x180)');

  // src/app/favicon.ico (48x48 png format saved as favicon.ico)
  const favicon48 = await createSquareIcon(48, 0.75);
  await sharp(favicon48).toFile(path.join(appDir, 'favicon.ico'));
  console.log('Updated src/app/favicon.ico (48x48)');

  // 2D. Web PWA manifest icons in public/assets/icons/
  const iconsDir = path.join(__dirname, '../public/assets/icons');
  const manifestSizes = [48, 72, 96, 128, 192, 256, 512];

  for (const s of manifestSizes) {
    const iconBuf = await createSquareIcon(s, 0.75);
    // save webp
    await sharp(iconBuf).webp({ quality: 90 }).toFile(path.join(iconsDir, `icon-${s}.webp`));
    // also save png
    await sharp(iconBuf).png().toFile(path.join(iconsDir, `icon-${s}.png`));
    console.log(`Generated PWA icon: icon-${s}.webp & png`);
  }

  console.log('\nAll assets generated successfully!');
}

run().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
