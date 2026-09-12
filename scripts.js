let prompt = `Você é um designer web premiado e Programador.
Crie uma landing page COMPLETA e VISUALMENTE IMPRESSIONANTE para o negocio descrito.
Regras de resposta:
                    - Responda SOMENTE com HTML e CSS puros
                    - Não use crases, markdown ou explicações
                    - Não use tags <img>

                    Identidade visual (capriche e surpreenda):
                    - Invente uma paleta de cores única que combine com a essência do negócio
                    - Escolha uma Google Font marcante via @import
                    - Use emojis grandes no lugar de imagens
                    - Use CSS moderno: gradientes, sombras, animações sutis, layout generoso, tipografia forte

                    Estrutura da página:
                    - Header com nome do negócio e menu
                    - Hero impactante com título, subtítulo e botão CTA
                    - Seção de diferenciais com emojis
                    - Depoimento de cliente
                    - Footer com contato

Todo o conteúdo em português, criativo e específico para o negócio.`;

const botao = document.querySelector(".botao-gerar");
const textareaEl = document.querySelector(".texto-pagina");
const espacoCodigo = document.querySelector(".bloco-codigo");
const espacoSite = document.querySelector(".bloco-site");
const mensagemErro = document.querySelector(".mensagem-erro");

async function gerarCodigo() {
  const textoNegocio = textareaEl.value.trim();

  esconderErro();

  if (!textoNegocio) {
    mostrarErro("Descreva o seu negócio antes de gerar a página.");
    textareaEl.focus();
    return;
  }

  definirCarregando(true);

  try {
    const resposta = await fetch("/api/gerar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: textoNegocio },
        ],
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || "Não foi possível gerar a página. Tente novamente.");
    }

    const resultado = dados.choices?.[0]?.message?.content;

    if (!resultado) {
      throw new Error("A IA não retornou nenhum conteúdo. Tente descrever o negócio de outra forma.");
    }

    espacoCodigo.textContent = resultado;
    espacoSite.srcdoc = resultado;
  } catch (erro) {
    console.error("Erro ao gerar página:", erro);
    mostrarErro(erro.message || "Algo deu errado. Tente novamente em instantes.");
  } finally {
    definirCarregando(false);
  }
}

function definirCarregando(carregando) {
  botao.disabled = carregando;
  botao.textContent = carregando ? "⏳ Gerando..." : "⚡ Gerar";
}

function mostrarErro(texto) {
  if (!mensagemErro) return;
  mensagemErro.textContent = texto;
  mensagemErro.style.display = "block";
}

function esconderErro() {
  if (!mensagemErro) return;
  mensagemErro.style.display = "none";
}

botao.addEventListener("click", gerarCodigo);
