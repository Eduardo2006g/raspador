//Pega o preço depois de clicar nos cardzinhos
const puppeteer = require('puppeteer');

async function scrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Configura o cabeçalho para simular uma solicitação de navegador
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0'
  });

  // Navega até a página desejada
  await page.goto('https://www.zapimoveis.com.br/imovel/venda-casa-6-quartos-mobiliado-meaipe-guarapari-es-3000m2-id-2685283284//');

  // Espera até que a página esteja completamente carregada
  await page.waitForSelector('body');

  // Obtém todos os parágrafos com a classe 'card__street'
  const paragraphs = await page.evaluate(() => {
    const paragraphElements = [...document.querySelectorAll('p.price-info-value')];
    return paragraphElements.map(p => p.textContent.trim());
  });

  // Imprime os conteúdos dos parágrafos encontrados
  if (paragraphs.length > 0) {
    console.log('Parágrafos encontrados:', paragraphs);
  } else {
    console.log('Nenhum parágrafo encontrado com a classe especificada.');
  }

  // Fecha o navegador
  await browser.close();
}

// Chama a função para iniciar a raspagem
scrape();
