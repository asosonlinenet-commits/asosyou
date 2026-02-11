/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import axios from "axios";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId é obrigatório" },
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

    /* 1️⃣ BUSCA PAGAMENTO */
    const paymentRes = await api.get(`/payments/${paymentId}`);
    const payment = paymentRes.data;

    /* 2️⃣ BUSCA PIX */
    let pixData = null;

    try {
      const pixRes = await api.get(`/payments/${paymentId}/pixQrCode`);
      pixData = pixRes.data;
    } catch {
      // PIX pode ainda não estar disponível
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        pixQrCode: pixData?.encodedImage || null,
        pixPayload: pixData?.payload || null,
        status: payment.status,
      },
    });
  } catch (err: any) {
    console.error(
      "ERRO PAYMENT DETAILS:",
      err?.response?.data || err.message
    );

    return NextResponse.json(
      { error: "Erro ao buscar dados do pagamento" },
      { status: 500 }
    );
  }
}