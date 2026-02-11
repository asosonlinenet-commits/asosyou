/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { valor, externalReference } = await req.json();

    if (!valor || !externalReference) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      );
    }

    /* 1️⃣ BUSCA CICLO ABERTO */
    const { data: ciclos } = await supabase
      .from("ciclos")
      .select("*")
      .eq("user_id", externalReference)
      .eq("recebeu", false)
      .order("created_at", { ascending: false })
      .limit(1);

    const ciclo = ciclos?.[0];

    if (!ciclo) {
      return NextResponse.json(
        { error: "Nenhum ciclo ativo encontrado" },
        { status: 400 }
      );
    }

    if (ciclo.pagou_taxa) {
      return NextResponse.json(
        { error: "Ciclo já pago" },
        { status: 400 }
      );
    }

    const api = axios.create({
      baseURL:
        process.env.ASAAS_ENV === "sandbox"
          ? "https://api-sandbox.asaas.com/v3"
          : "https://api.asaas.com/v3",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY!,
      },
    });

    /* 2️⃣ SE JÁ TEM COBRANÇA → BUSCA NO ASAAS */
    if (ciclo.asaas_payment_id) {
      const paymentRes = await api.get(
        `/payments/${ciclo.asaas_payment_id}`
      );

      return NextResponse.json({
        success: true,
        payment: paymentRes.data,
      });
    }

    /* 3️⃣ CRIA COBRANÇA */
    const paymentRes = await api.post("/payments", {
      billingType: "PIX",
      customer: process.env.ASAAS_CUSTOMER_ID,
      value: valor,
      dueDate: new Date().toISOString().split("T")[0],
      description: "Taxa de entrada ASOS",
      externalReference: ciclo.id,
    });

    const payment = paymentRes.data;

    /* 4️⃣ SALVA NO CICLO */
    await supabase
      .from("ciclos")
      .update({ asaas_payment_id: payment.id })
      .eq("id", ciclo.id);

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (err: any) {
    console.error("ERRO CREATE PAYMENT:", err?.response?.data || err.message);
    return NextResponse.json(
      { error: "Erro ao criar cobrança" },
      { status: 500 }
    );
  }
}