"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { validateEmail } from "@/lib/validate";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setEmailError("Por favor ingresa un email válido");
      return;
    }
    
    setLoading(true);
    setError(null);
    setEmailError(null);

    try {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: "/",
      });

      if (result?.error) {
        setError("Error al enviar el email. Intenta de nuevo.");
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      setError("Error al enviar el email. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Revisa tu email
            </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Enviamos un enlace mágico a <strong>{email}</strong>. Haz click en el enlace para ingresar a tu cuenta.
            </p>
          </div>
          <button
            onClick={() => setEmailSent(false)}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Volver al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Ingresar a Panels
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Ingresa tu email y te enviaremos un enlace mágico
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              className={`mt-1 block w-full rounded-lg border bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 ${
                emailError 
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500" 
                  : "border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700"
              }`}
              placeholder="tu@email.com"
            />
            {emailError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {emailError}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Enviando..." : "Enviar enlace mágico"}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Al ingresar, aceptas nuestros términos de servicio y política de privacidad.
        </div>
      </div>
    </div>
  );
}
