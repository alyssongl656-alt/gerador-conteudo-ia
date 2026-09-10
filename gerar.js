export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ erro: "Método não permitido" });
    }

    try {
        const resposta = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify(req.body)
            }
        );

        const dados = await resposta.json();

        return res.status(resposta.status).json(dados);

    } catch (erro) {
        return res.status(500).json({
            erro: "Erro ao conectar com a Groq"
        });
    }
}