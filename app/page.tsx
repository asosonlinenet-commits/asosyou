export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0D10] text-white">

      {/* HERO / TOPO */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="relative max-w-5xl w-full text-center">

          {/* Glow de fundo */}
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <div className="w-[320px] h-[320px] md:w-[520px] md:h-[520px] rounded-full bg-[#00C48C]/10 blur-3xl"></div>
          </div>

          {/* Conteúdo */}
          <div className="relative z-10">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-4">
              ASOS
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-2">
              Amigos SOS
            </p>

            <p className="max-w-2xl mx-auto text-gray-400 mb-12 leading-relaxed">
              Um sistema fechado de organização entre pessoas.
              <br />
              Simples. Direto. Transparente.
            </p>

            {/* Botões */}
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
              <a
                href="/auth"
                className="bg-[#00C48C] text-black font-semibold px-10 py-4 rounded-md hover:opacity-90 transition"
              >
                FAZER PARTE AGORA
              </a>

              <a
                href="/auth"
                className="border border-[#2A2F38] px-10 py-4 rounded-md text-white hover:border-[#00C48C] transition"
              >
                LOGAR NA SUA CONTA
              </a>
            </div>

            {/* Etapas rápidas */}
            <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-400 border-t border-[#151A21] pt-10">
              <div>
                <span className="text-[#00C48C] font-semibold block mb-2">
                  1. Cadastro
                </span>
                Informações básicas e validadas.
              </div>

              <div>
                <span className="text-[#00C48C] font-semibold block mb-2">
                  2. Acesso
                </span>
                Entrada liberada após confirmação.
              </div>

              <div>
                <span className="text-[#00C48C] font-semibold block mb-2">
                  3. Acompanhamento
                </span>
                Visualização clara da sua posição.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO INFERIOR — CONCEITO */}
      <section className="border-t border-[#151A21] pt-24 pb-24">
        <div className="max-w-5xl mx-auto px-6 text-gray-300">

          {/* Sobre */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Sobre o ASOS
            </h2>
            <p className="max-w-3xl leading-relaxed text-gray-400">
              O <span className="text-white font-medium">ASOS – Amigos SOS</span> é um
              sistema privado criado para organizar pessoas em grupos fechados, com
              regras claras, entrada consciente e acompanhamento individual.
              <br /><br />
              Aqui, nada acontece por acaso. Cada etapa é registrada, cada acesso é
              validado e cada participante sabe exatamente onde está dentro do sistema.
            </p>
          </div>

          {/* Como funciona */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">
              Como funciona
            </h2>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="border border-[#2A2F38] rounded-lg p-6">
                <span className="text-[#00C48C] font-semibold block mb-3">
                  1. Cadastro validado
                </span>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Você informa seus dados básicos e solicita sua entrada no sistema.
                  Tudo é registrado e validado.
                </p>
              </div>

              <div className="border border-[#2A2F38] rounded-lg p-6">
                <span className="text-[#00C48C] font-semibold block mb-3">
                  2. Acesso controlado
                </span>
                <p className="text-gray-400 text-sm leading-relaxed">
                  O acesso só é liberado após confirmação, preservando a organização
                  e a integridade do grupo.
                </p>
              </div>

              <div className="border border-[#2A2F38] rounded-lg p-6">
                <span className="text-[#00C48C] font-semibold block mb-3">
                  3. Acompanhamento claro
                </span>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Após entrar, você acompanha sua posição e o andamento do sistema
                  de forma simples e transparente.
                </p>
              </div>
            </div>
          </div>

          {/* Princípios */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Princípios do sistema
            </h2>

            <ul className="grid md:grid-cols-2 gap-6 text-gray-400">
              <li className="border border-[#2A2F38] rounded-lg p-5">
                Organização acima de tudo
              </li>
              <li className="border border-[#2A2F38] rounded-lg p-5">
                Regras claras e iguais para todos
              </li>
              <li className="border border-[#2A2F38] rounded-lg p-5">
                Transparência em cada etapa
              </li>
              <li className="border border-[#2A2F38] rounded-lg p-5">
                Responsabilidade individual
              </li>
              <li className="border border-[#2A2F38] rounded-lg p-5 md:col-span-2">
                Respeito ao funcionamento coletivo
              </li>
            </ul>
          </div>

        </div>
      </section>

    </main>
  );
}