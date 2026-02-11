"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  apelido: string;
  telefone: string;
  pix: string;
};

type Ciclo = {
  id: string;
  user_id: string;
  pagou_taxa: boolean;
  recebeu: boolean;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cicloAtivo, setCicloAtivo] = useState<Ciclo | null>(null);
  const [fila, setFila] = useState<Ciclo[]>([]);
  const [posicao, setPosicao] = useState(0);

  const compartilharImagem = async () => {
  try {
    const imageUrl = "/recebi-asos.png";

    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const file = new File([blob], "recebi-asos.png", {
      type: blob.type,
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Eu recebi da ASOOS!",
        files: [file],
      });
    } else {
      alert(
        "Compartilhamento de imagem não suportado neste navegador. Use o celular."
      );
    }
  } catch (error) {
    console.error("Erro ao compartilhar imagem:", error);
    alert("Erro ao tentar compartilhar a imagem.");
  }
};

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth");
        return;
      }

      const { data: perfil } = await supabase
        .from("profiles")
        .select("id, apelido, telefone, pix")
        .eq("id", user.id)
        .single();

      if (!perfil) {
        router.replace("/auth");
        return;
      }

      setProfile(perfil);

      const { data: ciclos } = await supabase
        .from("ciclos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const ciclo = ciclos?.[0];

      /* 1️⃣ NUNCA TEVE CICLO */
      if (!ciclo) {
        router.replace("/checkout");
        return;
      }

      /* 2️⃣ CICLO NÃO PAGO */
      if (!ciclo.pagou_taxa) {
        router.replace("/checkout");
        return;
      }

      /* 3️⃣ CICLO CONCLUÍDO */
      if (ciclo.recebeu) {
        setCicloAtivo(null);
        setLoading(false);
        return;
      }

      /* 4️⃣ CICLO ATIVO */
      setCicloAtivo(ciclo);

      const { data: filaAtiva } = await supabase
        .from("ciclos")
        .select("*")
        .eq("pagou_taxa", true)
        .eq("recebeu", false)
        .order("created_at", { ascending: true });

      if (filaAtiva) {
        const index = filaAtiva.findIndex(c => c.id === ciclo.id);
        setFila(filaAtiva);
        setPosicao(index >= 0 ? index + 1 : 0);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading || !profile) {
    return (
      <main className="min-h-screen bg-[#0B0D10] text-white flex items-center justify-center">
        Carregando...
      </main>
    );
  }

  /* DASHBOARD ESPECIAL */
  if (!cicloAtivo) {
    return (
      <main className="min-h-screen bg-[#0F2A1F] text-white px-6 py-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-[#00C48C] mb-4">
            ISSO É ASOS...
          </h1>

          <p className="text-gray-300 mb-8">
            Parabens, o dinheiro já está na sua conta!!
          </p>

<img
  src="/recebi-asos.png"
  alt="Recebi do ASOS"
  className="mx-auto mb-1 max-w-xs rounded-lg"
/>

<button
  onClick={compartilharImagem}
  className="mx-auto mb-10 flex items-center justify-center gap-2 bg-[#00C48C] text-black px-6 py-3 rounded-md font-semibold hover:opacity-90 transition"
>
  Compartilhar imagem
</button>


          <div className="border border-[#00C48C] rounded-xl p-8 bg-[#0B3A2A]">
            <p className="mb-6 text-lg">
              Deseja participar novamente do ASOS?
            </p>

            <button
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                await supabase.from("ciclos").insert({
                  user_id: user.id,
                  pagou_taxa: false,
                  recebeu: false,
                });

                router.replace("/checkout");
              }}
              className="bg-[#00C48C] text-black px-6 py-3 rounded-md font-semibold"
            >
              Entrar em um novo ciclo
            </button>
          </div>

          <button
            onClick={logout}
            className="mt-10 text-sm text-gray-400 hover:text-red-400"
          >
            Sair
          </button>
        </div>
      </main>
    );
  }

  /* DASHBOARD NORMAL */
  const total = fila.length;
  const faltam = posicao > 0 ? posicao - 1 : 0;
  const progresso =
    total > 0 ? Math.round(((total - faltam) / total) * 100) : 0;
  const proximo = posicao === 1;

  return (
    <main className="min-h-screen bg-[#0B0D10] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold">Painel ASOS</h1>
            <p className="text-gray-400">Bem-vindo, {profile.apelido}</p>
          </div>

          <button
            onClick={logout}
            className="border border-[#2A2F38] px-5 py-2 rounded-md text-sm hover:border-red-500 transition"
          >
            Sair
          </button>
        </div>

        <div className="border border-[#2A2F38] rounded-xl p-8 mb-10">
          <h2 className="text-xl font-semibold mb-4">Aqui é onde a mágica acontece!!</h2>
          <p className="text-gray-400">
            Multiplique essa ideia, quanto mais você multiplica, mais rápido você recebe!
          </p>
        </div>

        <div className={`border rounded-xl p-8 ${proximo ? "border-[#00C48C] bg-[#00C48C]/10" : "border-[#2A2F38]"}`}>
          <h2 className="text-xl font-semibold mb-2">Sua posição na fila</h2>
          <p className="text-3xl font-bold mb-2">Posição #{posicao}</p>

          <p className={`mb-6 ${proximo ? "text-[#00C48C]" : "text-gray-400"}`}>
            {proximo
              ? "Você é o próximo a receber"
              : `Faltam ${faltam} pessoas para você receber`}
          </p>

          <div className="w-full bg-[#1A1D23] rounded-full h-3 mb-6">
            <div className="h-full bg-[#00C48C]" style={{ width: `${progresso}%` }} />
          </div>

          <p className="text-xs text-gray-500">
            Progresso na fila: {progresso}%
          </p>
        </div>
      </div>
    </main>
  );
}