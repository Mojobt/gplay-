import QRCode from 'qrcode';

/**
 * Generate a high-contrast QR code Data URL for mobile scanning
 * Enables Windows PC users to scan the screen with their Android phone camera
 * to immediately download and install the APK package directly.
 */
export const generateQrDataUrl = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
};
