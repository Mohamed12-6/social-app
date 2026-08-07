// src/lib/sound.ts

export const playNotificationSound = () => {
  try {
    // صوت إشعار ناعم مصمّم بـ Web Audio API لضمان العمل على كل المتصفحات
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioContext.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + 0.35);
  } catch {
    // تجاهل الأخطاء لو المتصفح منع الصوت التلقائي
  }
};