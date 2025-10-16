const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Array de músicas com IDs únicos
let musicas = [
    { id: 1, titulo: "Best Part", autor: "Daniel Caesar", duracao: 3.25, genero: "R&B", ano: 2017 },
    { id: 2, titulo: "Get You", autor: "Daniel Caesar", duracao: 4.80, genero: "R&B", ano: 2016 },
    { id: 3, titulo: "Yellow", autor: "Coldplay", duracao: 3.50, genero: "Rock", ano: 2000 },
    { id: 4, titulo: "Bohemian Rhapsody", autor: "Queen", duracao: 5.92, genero: "Rock", ano: 1975 },
    { id: 5, titulo: "Blinding Lights", autor: "The Weeknd", duracao: 3.20, genero: "Pop", ano: 2019 }
];

let nextId = 6;

// 1️⃣ Retornar músicas de um gênero específico
app.get('/musicas/filtro/genero/:genero', (req, res) => {
  const genero = req.params.genero.toLowerCase();
  const filtradas = musicas.filter(m => m.genero.toLowerCase() === genero);
  
  if (filtradas.length === 0) {
    return res.status(404).json({ 
      erro: 'Nenhuma música encontrada para este gênero',
      generoPesquisado: genero 
    });
  }
  
  res.json({
    genero: genero,
    quantidade: filtradas.length,
    musicas: filtradas
  });
});

// 2️⃣ Retornar músicas com duração menor ou igual a um valor (em minutos)
app.get('/musicas/filtro/duracao/:max', (req, res) => {
  const max = parseFloat(req.params.max);
  
  if (isNaN(max) || max <= 0) {
    return res.status(400).json({ 
      erro: 'Duração máxima deve ser um número positivo' 
    });
  }
  
  const filtradas = musicas.filter(m => m.duracao <= max);
  
  res.json({
    duracaoMaxima: max,
    quantidade: filtradas.length,
    musicas: filtradas
  });
});

// 3️⃣ Retornar a quantidade total de músicas
app.get('/musicas/quantidade', (req, res) => {
  res.json({ 
    quantidade: musicas.length,
    mensagem: `Total de ${musicas.length} música(s) cadastrada(s)`
  });
});

// 4️⃣ Retornar a primeira música cadastrada
app.get('/musicas/primeira', (req, res) => {
  if (musicas.length === 0) {
    return res.status(404).json({ 
      erro: 'Nenhuma música cadastrada' 
    });
  }
  
  res.json({
    mensagem: 'Primeira música cadastrada',
    musica: musicas[0]
  });
});

// 5️⃣ Retornar a última música cadastrada
app.get('/musicas/ultima', (req, res) => {
  if (musicas.length === 0) {
    return res.status(404).json({ 
      erro: 'Nenhuma música cadastrada' 
    });
  }
  
  res.json({
    mensagem: 'Última música cadastrada',
    musica: musicas[musicas.length - 1]
  });
});

// 6️⃣ Cadastrar várias músicas de uma vez
app.post('/musicas/multiplas', (req, res) => {
  const novasMusicas = req.body;
  
  if (!Array.isArray(novasMusicas)) {
    return res.status(400).json({ 
      erro: 'O corpo da requisição deve ser um array de músicas' 
    });
  }
  
  if (novasMusicas.length === 0) {
    return res.status(400).json({ 
      erro: 'Array de músicas está vazio' 
    });
  }
  
  // Validar cada música
  const musicasValidas = [];
  const musicasInvalidas = [];
  
  novasMusicas.forEach((musica, index) => {
    if (musica.titulo && musica.autor && musica.duracao) {
      const novaMusica = {
        id: nextId++,
        titulo: musica.titulo,
        autor: musica.autor,
        duracao: parseFloat(musica.duracao) || musica.duracao,
        genero: musica.genero || "Desconhecido",
        ano: musica.ano || new Date().getFullYear()
      };
      musicas.push(novaMusica);
      musicasValidas.push(novaMusica);
    } else {
      musicasInvalidas.push({ indice: index, musica: musica });
    }
  });
  
  res.status(201).json({
    mensagem: `${musicasValidas.length} músicas adicionadas com sucesso!`,
    adicionadas: musicasValidas,
    invalidas: musicasInvalidas.length > 0 ? musicasInvalidas : undefined
  });
});

// 7️⃣ Retornar dados estatísticos (ex: média da duração das músicas)
app.get('/musicas/estatisticas', (req, res) => {
  if (musicas.length === 0) {
    return res.json({ 
      mensagem: 'Nenhuma música cadastrada para calcular estatísticas',
      total: 0 
    });
  }
  
  const somaDuracao = musicas.reduce((acc, m) => acc + m.duracao, 0);
  const mediaDuracao = somaDuracao / musicas.length;
  
  // Encontrar música mais longa e mais curta
  const maisLonga = musicas.reduce((max, m) => m.duracao > max.duracao ? m : max);
  const maisCurta = musicas.reduce((min, m) => m.duracao < min.duracao ? m : min);
  
  // Estatísticas por gênero
  const generos = {};
  musicas.forEach(m => {
    generos[m.genero] = (generos[m.genero] || 0) + 1;
  });
  
  // Estatísticas por ano
  const anos = musicas.map(m => m.ano);
  const anoMaisAntigo = Math.min(...anos);
  const anoMaisRecente = Math.max(...anos);
  
  res.json({
    total: musicas.length,
    duracaoTotal: parseFloat(somaDuracao.toFixed(2)),
    mediaDuracao: parseFloat(mediaDuracao.toFixed(2)),
    musicaMaisLonga: maisLonga,
    musicaMaisCurta: maisCurta,
    distribuicaoGeneros: generos,
    anoMaisAntigo: anoMaisAntigo,
    anoMaisRecente: anoMaisRecente,
    periodoAnos: anoMaisRecente - anoMaisAntigo
  });
});

// Rota adicional: Buscar músicas por autor
app.get('/musicas/filtro/autor/:autor', (req, res) => {
  const autor = req.params.autor.toLowerCase();
  const filtradas = musicas.filter(m => 
    m.autor.toLowerCase().includes(autor)
  );
  
  res.json({
    autorPesquisado: autor,
    quantidade: filtradas.length,
    musicas: filtradas
  });
});

// Rota adicional: Converter duração de formato string para minutos
function converterDuracaoParaMinutos(duracaoString) {
  if (typeof duracaoString === 'number') return duracaoString;
  
  const partes = duracaoString.split(':');
  if (partes.length === 2) {
    return parseInt(partes[0]) + (parseInt(partes[1]) / 60);
  }
  return parseFloat(duracaoString) || 0;
}

async function testarRotas() {
    // 1. Filtrar por gênero
    const response1 = await fetch('http://localhost:3000/musicas/filtro/genero/rock');
    console.log('Rock:', await response1.json());
    
    // 2. Filtrar por duração (até 4 minutos)
    const response2 = await fetch('http://localhost:3000/musicas/filtro/duracao/4');
    console.log('Até 4min:', await response2.json());
    
    // 3. Quantidade total
    const response3 = await fetch('http://localhost:3000/musicas/quantidade');
    console.log('Quantidade:', await response3.json());
    
    // 7. Estatísticas
    const response7 = await fetch('http://localhost:3000/musicas/estatisticas');
    console.log('Estatísticas:', await response7.json());
}

testarRotas();



// Iniciar servidor
app.listen(port, () => {
  console.log(`🎵 Servidor de músicas rodando em: http://localhost:${port}`);
  console.log(`📊 Total de músicas cadastradas: ${musicas.length}`);
});