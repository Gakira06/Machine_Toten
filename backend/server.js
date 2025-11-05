const express = require("express");

const cors = require("cors");
const multer = require("multer");
const fs = require("fs").promises; // Usando a versão baseada em Promises do 'fs'
const path = require("path");

const { existsSync } = require("fs"); // Importando sync apenas para a verificação inicial
const bodyParser = require("body-parser");

const { v4: uuid } = require("uuid");

const app = express();

const port = 5001;

app.use(cors());

app.use(bodyParser.json());

app.use("/uploads", express.static("uploads")); // Torna a pasta 'uploads' pública

// --- Configuração do Multer ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define a pasta onde as imagens serão salvas
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Cria um nome único para o arquivo para evitar nomes duplicados
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// --- Lógica para salvar no JSON ---
const dbPath = path.join(__dirname, "cardapio.json");

// Função para ler os dados do nosso "banco de dados" JSON
const readData = async () => {
  try {
    if (!existsSync(dbPath)) {
      // Se o arquivo não existe, cria com um array de produtos vazio
      await fs.writeFile(
        dbPath,
        JSON.stringify({ produtos: [], usuarios: [] })
      );
    }
    const data = await fs.readFile(dbPath);
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler ou parsear o arquivo do banco de dados:", error);
    // Retorna uma estrutura padrão em caso de erro para não quebrar a aplicação
    return { produtos: [], usuarios: [] };
  }
};

// Função para escrever os novos dados no JSON
const writeData = async (data) => {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2)); // o 'null, 2' formata o JSON para ficar legível
};

app.post("/cardapio", upload.single("imagem"), async (req, res) => {
  try {
    const { nome, descricao } = req.body; // Pega o nome do cardapio que veio no corpo da requisição

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Nenhum arquivo de imagem enviado." });
    }

    if (!nome || !descricao) {
      return res
        .status(400)
        .json({ message: "Nome e descrição são obrigatórios." });
    }
    const imagemPath = req.file.path; // Pega o caminho onde a imagem foi salva pelo multer
    const data = await readData();
    const novoProduto = {
      id: uuid(),
      nome: nome,
      descricao: descricao,
      imagem: imagemPath,
    };

    data.produtos.push(novoProduto);
    await writeData(data);

    res
      .status(201)
      .json({
        message: "Produto cadastrado com sucesso!",
        produto: novoProduto,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erro interno no servidor ao salvar o produto." });
  }
});

app.get("/cardapio", async (req, res) => {
  const data = await readData();
  res.json(data.produtos);
});

app.put("/cardapio/:id", async (req, res) => {
  const produtoId = req.params.id;
  const { nome, descricao } = req.body;
  const data = await readData();

  if (!nome || !descricao) {
    return res.status(400).json({ error: "Campos Inválidos" });
  }

  // 1. LER os dados do arquivo

  const produtoIndex = data.produtos.findIndex((item) => item.id === produtoId);
  if (produtoIndex === -1) {
    return res.status(400).json({ error: "Produto nâo encontrado" });
  }

  const cardapioAtualizado = {
    id: produtoId,
    nome,
    descricao,
    imagem: data.produtos[produtoIndex].imagem,
  };
  data.produtos[produtoIndex] = cardapioAtualizado;

  await writeData(data);

  res.json(cardapioAtualizado);
});

app.delete("/cardapio/:id", async (req, res) => {
  const produtoId = req.params.id;
  const data = await readData();

  const produtoIndex = data.produtos.findIndex((item) => item.id === produtoId);

  if (produtoIndex === -1) {
    return res.status(404).json({ error: "produto não encontrado" });
  }
  data.produtos.splice(produtoIndex, 1);

  await writeData(data);

  // É uma boa prática retornar 204 (No Content) em um DELETE bem-sucedido.
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Servidor rodando com sucesso na porta ${port}`);
});
