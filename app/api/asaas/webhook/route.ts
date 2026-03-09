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

    console.log("WEBHOOK ASAAS EVENT:", payload.event);

    if (!payload?.event) {
      return NextResponse.json({ ok: true });
    }

    // Só processa pagamento recebido
    if (payload.event !== "PAYMENT_RECEIVED") {
      return NextResponse.json({ ok: true });
    }

    const payment = payload.payment;

    let cicloId: string | null = null;

    // 1️⃣ tenta usar externalReference
    if (payment?.externalReference) {
      cicloId = String(payment.externalReference);
      console.log("externalReference recebido:", cicloId);
    }

    let ciclo: any = null;

    // 🔎 busca pelo cicloId
    if (cicloId) {
      const { data } = await supabase
        .from("ciclos")
        .select("id, pagou_taxa")
        .eq("id", cicloId)
        .maybeSingle();

      ciclo = data;
    }

    // 2️⃣ fallback → busca pelo payment.id
    if (!ciclo && payment?.id) {
      console.log("Buscando ciclo pelo payment.id:", payment.id);

      const { data } = await supabase
        .from("ciclos")
        .select("id, pagou_taxa")
        .eq("asaas_payment_id", payment.id)
        .maybeSingle();

      ciclo = data;
      cicloId = data?.id ?? null;
    }

    if (!ciclo) {
      console.error("Ciclo não encontrado para pagamento:", payment.id);
      return NextResponse.json({ ok: true });
    }

    // Idempotência
    if (ciclo.pagou_taxa === true) {
      console.log("Pagamento já processado:", cicloId);
      return NextResponse.json({ ok: true });
    }

    // ✅ CONFIRMA PAGAMENTO NO CICLO
    const { error } = await supabase
      .from("ciclos")
      .update({
        pagou_taxa: true,
        asaas_payment_id: payment.id,
      })
      .eq("id", cicloId);

    if (error) {
      throw error;
    }

    console.log("CICLO LIBERADO COM SUCESSO:", cicloId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("ERRO WEBHOOK ASAAS:", err.message);
    return NextResponse.json({ ok: true });
  }
}