let ringerSource = null;
let audioBuffer = null;
let audioContext = null;

const initAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
  return audioContext;
};

const loadAudioBuffer = async () => {
  if (typeof window === "undefined") return;
  if (audioBuffer) return; 
  
  try {
    const ctx = initAudioContext();
    if (!ctx) return;
    
    const response = await fetch('/sound/bell/soundreality-telephone-ring-129620.mp3');
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.debug("[Audio] Failed to load audio buffer:", err);
  }
};

if (typeof window !== "undefined") {
  loadAudioBuffer();
}

export const playOrderChime = () => {
  if (typeof window === "undefined") return;

  try {
    const ctx = initAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    if (audioBuffer) {
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0);
    } else {
      loadAudioBuffer().then(() => {
        if (audioBuffer) {
           const source = ctx.createBufferSource();
           source.buffer = audioBuffer;
           source.connect(ctx.destination);
           source.start(0);
        }
      });
    }
  } catch (err) {
    console.debug("[Audio] Notification sound skipped:", err);
  }
};

export const startOrderRinger = () => {
  stopOrderRinger();
  
  if (typeof window === "undefined") return stopOrderRinger;
  if (window.AndroidRinger?.startRinger) {
    try {
      window.AndroidRinger.startRinger();
    } catch (e) {
      console.debug("[Audio] Native ringer start error:", e);
    }
  }

  try {
    const ctx = initAudioContext();
    if (!ctx) return stopOrderRinger;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const playLoop = () => {
      if (ringerSource) return; 
      
      if (audioBuffer) {
        ringerSource = ctx.createBufferSource();
        ringerSource.buffer = audioBuffer;
        ringerSource.loop = true; 
        ringerSource.connect(ctx.destination);
        ringerSource.start(0);
      } else {
         setTimeout(playLoop, 500);
      }
    };
    
    playLoop();
    
  } catch (err) {
    console.debug("[Audio] Notification sound error:", err);
  }
  
  return stopOrderRinger;
};

export const stopOrderRinger = () => {
  if (typeof window !== "undefined" && window.AndroidRinger?.stopRinger) {
    try {
      window.AndroidRinger.stopRinger();
    } catch (e) {
      console.debug("[Audio] Native ringer stop error:", e);
    }
  }

  if (ringerSource) {
    try {
      ringerSource.stop();
      ringerSource.disconnect();
    } catch (e) {}
    ringerSource = null;
  }
};
