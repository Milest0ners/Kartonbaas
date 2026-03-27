export interface UploadResult {
  fileUrl: string;
  fileId: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
const MAX_SIZE_MB = 25;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase()) &&
      !file.name.toLowerCase().endsWith('.heic')) {
    return 'Alleen JPG, PNG en HEIC bestanden zijn toegestaan.';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `Bestand is te groot. Maximaal ${MAX_SIZE_MB} MB toegestaan.`;
  }
  return null;
}

export async function uploadToCloudinary(
  file: Buffer
): Promise<UploadResult> {
  const { v2: cloudinary } = await import('cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'kartonbaas/orders',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error(error?.message ?? 'Upload mislukt'));
          return;
        }
        resolve({
          fileUrl: result.secure_url,
          fileId: result.public_id,
        });
      }
    );

    uploadStream.end(file);
  });
}
