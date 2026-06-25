import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const cleanEnvVar = (val) => {
  if (!val) return val;
  return val.replace(/^["']|["']$/g, '').trim();
};

const keyId = cleanEnvVar(process.env.RAZORPAY_KEY_ID);
const keySecret = cleanEnvVar(process.env.RAZORPAY_KEY_SECRET);

// Log error on startup if credentials are invalid/missing
if (!keyId || !keySecret || keyId === 'rzp_test_placeholder' || keySecret === 'placeholder_secret' || keySecret === 'rzp_secret_placeholder') {
  console.error('CRITICAL: Razorpay API keys are missing or using placeholder values. Razorpay cannot be initialized.');
}

let rzpInstance = null;

export const getRazorpayInstance = () => {
  if (rzpInstance) return rzpInstance;

  if (!keyId || !keySecret || keyId === 'rzp_test_placeholder' || keySecret === 'placeholder_secret' || keySecret === 'rzp_secret_placeholder' || keyId === 'rzp_test_AtelierKey2026') {
    throw new Error('Razorpay API keys are not configured or are set to placeholder/default values. Please check your environment variables.');
  }

  const isFromEnv = !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;
  console.log('\n====== INSTANTIATING RAZORPAY SDK ======');
  console.log({
    keyId: keyId,
    secretLength: keySecret.length,
    loadedFromEnv: isFromEnv,
    mode: keyId.startsWith('rzp_test') ? 'TEST' : keyId.startsWith('rzp_live') ? 'LIVE' : 'UNKNOWN'
  });
  console.log('========================================\n');

  rzpInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
  return rzpInstance;
};
