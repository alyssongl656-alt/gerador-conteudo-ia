export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      erro: "Chave da Groq não configurada no servidor (GROQ_API_KEY ausente).",
    });
  }

  try {
    const { model, messages } = req.body;

    if (!model || !messages) {
      return res.status(400).json({ erro: "Requisição inválida: 'model' e 'messages' são obrigatórios." });
    }

    const respostaGroq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages }),
    });

    const dados = await respostaGroq.json();

    if (!respostaGroq.ok) {
      return res.status(respostaGroq.status).json({
        erro: dados.error?.message || "Erro ao consultar a API da Groq.",
      });
    }

    return res.status(200).json(dados);
  } catch (erro) {
    console.error("Erro em /api/gerar:", erro);
    return res.status(500).json({ erro: "Erro interno ao gerar a página." });
  }
}
