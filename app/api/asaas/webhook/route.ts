/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    console.log("WEBHOOK EVENT:", payload.event);

    if (payload.event !== "PAYMENT_RECEIVED") {
      return NextResponse.json({ ok: true });
    }

    const payment = payload.payment;

    // 🔒 IGNORA QUALQUER PIX QUE NÃO VEIO DO SISTEMA
    if (!payment?.externalReference) {
      console.log("Pagamento ignorado - sem externalReference");
      return NextResponse.json({ ok: true });
    }

    const cicloId = String(payment.externalReference);

    // 🔎 Busca o ciclo correto
    const { data: ciclo } = await supabase
      .from("ciclos")
      .select("id, pagou_taxa")
      .eq("id", cicloId)
      .maybeSingle();

    if (!ciclo) {
      console.log("Ciclo não encontrado:", cicloId);
      return NextResponse.json({ ok: true });
    }

    // 🔁 Evita processar duas vezes
    if (ciclo.pagou_taxa === true) {
      console.log("Pagamento já processado:", cicloId);
      return NextResponse.json({ ok: true });
    }

    // ✅ Libera o ciclo
    const { error } = await supabase
      .from("ciclos")
      .update({
        pagou_taxa: true,
        asaas_payment_id: payment.id
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