// --- 1. Imports ---
require("dotenv").config(); // Carrega o .env (DEVE SER A PRIMEIRA LINHA)
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs").promises;
const { existsSync, mkdirSync } = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { v4: uuid } = require("uuid");

// --- 2. Configuração da IA (Google Gemini) ---
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// --- 3. Configuração do App Express ---
const app = express();
const port = 5001;

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// --- 4. Configuração de Pastas e Arquivos ---
// Garante que as pastas 'data' (para JSONs) e 'uploads' (para imagens) existam
if (!existsSync("./data")) mkdirSync("./data");
if (!existsSync("./uploads")) mkdirSync("./uploads");

const DB_CARDAPIO = path.join(__dirname, "data", "cardapio.json");
const DB_USUARIOS = path.join(__dirname, "data", "usuarios.json");
const DB_PEDIDOS = path.join(__dirname, "data", "pedidos.json"); // Fila de pedidos ATIVOS

// --- 5. Configuração do Multer (Upload) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: storage });

// --- 6. Funções Auxiliares (Leitura/Escrita de JSON) ---

/**
 * Lê um arquivo JSON. Se não existir, cria com um array vazio [].
 * @param {string} filePath - O caminho para o arquivo .json
 * @returns {Promise<Array<any>>} - O conteúdo do arquivo como um array
 */
const readJSON = async (filePath) => {
  try {
    if (!existsSync(filePath)) {
      await fs.writeFile(filePath, JSON.stringify([], null, 2));
      return [];
    }
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler ${filePath}:`, error);
    return [];
  }
};

/**
 * Escreve dados em um arquivo JSON.
 * @param {string} filePath - O caminho para o arquivo .json
 * @param {Array<any>} data - O array de dados a ser salvo
 */
const writeJSON = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Erro ao escrever em ${filePath}:`, error);
  }
};

// =================================================================
// --- 7. ROTAS DE CARDÁPIO (cardapio.json) ---
// =================================================================

app.get("/cardapio", async (req, res) => {
  const produtos = await readJSON(DB_CARDAPIO);
  res.json(produtos);
});

app.post("/cardapio", upload.single("imagem"), async (req, res) => {
  try {
    const { nome, descricao, preco, categoria } = req.body;
    if (!req.file || !nome || !descricao || !preco || !categoria) {
      return res
        .status(400)
        .json({
          message:
            "Todos os campos (nome, descricao, preco, categoria, imagem) são obrigatórios.",
        });
    }

    const produtos = await readJSON(DB_CARDAPIO);
    const novoProduto = {
      id: uuid(),
      nome,
      descricao,
      preco: Number(preco),
      categoria,
      imagem: req.file.path,
    };

    produtos.push(novoProduto);
    await writeJSON(DB_CARDAPIO, produtos);

    res
      .status(201)
      .json({ message: "Produto cadastrado!", produto: novoProduto });
  } catch (error) {
    res.status(500).json({ message: "Erro interno ao salvar produto." });
  }
});

app.put("/cardapio/:id", async (req, res) => {
  // Nota: Esta rota (do seu código original) só atualiza nome e descrição.
  const produtoId = req.params.id;
  const { nome, descricao } = req.body;
  const produtos = await readJSON(DB_CARDAPIO);

  if (!nome || !descricao) {
    return res.status(400).json({ error: "Campos Inválidos" });
  }

  const produtoIndex = produtos.findIndex((item) => item.id === produtoId);
  if (produtoIndex === -1) {
    return res.status(400).json({ error: "Produto não encontrado" });
  }

  // Atualiza mantendo os dados antigos
  const produtoAtualizado = {
    ...produtos[produtoIndex],
    id: produtoId,
    nome,
    descricao,
  };
  produtos[produtoIndex] = produtoAtualizado;

  await writeJSON(DB_CARDAPIO, produtos);
  res.json(produtoAtualizado);
});

app.delete("/cardapio/:id", async (req, res) => {
  const produtos = await readJSON(DB_CARDAPIO);
  const novosProdutos = produtos.filter((item) => item.id !== req.params.id);

  if (produtos.length === novosProdutos.length) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  await writeJSON(DB_CARDAPIO, novosProdutos);
  res.status(204).send();
});

// =================================================================
// --- 8. ROTAS DE USUÁRIOS (usuarios.json) ---
// =================================================================

app.post("/usuarios/check", async (req, res) => {
  const { cpf } = req.body;
  if (!cpf) return res.status(400).json({ message: "CPF é obrigatório." });

  const usuarios = await readJSON(DB_USUARIOS);
  const usuario = usuarios.find((u) => u.cpf === cpf);
  res.json({ exists: !!usuario, usuario: usuario || null });
});

