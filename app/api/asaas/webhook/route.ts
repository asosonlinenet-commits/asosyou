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

    console.log("WEBHOOK ASAAS EVENT:", payload?.event);
    console.log("PAYLOAD COMPLETO:", payload);
    console.log("EXTERNAL REFERENCE:", payload?.payment?.externalReference);
    console.log("PAYMENT ID:", payload?.payment?.id);

    if (!payload?.event) {
      return NextResponse.json({ ok: true });
    }

    // Só processa pagamento recebido
    if (payload.event !== "PAYMENT_RECEIVED") {
      console.log("Evento ignorado:", payload.event);
      return NextResponse.json({ ok: true });
    }

    const payment = payload.payment;

    const cicloId = payment?.externalReference;

    if (!cicloId) {
      console.error("externalReference ausente no webhook");
      return NextResponse.json({ ok: true });
    }

    console.log("BUSCANDO CICLO:", cicloId);

    // 🔒 Busca o ciclo correto
    const { data: ciclo, error: cicloError } = await supabase
      .from("ciclos")
      .select("id, pagou_taxa")
      .eq("id", cicloId)
      .single();

    if (cicloError) {
      console.error("Erro ao buscar ciclo:", cicloError);
      return NextResponse.json({ ok: true });
    }

    if (!ciclo) {
      console.error("Ciclo não encontrado:", cicloId);
      return NextResponse.json({ ok: true });
    }

    // Idempotência
    if (ciclo.pagou_taxa === true) {
      console.log("Pagamento já processado para ciclo:", cicloId);
      return NextResponse.json({ ok: true });
    }

    console.log("ATUALIZANDO CICLO COMO PAGO:", cicloId);

    // ✅ CONFIRMA PAGAMENTO NO CICLO
    const { error } = await supabase
      .from("ciclos")
      .update({
        pagou_taxa: true,
        asaas_payment_id: payment.id,
      })
      .eq("id", cicloId);

    if (error) {
      console.error("Erro ao atualizar ciclo:", error);
      throw error;
    }

    console.log("CICLO LIBERADO COM SUCESSO:", cicloId);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("ERRO WEBHOOK ASAAS:", err?.message || err);
    return NextResponse.json({ ok: true });
  }
}