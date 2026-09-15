'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyPhoneOtp, requestPhoneOtp } from '@/lib/services/auth';
import { Store, Smartphone, ArrowRight, Bot, CheckCircle2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneInput, setPhoneInput] = useState('78490780');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);

  useEffect(() => {
    const urlPhone = searchParams.get('phone');
    const urlOtp = searchParams.get('otp');

    if (urlPhone && urlOtp) {
      setAutoLoggingIn(true);
      setPhoneInput(urlPhone);
      verifyPhoneOtp(urlPhone, urlOtp).then((res) => {
        if (res.success && res.redirectUrl) {
          router.push(res.redirectUrl);
        } else {
          setAutoLoggingIn(false);
          setErrorMsg(res.error || 'Código OTP inválido o expirado.');
        }
      });
    }
  }, [searchParams, router]);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneInput.trim()) {
      setErrorMsg('Por favor ingresa tu número de celular o WhatsApp.');
      return;
    }

    setErrorMsg('');
    const { waUrl } = await requestPhoneOtp(phoneInput);
    setStep(2);
    // Abrir WhatsApp para recibir el código de Sarita IA
    window.open(waUrl, '_blank');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCodeInput.trim()) {
      setErrorMsg('Ingresa el código de 4 dígitos enviado a tu WhatsApp.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await verifyPhoneOtp(phoneInput, otpCodeInput);
    setLoading(false);

    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl);
    } else {
      setErrorMsg(res.error || 'Código incorrecto. Revisa el código de 4 dígitos enviado.');
    }
  };

  if (autoLoggingIn) {
    return (
      <div className="bg-white border border-[#E2E8F0] shadow-xl rounded-2xl w-full max-w-md p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#3C50E0] text-white flex items-center justify-center font-bold mx-auto animate-bounce shadow-lg">
          <Bot size={28} />
        </div>
        <h3 className="font-extrabold text-base text-[#1C2434]">Validando Código de Acceso...</h3>
        <p className="text-xs text-[#64748B]">Iniciando sesión en tu tienda en 1-clic</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E8F0] shadow-xl rounded-2xl w-full max-w-md p-8 space-y-6">
      {/* Header Login */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#3C50E0] text-white flex items-center justify-center font-bold mx-auto shadow-md">
          <Store size={26} />
        </div>
        <h2 className="text-2xl font-extrabold text-[#1C2434]">Iniciar Sesión en tu Tienda</h2>
        <p className="text-xs text-[#64748B]">Validación de seguridad por WhatsApp</p>
      </div>

      {step === 1 ? (
        /* PASO 1: Ingreso de Número de Celular */
        <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#1C2434] mb-1">Tu Número de Celular / WhatsApp</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 text-[#3C50E0]" size={18} />
              <input
                type="text"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Ej: 78490780 o 59178490780"
                className="w-full pl-10 pr-3.5 py-3 border rounded-xl border-[#E2E8F0] focus:border-[#3C50E0] text-base font-extrabold text-[#3C50E0]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-[#D34053] font-bold bg-red-50 p-3 rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#3C50E0] hover:bg-[#2e3fb8] text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Enviar Código de Acceso <ArrowRight size={16} />
          </button>
        </form>
      ) : (
        /* PASO 2: Ingreso de Código OTP */
        <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
          <div className="text-center space-y-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
            <p className="text-xs text-[#64748B]">Código enviado a tu WhatsApp:</p>
            <p className="text-base font-black text-[#3C50E0]">{phoneInput}</p>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-[#1C2434] text-center">Ingresa el Código de 4 Dígitos</label>
            <input
              type="text"
              maxLength={4}
              required
              value={otpCodeInput}
              onChange={(e) => setOtpCodeInput(e.target.value)}
              placeholder="0000"
              className="w-full px-3 py-3 border rounded-xl border-[#E2E8F0] focus:border-[#3C50E0] text-center text-2xl font-black tracking-widest text-[#3C50E0]"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-[#D34053] font-bold bg-red-50 p-2.5 rounded-lg border border-red-200 text-center">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3C50E0] hover:bg-[#2e3fb8] text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Verificando...' : 'Verificar e Ingresar'} <CheckCircle2 size={16} />
          </button>

          <div className="flex justify-between items-center pt-2 text-[11px] text-[#64748B]">
            <button
              type="button"
              onClick={() => handleRequestOtp()}
              className="text-[#3C50E0] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} /> Reenviar código
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtpCodeInput('');
                setErrorMsg('');
              }}
              className="text-gray-500 hover:text-gray-700 font-bold hover:underline cursor-pointer"
            >
              Cambiar número
            </button>
          </div>
        </form>
      )}

      <div className="text-center pt-4 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
        <p>¿Quieres vender por WhatsApp? <Link href="/crear-tienda" className="text-[#3C50E0] font-bold">Crear Tienda Gratis</Link>.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs text-gray-500">Cargando acceso...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