app.post("/usuarios/register", async (req, res) => {
  try {
    const { cpf, nome, celular, email } = req.body;
    if (!cpf || !nome || !celular) {
      return res
        .status(400)
        .json({ message: "CPF, Nome e Celular são obrigatórios." });
    }

    const usuarios = await readJSON(DB_USUARIOS);
    if (usuarios.find((u) => u.cpf === cpf)) {
      return res.status(409).json({ message: "CPF já cadastrado." });
    }

    const novoUsuario = {
      id: uuid(),
      cpf,
      nome,
      celular,
      email: email || null,
      historico: [], // ** IMPORTANTE: Campo criado para a IA **
    };

    usuarios.push(novoUsuario);
    await writeJSON(DB_USUARIOS, usuarios);

    res
      .status(201)
      .json({ message: "Usuário cadastrado!", usuario: novoUsuario });
  } catch (error) {
    res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
});

// Rota para a IA pegar o histórico completo de um usuário
app.get("/usuarios/:id/historico", async (req, res) => {
  const usuarios = await readJSON(DB_USUARIOS);
  const usuario = usuarios.find((u) => u.id === req.params.id);

  if (!usuario) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  res.json(usuario.historico || []); // Retorna o histórico ou um array vazio
});

// =================================================================
// --- 9. ROTAS DE PEDIDOS (pedidos.json + usuarios.json) ---
// =================================================================

app.post("/pedidos", async (req, res) => {
  try {
    // ** IMPORTANTE: Agora espera o usuarioId vindo do frontend **
    const { items, total, usuarioId } = req.body;

    if (!items || !total || !usuarioId) {
      return res
        .status(400)
        .json({
          message: "Dados incompletos (falta items, total ou usuarioId).",
        });
    }

    // 1. Busca o usuário para pegar o nome e atualizar o histórico
    const usuarios = await readJSON(DB_USUARIOS);
    const usuarioIndex = usuarios.findIndex((u) => u.id === usuarioId);

    if (usuarioIndex === -1) {
      return res
        .status(404)
        .json({ message: "Usuário não encontrado para vincular ao pedido." });
    }

    const pedidoData = {
      id: uuid(),
      usuarioId,
      items,
      total,
      data: new Date().toISOString(),
      status: "pendente",
    };

    // --- AÇÃO A: Salva na fila de atendimento (pedidos.json) ---
    const pedidosAtivos = await readJSON(DB_PEDIDOS);
    pedidosAtivos.push({
      ...pedidoData,
      nomeCliente: usuarios[usuarioIndex].nome, // Adiciona o nome do cliente
    });
    await writeJSON(DB_PEDIDOS, pedidosAtivos);

    // --- AÇÃO B: Salva no histórico PERMANENTE do usuário (usuarios.json) ---
    if (!usuarios[usuarioIndex].historico) {
      usuarios[usuarioIndex].historico = [];
    }
    usuarios[usuarioIndex].historico.push(pedidoData);
    await writeJSON(DB_USUARIOS, usuarios);

    res
      .status(201)
      .json({ message: "Pedido recebido!", pedidoId: pedidoData.id });
  } catch (error) {
    console.error("Erro ao processar pedido:", error);
    res.status(500).json({ message: "Erro interno ao salvar pedido." });
  }
});

// Lista apenas os pedidos ATIVOS (da fila) para a cozinha/atendente
app.get("/pedidos", async (req, res) => {
  const pedidos = await readJSON(DB_PEDIDOS);
  // Ordena do mais antigo para o mais novo (fila)
  pedidos.sort((a, b) => new Date(a.data) - new Date(b.data));
  res.json(pedidos);
});

// Finaliza um pedido (remove APENAS de pedidos.json)
app.delete("/pedidos/:id", async (req, res) => {
  try {
    const pedidosAtivos = await readJSON(DB_PEDIDOS);
    const novosPedidosAtivos = pedidosAtivos.filter(
      (p) => p.id !== req.params.id
    );

    if (pedidosAtivos.length === novosPedidosAtivos.length) {
      return res.status(404).json({ error: "Pedido ativo não encontrado." });
    }

    // Mantém o histórico (em usuarios.json) mas apaga da fila ativa
    await writeJSON(DB_PEDIDOS, novosPedidosAtivos);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erro ao finalizar pedido." });
  }
});

// =================================================================
// --- 10. ROTA DE SUGESTÃO (IA) ---
// =D ================================================================

app.post("/gerar-sugestao", async (req, res) => {
  try {
    // 1. Recebe o contexto MÍNIMO do frontend
    const { usuarioId, cartItems, temperatura } = req.body;

    // 2. Busca o restante do contexto no SERVIDOR (mais seguro e eficiente)
    const cardapio = await readJSON(DB_CARDAPIO);
    const usuarios = await readJSON(DB_USUARIOS);
    const usuario = usuarios.find((u) => u.id === usuarioId);

    // Se o usuário não for encontrado (ex: compra anônima), usa um histórico vazio
    const historico = usuario ? usuario.historico : [];

    // 3. Monta o Prompt para a IA
    const prompt = `
      Você é um assistente de totem de autoatendimento de uma lanchonete.
      Seu objetivo é dar UMA sugestão curta (máx 25 palavras), amigável e criativa 
      para incentivar o usuário a comprar mais um item.
      NÃO use emojis. NÃO seja robótico ("Notei que..."). Seja direto e vendedor.
      Baseie-se no contexto, especialmente no histórico e no clima.

      --- CONTEXTO ---
      Clima: ${temperatura || 20}°C.
      Itens no Carrinho Atual: ${JSON.stringify(cartItems.map((i) => i.nome))}
      Histórico de Pedidos Passados: ${JSON.stringify(
        historico.flatMap((p) => p.items.map((i) => i.nome))
      )}
      Cardápio Disponível: ${JSON.stringify(
        cardapio.map((p) => ({ nome: p.nome, categoria: p.categoria }))
      )}
      ---

      Gere a sugestão:
    `;

    // 4. Chama a API do Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const sugestaoDaIA = response.text().trim(); // .trim() remove espaços em branco

    // 5. Envia a sugestão de volta para o frontend
    res.json({ sugestao: sugestaoDaIA });
  } catch (error) {
    console.error("Erro ao gerar sugestão com IA:", error);
    res.status(500).json({ message: "Erro ao contatar o assistente de IA." });
  }
});

// --- 11. Iniciar Servidor ---
app.listen(port, () => {
  console.log(`🔥 Servidor rodando na porta ${port}`);
  console.log(`📂 Pasta de uploads: ${path.join(__dirname, "uploads")}`);
  console.log(`📂 Pasta de dados: ${path.join(__dirname, "data")}`);
});
