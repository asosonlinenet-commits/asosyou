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

    // 🔒 IGNORA EVENTOS QUE NÃO SÃO PAGAMENTO
    if (payload.event !== "PAYMENT_RECEIVED") {
      return NextResponse.json({ ok: true });
    }

    const eventId = payload.id;

    // 🔒 EVITA PROCESSAR O MESMO EVENTO MAIS DE UMA VEZ
    const { data: existing } = await supabase
      .from("asaas_events")
      .select("id")
      .eq("id", eventId)
      .maybeSingle();

    if (existing) {
      console.log("Evento já processado:", eventId);
      return NextResponse.json({ ok: true });
    }

    await supabase.from("asaas_events").insert({ id: eventId });

    const payment = payload.payment;

    // 🔎 CONFERE PAGAMENTO DIRETO NA API ASAAS
    const { data } = await asaas.get(`/payments/${payment.id}`);

    // 🔒 IGNORA PAGAMENTOS QUE NÃO FORAM CRIADOS PELO SISTEMA
    if (!data.externalReference) {
      console.log("Pagamento ignorado - não pertence ao sistema");
      return NextResponse.json({ ok: true });
    }

    // 🔎 BUSCA CICLO PELO PAYMENT ID
    const { data: ciclo } = await supabase
      .from("ciclos")
      .select("id, pagou_taxa")
      .eq("asaas_payment_id", data.id)
      .maybeSingle();

    if (!ciclo) {
      console.log("Ciclo não encontrado para payment:", data.id);
      return NextResponse.json({ ok: true });
    }

    // 🔁 EVITA PROCESSAMENTO DUPLICADO
    if (ciclo.pagou_taxa === true) {
      console.log("Pagamento já processado:", data.id);
      return NextResponse.json({ ok: true });
    }

    // ✅ LIBERA CICLO
const { error } = await supabase
  .from("ciclos")
  .update({
    pagou_taxa: true
  })
  .eq("asaas_payment_id", data.id)
  .select();

    if (error) {
      throw error;
    }

    console.log("CICLO LIBERADO:", data.id);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("ERRO WEBHOOK:", err.message);
    return NextResponse.json({ ok: true });
  }
}