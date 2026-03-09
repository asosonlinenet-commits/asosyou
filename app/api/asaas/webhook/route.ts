/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const asaas = axios.create({
  baseURL: "https://api.asaas.com/v3",
  headers: {
    access_token: process.env.ASAAS_API_KEY!,
    "Content-Type": "application/json"
  }
});

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    console.log("WEBHOOK EVENT:", payload.event);

    if (payload.event !== "PAYMENT_RECEIVED") {
      return NextResponse.json({ ok: true });
    }

    const payment = payload.payment;

    // 🔎 BUSCA O PAGAMENTO DIRETO NA API ASAAS
    const { data } = await asaas.get(`/payments/${payment.id}`);

    // 🔒 IGNORA PAGAMENTOS QUE NÃO VIERAM DO SISTEMA
    if (!data.externalReference) {
      console.log("Pagamento ignorado - não pertence ao sistema");
      return NextResponse.json({ ok: true });
    }

    const cicloId = String(data.externalReference);

    const { data: ciclo } = await supabase
      .from("ciclos")
      .select("id, pagou_taxa")
      .eq("id", cicloId)
      .maybeSingle();

    if (!ciclo) {
      console.log("Ciclo não encontrado:", cicloId);
      return NextResponse.json({ ok: true });
    }

    if (ciclo.pagou_taxa === true) {
      console.log("Pagamento já processado:", cicloId);
      return NextResponse.json({ ok: true });
    }

    const { error } = await supabase
      .from("ciclos")
      .update({
        pagou_taxa: true,
        asaas_payment_id: data.id
      })
      .eq("id", cicloId);

    if (error) {
      throw error;
    }

    console.log("CICLO LIBERADO:", cicloId);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("ERRO WEBHOOK:", err.message);
    return NextResponse.json({ ok: true });
  }
}