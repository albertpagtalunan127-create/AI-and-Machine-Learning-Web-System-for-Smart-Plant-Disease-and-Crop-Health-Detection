// AI service — Teachable Machine integration for mobile
// TensorFlow is lazy-initialised only when initAI() is called,
// keeping the module importable even before TF is ready.

export interface PredictionResult {
  className: string;
  probability: number;
}

let tfReady = false;

/**
 * Call once at app start (or lazily before the first scan).
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function initAI(): Promise<void> {
  if (tfReady) return;
  try {
    const tf = await import('@tensorflow/tfjs');
    await tf.ready();
    tfReady = true;
    console.log('[PlantGuard] TensorFlow.js ready');
  } catch (err) {
    console.warn('[PlantGuard] TF init failed — running in mock mode', err);
  }
}

/**
 * Predict disease from a base64-encoded JPEG image.
 * Returns a mock result until the real Teachable Machine model is wired up.
 */
export async function predictImage(base64Image: string): Promise<PredictionResult> {
  // TODO: replace mock with real Teachable Machine inference
  // Example real implementation:
  //   const tf = await import('@tensorflow/tfjs');
  //   const { decodeJpeg } = await import('@tensorflow/tfjs-react-native');
  //   const raw = Buffer.from(base64Image, 'base64');
  //   const tensor = decodeJpeg(raw);
  //   const model = ...; // load via bundleResourceIO or fetch
  //   const predictions = await model.predict(tensor.expandDims(0));
  //   ...

  return {
    className: 'Tomato Late Blight',
    probability: 0.92,
  };
}
