'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Tienda, Producto } from '@/lib/types';
import { createProducto } from '@/lib/services/productos';
import { uploadProductImage, compressImage } from '@/lib/services/storage';
import { Camera, Image as ImageIcon, Package, Plus, Minus, Loader2, CheckCircle2, X } from 'lucide-react';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  tienda: Tienda;
  currentProductsCount?: number;
  onSuccess?: (newProduct: Producto) => void;
  onUpgradeRequired?: () => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  tienda,
  currentProductsCount = 0,
  onSuccess,
  onUpgradeRequired,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [stock, setStock] = useState<number>(10);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resetForm = () => {
    setNombre('');
    setPrecio('');
    setDescripcion('');
    setStock(10);
    setImageFile(null);
    setImagePreview(null);
    setErrorMsg('');
    setLoading(false);
    setUploadingImage(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setUploadingImage(true);

    try {
      // Comprimir imagen y generar vista previa inmediata
      const { dataUrl } = await compressImage(file);
      setImageFile(file);
      setImagePreview(dataUrl);
    } catch (err) {
      console.error('Error al procesar foto:', err);
      setErrorMsg('No se pudo procesar la imagen seleccionada.');
    } finally {
      setUploadingImage(false);
      // Limpiar el input para permitir seleccionar la misma foto nuevamente si se desea
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !precio) {
      setErrorMsg('Ingresa el nombre y el precio del producto.');
      return;
    }

    // Validar límite del Plan Gratuito (Max 5 productos)
    const maxAllowed = tienda.max_productos || 5;
    if (tienda.plan === 'gratis' && currentProductsCount >= maxAllowed) {
      handleClose();
      if (onUpgradeRequired) onUpgradeRequired();
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let finalImageUrl: string | undefined = undefined;

      // Si se cargó una foto, subirla al storage de la tienda
      if (imageFile) {
        finalImageUrl = await uploadProductImage(imageFile, tienda.id);
      } else if (imagePreview) {
        finalImageUrl = imagePreview;
      }

      const numericPrice = parseFloat(precio) || 0;
      const numericStock = parseInt(stock.toString()) || 0;

      const created = await createProducto({
        tienda_id: tienda.id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        precio: numericPrice,
        stock: numericStock,
        stock_minimo: 3,
        imagen_url: finalImageUrl,
        disponible: true,
      });

      if (created) {
        if (onSuccess) onSuccess(created);
        handleClose();
      } else {
        setErrorMsg('No se pudo guardar el producto. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error al crear producto:', err);
      setErrorMsg('Ocurrió un error inesperado al guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cargar Nuevo Producto">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Input Ocultos para Cámara y Galería */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Sección de Foto / Cámara Móvil */}
        <div>
          <label className="block font-bold text-[#1C2434] mb-1.5">
            Foto del Producto (Cámara o Galería)
          </label>

          {imagePreview ? (
            <div className="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-[#3C50E0]/40 group shadow-inner">
              <img
                src={imagePreview}
                alt="Vista previa del producto"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="bg-white/90 hover:bg-white text-[#1C2434] p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
                >
                  <Camera size={16} /> Tomar otra
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  title="Eliminar foto"
                >
                  <X size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 sm:hidden cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploadingImage}
                className="p-4 rounded-xl border-2 border-dashed border-[#3C50E0]/50 bg-[#3C50E0]/5 hover:bg-[#3C50E0]/10 text-[#3C50E0] font-bold text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <div className="w-10 h-10 rounded-full bg-[#3C50E0] text-white flex items-center justify-center shadow-md">
                  <Camera size={20} />
                </div>
                <div>
                  <span className="block font-black text-xs">Sacar Foto</span>
                  <span className="text-[10px] text-[#64748B] font-medium">Usa la cámara</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingImage}
                className="p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#3C50E0] bg-gray-50 hover:bg-white text-gray-700 font-bold text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shadow-xs">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <span className="block font-black text-xs">Desde Galería</span>
                  <span className="text-[10px] text-[#64748B] font-medium">Subir archivo</span>
                </div>
              </button>
            </div>
          )}

          {uploadingImage && (
            <div className="flex items-center gap-2 text-[#3C50E0] font-bold text-xs mt-2 justify-center">
              <Loader2 size={16} className="animate-spin" /> Procesando foto...
            </div>
          )}
        </div>

        {/* Nombre del Producto */}
        <div>
          <label className="block font-bold text-[#1C2434] mb-1">Nombre del Producto *</label>
          <input
            type="text"
            required
            placeholder="Ej: Zapatillas Urbanas Negras"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border rounded-xl border-[#E2E8F0] focus:border-[#3C50E0] text-sm font-semibold"
          />
        </div>

        {/* Precio y Stock en Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-[#1C2434] mb-1">
              Precio ({tienda.moneda || 'USD'}) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-xs">
                {tienda.moneda === 'BOB' ? 'Bs' : '$'}
              </span>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 bg-white border rounded-xl border-[#E2E8F0] focus:border-[#3C50E0] text-base font-extrabold text-[#3C50E0]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#1C2434] mb-1">Cantidad Disponible (Stock) *</label>
            <div className="flex items-center border rounded-xl border-[#E2E8F0] bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setStock((prev) => Math.max(0, prev - 1))}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer"
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="w-full text-center font-black text-sm text-[#1C2434] focus:outline-hidden py-2"
              />
              <button
                type="button"
                onClick={() => setStock((prev) => prev + 1)}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Nota / Descripción corta */}
        <div>
          <label className="block font-bold text-[#1C2434] mb-1">
            Nota o Detalles (Opcional)
          </label>
          <textarea
            rows={2}
            placeholder="Ej: Tallas disponibles del 38 al 42. Envíos gratis por compras mayores a dos unidades..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border rounded-xl border-[#E2E8F0] focus:border-[#3C50E0] text-xs"
          />
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-[#D34053] font-bold p-3 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-xs cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="w-2/3 bg-[#3C50E0] hover:bg-[#2e3fb8] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Publicar Producto
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
