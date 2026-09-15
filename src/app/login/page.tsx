'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyPhoneOtp, loginUserByPhone, requestPhoneOtp, SARITA_IA_WHATSAPP_NUMBER } from '@/lib/services/auth';
import { Store, Smartphone, ArrowRight, ShieldCheck, Zap, Bot, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneInput, setPhoneInput] = useState('78490780');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [waUrl, setWaUrl] = useState('');
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

  const handleRequestSaritaOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;

    setErrorMsg('');
    const { code } = requestPhoneOtp(phoneInput);
    setGeneratedCode(code);

    const msg = encodeURIComponent(`Hola Sarita IA 🤖, envíame mi código de acceso para el número +${phoneInput.replace(/\D/g, '')}`);
    const saritaWaUrl = `https://wa.me/${SARITA_IA_WHATSAPP_NUMBER}?text=${msg}`;
    setWaUrl(saritaWaUrl);
    setStep(2);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCodeInput.trim()) {
      setErrorMsg('Ingresa el código OTP de 4 dígitos para continuar.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await verifyPhoneOtp(phoneInput, otpCodeInput);
    setLoading(false);

    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl);
    } else {
      setErrorMsg(res.error || 'Código incorrecto. Revisa el código enviado.');
    }
  };

  const handleDirectLogin = async (number: string) => {
    setPhoneInput(number);
    setLoading(true);
    setErrorMsg('');

    const res = await loginUserByPhone(number);
    setLoading(false);

    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl);
    } else {
      setErrorMsg(res.error || 'No se encontró una tienda asociada a este número.');
    }
  };

  if (autoLoggingIn) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#3C50E0] text-white flex items-center justify-center font-bold mx-auto animate-bounce shadow-lg">
          <Bot size={28} />
        </div>
        <h3 className="font-extrabold text-base text-[#1C2434]">Validando Código de Sarita IA...</h3>
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
        <p className="text-xs text-[#64748B]">Validación de seguridad con Sarita IA por WhatsApp</p>
      </div>

      {/* Banner Informativo de Sarita IA */}
      <div className="bg-[#3C50E0]/10 border border-[#3C50E0]/20 p-3.5 rounded-xl flex items-start gap-3">
        <div className="p-2 rounded-lg bg-[#3C50E0] text-white flex-shrink-0 mt-0.5">
          <Bot size={18} />
        </div>
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-[#3C50E0]">Línea Oficial Sarita IA CRM: +591 78197998</p>
          <p className="text-[11px] text-[#64748B]">
            Escribe a <strong>Sarita IA</strong> en WhatsApp: <em>&quot;Sarita envíame mi código de acceso&quot;</em> para recibir tu enlace de 1-clic.
          </p>
        </div>
      </div>

      {step === 1 ? (
        /* PASO 1: Ingreso de Número y Enlace al WhatsApp Oficial de Sarita IA (+59178197998) */
        <form onSubmit={handleRequestSaritaOtp} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#1C2434] mb-1">Tu Número de Celular / WhatsApp</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-2.5 text-[#3C50E0]" size={18} />
              <input
                type="text"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Ej: 78490780 o 59178490780"
                className="w-full pl-10 pr-3.5 py-3 border rounded-xl border-[#E2E8F0] focus:border-[#3C50E0] text-base font-extrabold text-[#3C50E0]"
              />
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Tu celular registrado es: <strong>78490780</strong></p>
          </div>

          {errorMsg && (
            <div className="text-xs text-[#D34053] font-bold bg-red-50 p-3 rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              className="w-full bg-[#219653] hover:bg-[#1b7a43] text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={16} /> Pedir Código a Sarita IA (+591 78197998)
            </button>

            <button
              type="button"
              onClick={() => handleDirectLogin(phoneInput)}
              className="w-full bg-[#3C50E0] hover:bg-[#2e3fb8] text-white py-3 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Ingreso Directo Instantáneo <ArrowRight size={16} />
            </button>
          </div>
        </form>
      ) : (
        /* PASO 2: Abrir WhatsApp de Sarita IA (+591 78197998) e ingresar código OTP */
        <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
          <div className="bg-[#3C50E0]/10 border border-[#3C50E0]/20 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-[#3C50E0] font-bold text-xs">
              <Bot size={20} />
              <span>Solicitud enviada a Sarita IA (+591 78197998)</span>
            </div>

            <p className="text-xs text-[#1C2434]">
              Número ingresado: <strong className="text-[#3C50E0]">{phoneInput}</strong>
            </p>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#219653] hover:bg-[#1b7a43] text-white py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Send size={16} /> Abrir WhatsApp (+591 78197998) y Enviar Mensaje
            </a>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label className="block font-bold text-[#1C2434]">Código OTP de 4 Dígitos</label>
              <span className="text-[11px] font-extrabold text-[#3C50E0]">Tu código es: {generatedCode}</span>
            </div>

            <input
              type="text"
              maxLength={4}
              required
              value={otpCodeInput}
              onChange={(e) => setOtpCodeInput(e.target.value)}
              placeholder="Ej: 4829"
              className="w-full px-3 py-3 border rounded-xl border-[#E2E8F0] focus:border-[#3C50E0] text-center text-xl font-black tracking-widest text-[#3C50E0]"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-[#D34053] font-bold bg-red-50 p-2.5 rounded-lg border border-red-200">
              {errorMsg}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-xs hover:bg-gray-200 cursor-pointer"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 bg-[#3C50E0] hover:bg-[#2e3fb8] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Verificando...' : 'Verificar e Ingresar'} <CheckCircle2 size={16} />
            </button>
          </div>
        </form>
      )}

      {/* Acceso Rápido por Celulares de Prueba */}
      <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
        <p className="text-[11px] font-bold text-[#64748B] flex items-center gap-1 uppercase tracking-wider">
          <Zap size={14} className="text-[#FFA70B]" /> Cuentas de Prueba (Ingreso en 1-Clic):
        </p>

        <div className="grid grid-cols-1 gap-2 text-xs">
          <button
            onClick={() => handleDirectLogin('78490780')}
            className="p-3 rounded-xl border-2 border-[#3C50E0] bg-[#3C50E0]/5 hover:bg-[#3C50E0]/10 text-left transition-all flex items-center justify-between group cursor-pointer shadow-xs"
          >
            <div>
              <span className="font-black text-[#1C2434] block">📲 Tu WhatsApp (Mi Tienda Demo)</span>
              <span className="text-[11px] font-extrabold text-[#3C50E0]">Celular: 78490780</span>
            </div>
            <span className="text-xs font-bold text-white bg-[#3C50E0] px-2.5 py-1 rounded-lg">Entrar →</span>
          </button>

          <button
            onClick={() => handleDirectLogin('71234567')}
            className="p-3 rounded-xl border border-gray-200 hover:border-[#3C50E0] bg-gray-50 hover:bg-white text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="font-bold text-[#1C2434] block">🛒 Supermercado Central</span>
              <span className="text-[11px] font-bold text-[#3C50E0]">Celular: 71234567</span>
            </div>
            <span className="text-xs font-bold text-[#3C50E0] bg-[#3C50E0]/10 px-2.5 py-1 rounded-lg">Entrar →</span>
          </button>

          <button
            onClick={() => handleDirectLogin('superadmin')}
            className="p-3 rounded-xl border border-[#3C50E0]/30 hover:border-[#3C50E0] bg-[#3C50E0]/5 hover:bg-[#3C50E0]/10 text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="font-bold text-[#3C50E0] flex items-center gap-1">
                <ShieldCheck size={16} /> 👑 Panel SuperAdmin
              </span>
              <span className="text-[11px] text-[#64748B]">Acceso Global de Plataforma</span>
            </div>
            <span className="text-xs font-bold text-white bg-[#3C50E0] px-2.5 py-1 rounded-lg">SuperAdmin →</span>
          </button>
        </div>
      </div>

      <div className="text-center pt-2 text-[11px] text-[#64748B]">
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
