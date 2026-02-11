/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const executed = useRef(false);
  const [copiado, setCopiado] = useState(false);

  function copiarPix() {
  if (!payment?.pixPayload) return;

  navigator.clipboard.writeText(payment.pixPayload);
  setCopiado(true);

  setTimeout(() => {
    setCopiado(false);
  }, 2000);
}

  useEffect(() => {
    if (executed.current) return;
    executed.current = true;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth");
        return;
      }

      /* 1️⃣ GARANTE CICLO ABERTO */
      const { data: ciclos } = await supabase
        .from("ciclos")
        .select("*")
        .eq("user_id", user.id)
        .eq("recebeu", false)
        .order("created_at", { ascending: false })
        .limit(1);

      let ciclo = ciclos?.[0];

      if (!ciclo) {
        const { data: novoCiclo } = await supabase
          .from("ciclos")
          .insert({
            user_id: user.id,
            pagou_taxa: false,
            recebeu: false,
          })
          .select()
          .single();

        ciclo = novoCiclo;
      }

      /* 2️⃣ SE JÁ PAGOU → DASHBOARD */
      if (ciclo.pagou_taxa) {
        router.replace("/dashboard");
        return;
      }

      /* 3️⃣ CRIA OU REAPROVEITA PAGAMENTO */
      const res = await fetch("/api/asaas/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: 50,
          externalReference: user.id,
        }),
      });

      if (!res.ok) {
        alert("Erro ao gerar pagamento");
        return;
      }

      const data = await res.json();
      let paymentData = data.payment;

      /* 4️⃣ SE NÃO VEIO PIX, BUSCA DETALHES */
      if (!paymentData?.pixQrCode && paymentData?.id) {
        const detailRes = await fetch("/api/asaas/payment-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: paymentData.id }),
        });

        if (!detailRes.ok) {
          alert("Erro ao buscar dados do pagamento");
          return;
        }

        const detailData = await detailRes.json();
        paymentData = detailData.payment;
      }

      if (!paymentData?.pixQrCode || !paymentData?.pixPayload) {
        alert("Erro ao gerar pagamento");
        return;
      }

      setPayment(paymentData);
      setLoading(false);
    }

    init();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B0D10] text-white flex items-center justify-center">
        Gerando pagamento...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0D10] text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full border border-[#2A2F38] rounded-xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Finalize sua entrada no ASOS
        </h1>

        <p className="text-gray-400 mb-6">
          Escaneie o QR Code ou copie o código PIX.
        </p>

        <img
          src={`data:image/png;base64,${payment.pixQrCode}`}
          alt="PIX"
          className="mx-auto mb-4 w-52 h-52"
        />

        <textarea
          readOnly
          value={payment.pixPayload}
          className="w-full bg-black border border-[#2A2F38] rounded-md p-3 text-xs mb-4"
        />

                {/* BOTÃO COPIAR */}
        <button
          onClick={copiarPix}
          className="w-full bg-[#00C48C] text-black py-2 rounded-md font-semibold mb-4 hover:opacity-90 transition"
        >
          {copiado ? "Código copiado ✅" : "Copiar código PIX"}
        </button>

        <p className="text-xs text-gray-500">
          Após o pagamento, seu acesso será liberado automaticamente.
        </p>
      </div>
    </main>
  );
}