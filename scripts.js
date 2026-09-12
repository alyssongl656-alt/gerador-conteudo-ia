let promptBase = `Você é um designer web premiado e Programador.
Crie uma landing page COMPLETA e VISUALMENTE IMPRESSIONANTE para o negocio descrito.
Regras de resposta:
    - Responda SOMENTE com HTML e CSS puros
    - Não use crases, markdown ou explicações
    - Não use tags <img>
    - Toda seção referenciada no menu de navegação DEVE ter um id correspondente (ex: <section id="servicos">...) e o link do menu deve apontar exatamente para esse mesmo id (ex: <a href="#servicos">). Nunca crie um link com # que não tenha um elemento com esse id na página. Confira antes de responder que todo href="#algo" tem um id="algo" em algum lugar da página.
    - Os emojis usados devem representar literalmente o negócio, seus produtos ou serviços específicos descritos pelo usuário. Por exemplo: para uma loja ou oficina de carros, use emojis como 🚗🚙🏎️🔧; para uma cafeteria, use ☕🥐🍰; nunca use emojis genéricos sem relação direta com o que foi descrito

    Estrutura da página:
    - Header com nome do negócio e menu com pelo menos: Início, Diferenciais (ou Serviços), Depoimentos, Contato — cada um desses precisa ter uma seção correspondente com o id certo
    - Hero impactante com título, subtítulo e botão CTA
    - Seção de diferenciais com emojis relevantes ao negócio
    - Depoimento de cliente
    - Footer com contato

Todo o conteúdo em português, criativo e específico para o negócio.`;

const estilosDescricao = {
  moderno: "Identidade visual: invente uma paleta de cores única e moderna, com gradientes sutis, tipografia forte e emojis grandes no lugar de imagens.",
  minimalista: "Identidade visual: design minimalista, bastante espaço em branco, no máximo 2 cores, tipografia limpa e discreta, sem gradientes.",
  colorido: "Identidade visual: paleta de cores vibrante e alegre, com bastante contraste e energia, emojis grandes e coloridos.",
  corporativo: "Identidade visual: design sério e corporativo, paleta sóbria (azul-marinho, cinza, branco), tipografia clássica, sem emojis exagerados."
};

const botao = document.querySelector(".botao-gerar");
const textareaEl = document.querySelector(".texto-pagina");
const contador = document.querySelector(".contador");
const espacoCodigo = document.querySelector(".bloco-codigo");
const espacoSite = document.querySelector(".bloco-site");
const mensagemErro = document.querySelector(".mensagem-erro");
const caixaResultado = document.querySelector(".caixa-resultado");
const botaoCopiar = document.querySelector(".botao-copiar");
const botaoBaixar = document.querySelector(".botao-baixar");
const botaoTentarDeNovo = document.querySelector(".botao-tentar-de-novo");
const historicoEl = document.querySelector(".historico");
const chipsEstilo = document.querySelectorAll(".chip-estilo");

const LIMITE_CARACTERES = 500;
let estiloSelecionado = "moderno";
let ultimoResultado = "";
let tentativas = 0;
const historico = [];

textareaEl.addEventListener("input", () => {
  contador.textContent = `${textareaEl.value.length}/${LIMITE_CARACTERES}`;
});

chipsEstilo.forEach((chip) => {
  chip.addEventListener("click", () => {
    chipsEstilo.forEach((c) => c.classList.remove("ativo"));
    chip.classList.add("ativo");
    estiloSelecionado = chip.dataset.estilo;
  });
});

async function gerarCodigo(variacao) {
  const textoNegocio = textareaEl.value.trim();

  esconderErro();

  if (!textoNegocio) {
    mostrarErro("Descreva o seu negócio antes de gerar a página.");
    textareaEl.focus();
    return;
  }

  definirCarregando(true);

  try {
    let promptFinal = `${promptBase}\n\n${estilosDescricao[estiloSelecionado]}`;

    if (variacao) {
      tentativas += 1;
      promptFinal += `\n\nEsta é a tentativa número ${tentativas + 1}. Gere uma versão visualmente diferente das anteriores, com layout, cores ou estrutura distintos.`;
    } else {
      tentativas = 0;
    }

    const resposta = await fetch("/api/gerar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: promptFinal },
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

    ultimoResultado = resultado;
    mostrarResultado(resultado);
    adicionarAoHistorico(textoNegocio, resultado);
  } catch (erro) {
    console.error("Erro ao gerar página:", erro);
    mostrarErro(erro.message || "Algo deu errado. Tente novamente em instantes.");
  } finally {
    definirCarregando(false);
  }
}

function mostrarResultado(resultado) {
  espacoCodigo.textContent = resultado;
  espacoSite.srcdoc = resultado;
  caixaResultado.style.display = "flex";
}

function adicionarAoHistorico(texto, resultado) {
  historico.unshift({ texto, resultado });
  if (historico.length > 5) historico.pop();
  renderizarHistorico();
}

function renderizarHistorico() {
  historicoEl.innerHTML = "";
  if (historico.length === 0) {
    historicoEl.style.display = "none";
    return;
  }
  historicoEl.style.display = "flex";
  historico.forEach((item) => {
    const botaoItem = document.createElement("button");
    botaoItem.className = "historico-item";
    botaoItem.textContent = item.texto;
    botaoItem.title = item.texto;
    botaoItem.addEventListener("click", () => {
      ultimoResultado = item.resultado;
      mostrarResultado(item.resultado);
    });
    historicoEl.appendChild(botaoItem);
  });
}

function definirCarregando(carregando) {
  botao.disabled = carregando;
  if (carregando) {
    botao.innerHTML = 'Gerando<span class="ponto"></span><span class="ponto"></span><span class="ponto"></span>';
  } else {
    botao.textContent = "⚡ Gerar";
  }
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

botaoCopiar.addEventListener("click", async () => {
  if (!ultimoResultado) return;
  try {
    await navigator.clipboard.writeText(ultimoResultado);
    const textoOriginal = botaoCopiar.textContent;
    botaoCopiar.textContent = "✅ Copiado!";
    setTimeout(() => { botaoCopiar.textContent = textoOriginal; }, 1500);
  } catch (erro) {
    mostrarErro("Não foi possível copiar. Tente selecionar o código manualmente.");
  }
});

botaoBaixar.addEventListener("click", () => {
  if (!ultimoResultado) return;
  const blob = new Blob([ultimoResultado], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pagina-gerada.html";
  link.click();
  URL.revokeObjectURL(url);
});

botaoTentarDeNovo.addEventListener("click", () => {
  gerarCodigo(true);
});

botao.addEventListener("click", () => gerarCodigo(false));
