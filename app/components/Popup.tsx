"use client";

import { useState, useEffect } from "react";

export default function Popup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const visto = localStorage.getItem("popupVisto");
    if (!visto) {
      setShow(true);
    }
  }, []);

  const fechar = () => {
    localStorage.setItem("popupVisto", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl text-center max-w-sm">
        <h2 className="text-xl font-bold mb-2">🔞 Aviso Importante</h2>
        <p className="mb-2">Este site é para maiores de 18 anos.</p>
        <p className="mb-2">Não se trata de apostas, nem tão pouco lidar com a sorte!!</p>
        <h2 className="text-xl font-bold mb-2">Aqui você inviste R$50,00 e tem GARANTIDO R$300,00 após um trabalho simples.</h2>
        <p className="mb-4 text-sm text-gray-600">
          Quanto mais indicar, mais rápido recebe!!!.
        </p>

        <button
          onClick={fechar}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}