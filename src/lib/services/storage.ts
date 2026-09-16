import { createClient } from '../supabase/client';

/**
 * Comprime una imagen en el cliente usando Canvas para optimizar subida en móviles
 */
export async function compressImage(file: File, maxDimension = 1080, quality = 0.82): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('No se pudo obtener el contexto 2D del Canvas'));
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              reject(new Error('Error al comprimir el archivo'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen seleccionada'));
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
  });
}

/**
 * Sube una imagen de producto a Supabase Storage con fallback a DataURL
 */
export async function uploadProductImage(file: File, tiendaId: string): Promise<string> {
  try {
    const { blob, dataUrl } = await compressImage(file);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      return dataUrl;
    }

    const supabase = createClient();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${tiendaId}/${Date.now()}-${cleanName}.jpg`;

    const { data, error } = await supabase.storage
      .from('productos')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error || !data) {
      console.warn('Fallo la subida a Supabase storage, usando DataURL de respaldo:', error);
      return dataUrl;
    }

    const { data: publicData } = supabase.storage.from('productos').getPublicUrl(fileName);
    return publicData?.publicUrl || dataUrl;
  } catch (err) {
    console.error('Error procesando imagen de producto:', err);
    // Retornar dataURL local si ocurre cualquier error
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}
