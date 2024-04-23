const puppeteer = require('puppeteer');

async function scrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Configura o cabeçalho para simular uma solicitação de navegador
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0'
  });
  
  // Navega até a página de busca no zap
  await page.goto('https://www.zapimoveis.com.br//venda/imoveis/es+guarapari/?__ab=exp-aa-test:control,novopos:control,rp-imob:enabled&transacao=venda&onde=,Esp');
  
  // Espera até que a página esteja completamente carregada
  await page.waitForSelector('body');

  // Obtém o HTML da página
  const htmlContent = await page.content();

  // Busca o h2 com as classes especificadas
  const h2Element = await page.evaluate(() => {
    const h2 = document.querySelector('h2.l-text.l-u-color-neutral-28.l-text--variant-heading-small.l-text--weight-medium.card__address');
    return h2 ? h2.textContent.trim() : null;
  });

  // Imprime o conteúdo do h2 se encontrado
  if (h2Element) {
    console.log('Texto do h2 encontrado:', h2Element);
  } else {
    console.log('Elemento h2 não encontrado.');
  }

  // Fecha o navegador
  await browser.close();
}

// Chama a função para iniciar a raspagem
scrape();
