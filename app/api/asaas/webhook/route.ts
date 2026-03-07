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

    console.log("WEBHOOK ASAAS:", payload.event);

    if (!payload?.event) {
      return NextResponse.json({ ok: true });
    }

    // Só processa pagamento recebido
    if (payload.event !== "PAYMENT_RECEIVED") {
      return NextResponse.json({ ok: true });
    }

    const payment = payload.payment;

    const cicloId = payment.externalReference;

    // 🔒 Busca o ciclo correto
    const { data: ciclo } = await supabase
      .from("ciclos")
      .select("id, pagou_taxa")
      .eq("id", cicloId)
      .single();

    if (!ciclo) {
      console.error("Ciclo não encontrado:", cicloId);
      return NextResponse.json({ ok: true });
    }

    // Idempotência
    if (ciclo.pagou_taxa === true) {
      console.log("Pagamento já processado");
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