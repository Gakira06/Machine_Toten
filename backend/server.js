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
    const { nome, descricao, preco, categoria } = req.body; // Pega o nome do cardapio que veio no corpo da requisição

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Nenhum arquivo de imagem enviado." });
    }

    if (!nome || !descricao || !preco || !categoria) {
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
      preco: Number(preco), // Salva como número
      categoria: categoria,
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


// =================================================================
// --- ROTAS DE USUÁRIOS (Autoatendimento) ---
// =================================================================

/**
 * Rota para VERIFICAR se um CPF já existe.
 * A tela inicial do seu site vai chamar esta rota.
 */
app.post("/usuarios/check", async (req, res) => {
  try {
    const { cpf } = req.body;

    if (!cpf) {
      return res.status(400).json({ message: "CPF é obrigatório." });
    }

    const data = await readData();
    // Procura no array 'usuarios' pelo CPF fornecido
    const usuario = data.usuarios.find((u) => u.cpf === cpf);

    if (usuario) {
      // Usuário ENCONTRADO
      res.json({ exists: true, usuario: usuario });
    } else {
      // Usuário NÃO ENCONTRADO
      res.json({ exists: false });
    }
  } catch (error) {
    console.error("Erro ao checar CPF:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

/**
 * Rota para CADASTRAR um novo usuário.
 * A sua "página de cadastro rápido" vai chamar esta rota.
 */
app.post("/usuarios/register", async (req, res) => {
  try {
    // Você pode adicionar mais campos aqui (ex: telefone)
    const { cpf, nome, celular, email } = req.body;

    if (!cpf || !nome || !celular) { // Email não é mais obrigatório
      return res
        .status(400)
        .json({ message: "CPF, Nome e Celular são obrigatórios." });
    }

    const data = await readData();

    // Verifica novamente se o CPF já não foi cadastrado (boa prática)
    const existingUser = data.usuarios.find((u) => u.cpf === cpf);
    if (existingUser) {
      // 409 Conflict: Indica que o recurso já existe
      return res.status(409).json({ message: "CPF já cadastrado." });
    }

    const novoUsuario = {
      id: uuid(),
      cpf: cpf,
      nome: nome,
      email: email || null, // Se email não for fornecido, será null
      // Adicione outros campos se desejar
    };

    data.usuarios.push(novoUsuario);
    await writeData(data);

    // 201 Created: Retorna o usuário recém-criado
    res
      .status(201)
      .json({
        message: "Usuário cadastrado com sucesso!",
        usuario: novoUsuario,
      });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res
      .status(500)
      .json({ message: "Erro interno no servidor ao cadastrar usuário." });
  }
});

// (Opcional) Rota para listar todos os usuários cadastrados
app.get("/usuarios", async (req, res) => {
  const data = await readData();
  res.json(data.usuarios);
});


// =================================================================
// --- ROTAS DE PEDIDOS (Totem) ---
// =================================================================

/**
 * Rota para RECEBER um novo pedido do totem.
 * O componente <Cart> do React vai chamar esta rota.
 */
app.post("/pedidos", async (req, res) => {
  try {
    // 1. Pega os dados do pedido que o <Cart> enviou no corpo (body) da requisição
    const { items, total, data: dataPedido, status } = req.body;

    // 2. Validação simples
    if (!items || !total || !dataPedido || !status) {
      return res
        .status(400)
        .json({ message: "Dados do pedido estão incompletos." });
    }

    // 3. Lê o arquivo cardapio.json (que agora também guarda pedidos)
    const data = await readData();

    // 4. Cria o novo objeto de pedido
    const novoPedido = {
      id: uuid(), // Cria um ID único para este pedido
      items: items,
      total: total,
      data: dataPedido,
      status: status, // Ex: 'pendente'
    };

    // 5. Adiciona o novo pedido ao array de pedidos
    //    É uma boa prática verificar se o array 'pedidos' já existe
    if (!data.pedidos) {
      data.pedidos = [];
    }
    data.pedidos.push(novoPedido);

    // 6. Salva os dados atualizados (com o novo pedido) de volta no arquivo JSON
    await writeData(data);

    // 7. Responde ao frontend com sucesso
    res
      .status(201) // 201 Created (sucesso na criação)
      .json({
        message: "Pedido recebido com sucesso!",
        pedido: novoPedido,
      });
  } catch (error) {
    console.error("Erro ao salvar o pedido:", error);
    res
      .status(500)
      .json({ message: "Erro interno no servidor ao salvar o pedido." });
  }
});

// (Opcional) Rota para o dono/funcionário ver os pedidos pendentes
app.get("/pedidos", async (req, res) => {
  try {
    const data = await readData();
    const pedidos = data.pedidos || []; // Retorna array vazio se não houver pedidos
    res.json(pedidos);
  } catch (error) {
    console.error("Erro ao ler pedidos:", error);
    res
      .status(500)
      .json({ message: "Erro interno no servidor ao ler pedidos." });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando com sucesso na porta ${port}`);
});
