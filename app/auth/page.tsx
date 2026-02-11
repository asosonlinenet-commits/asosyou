"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

function gerarEmailPorTelefone(telefone: string) {
  const limpo = telefone.replace(/\D/g, "");
  return `user${limpo}@gmail.com`;
}

function normalizarTelefone(telefone: string) {
  return telefone.replace(/\D/g, "");
}

export default function AuthPage() {
  const [modo, setModo] = useState<"cadastro" | "login">("cadastro");
  const [loading, setLoading] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    apelido: "",
    telefone: "",
    telefoneConfirm: "",
    pix: "",
    pixConfirm: "",
    senha: "",
    login: "",
  });

  /* =========================
     CADASTRO
  ========================= */
  async function cadastrar() {
    if (loading) return;

    if (form.telefone !== form.telefoneConfirm)
      return alert("Os telefones não conferem");

    if (form.pix !== form.pixConfirm)
      return alert("As chaves Pix não conferem");

    setLoading(true);

    const telefoneLimpo = normalizarTelefone(form.telefone);
    const email = gerarEmailPorTelefone(telefoneLimpo);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.senha,
    });

    if (error || !data.user) {
      setLoading(false);
      return alert(error?.message || "Erro no cadastro");
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        apelido: form.apelido,
        telefone: telefoneLimpo,
        pix: form.pix,
      })
      .eq("id", data.user.id);

    if (updateError) {
      setLoading(false);
      return alert("Erro ao atualizar perfil");
    }

    setLoading(false);
    router.replace("/checkout");
  }

  /* =========================
     LOGIN
  ========================= */
  async function login() {
    if (loading) return;
    setLoading(true);

    const loginInput = form.login.trim();
    const telefoneLimpo = loginInput.replace(/\D/g, "");

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("telefone")
      .or(`telefone.eq.${telefoneLimpo},apelido.eq.${loginInput}`)
      .single();

    if (error || !profile) {
      setLoading(false);
      return alert("Usuário não encontrado");
    }

    const email = `user${profile.telefone}@gmail.com`;

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: form.senha,
    });

    setLoading(false);

    if (authError) {
      return alert("Login inválido");
    }

    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#0B0D10] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-[#2A2F38] rounded-xl p-8">
        <div className="flex mb-8">
          <button
            type="button"
            onClick={() => setModo("cadastro")}
            className={`flex-1 py-2 ${
              modo === "cadastro" ? "text-[#00C48C]" : "text-gray-500"
            }`}
          >
            Cadastro
          </button>
          <button
            type="button"
            onClick={() => setModo("login")}
            className={`flex-1 py-2 ${
              modo === "login" ? "text-[#00C48C]" : "text-gray-500"
            }`}
          >
            Login
          </button>
        </div>

        {modo === "cadastro" ? (
          <div className="space-y-4">
            <input
              className="w-full bg-black border border-[#2A2F38] rounded-md px-4 py-3"
              placeholder="Apelido"
              onChange={(e) => setForm({ ...form, apelido: e.target.value })}
            />
            <input
              className="w-full bg-black border border-[#2A2F38] rounded-md px-4 py-3"
              placeholder="Telefone"
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
            <input
              className="w-full bg-black border border-[#2A2F38] rounded-md px-4 py-3"
              placeholder="Confirmar telefone"
              onChange={(e) =>
                setForm({ ...form, telefoneConfirm: e.target.value })
              }
            />
            <input
              className="w-full bg-black border border-[#2A2F38] rounded-md px-4 py-3"
              placeholder="Chave Pix"
              onChange={(e) => setForm({ ...form, pix: e.target.value })}
            />
            <input
              className="w-full bg-black border border-[#2A2F38] rounded-md px-4 py-3"
              placeholder="Confirmar chave Pix"
              onChange={(e) =>
                setForm({ ...form, pixConfirm: e.target.value })
              }
            />

            <div className="relative">
              <input
                type={verSenha ? "text" : "password"}
                className="w-full bg-black border border-[#2A2F38] rounded-md px-4 py-3 pr-14"
                placeholder="Senha"
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setVerSenha(!verSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                {verSenha ? "Ocultar" : "Ver"}
              </button>
            </div>

            <button
              type="button"
              onClick={cadastrar}
              disabled={loading}
              className="w-full bg-[#00C48C] text-black py-3 rounded-md font-semibold disabled:opacity-50"
            >
              {loading ? "Processando..." : "FAZER PARTE"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              className="w-full bg-black border border-[#2A2F38] rounded-md px-4 py-3"
              placeholder="Telefone ou Apelido"
              onChange={(e) => setForm({ ...form, login: e.target.value })}
            />

            <div className="relative">
              <input
                type={verSenha ? "text" : "password"}
                className="w-full bg-black border border-[#2A2F38] rounded-md px-4 py-3 pr-14"
                placeholder="Senha"
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setVerSenha(!verSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                {verSenha ? "Ocultar" : "Ver"}
              </button>
            </div>

            <button
              type="button"
              onClick={login}
              disabled={loading}
              className="w-full bg-[#00C48C] text-black py-3 rounded-md font-semibold disabled:opacity-50"
            >
              {loading ? "Entrando..." : "ENTRAR"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}