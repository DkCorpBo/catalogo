'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Ingresa tu usuario y contraseña de SuperAdmin.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/v1/superadmin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Guardar sesión en localStorage para persistencia del cliente
        if (typeof window !== 'undefined' && data.session) {
          localStorage.setItem('tienda_session', JSON.stringify(data.session));
        }
        router.push(data.redirectUrl || '/superadmin');
      } else {
        setErrorMsg(data.error || 'Credenciales incorrectas. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3C50E0]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#219653]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#1E293B] border border-slate-700/80 shadow-2xl rounded-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3C50E0] to-[#5165f6] text-white flex items-center justify-center font-bold mx-auto shadow-lg shadow-indigo-500/20">
              <ShieldCheck size={30} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Acceso SuperAdmin</h1>
            <p className="text-xs text-slate-400">
              Panel central de control y gestión global de tiendas
            </p>
          </div>

          {/* Formulario con Usuario y Contraseña */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-200 mb-1.5">Usuario de Administrador</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder="Ej: admin o superadmin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0] text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-[#3C50E0] focus:ring-1 focus:ring-[#3C50E0] text-sm font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-300 font-semibold bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl animate-shake">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3C50E0] hover:bg-[#2e3fb8] disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                'Verificando credenciales...'
              ) : (
                <>
                  Ingresar al Panel Global <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer del card */}
          <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <Link
              href="/"
              className="hover:text-white transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft size={13} /> Volver al Inicio
            </Link>
            <Link
              href="/login"
              className="hover:text-white transition-colors font-medium"
            >
              Login de Tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
