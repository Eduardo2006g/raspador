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

  // Obtém todos os elementos <li> com a classe 'l-breadcrumb__item'
  const fourthListItem = await page.evaluate(() => {
    const listItemElements = document.querySelectorAll('li.l-breadcrumb__item');
    if (listItemElements.length >= 4) {
      return listItemElements[3].textContent.trim();
    } else {
      return 'O quarto elemento <li> não foi encontrado.';
    }
  });

  // Imprime o conteúdo do quarto elemento <li> encontrado
  console.log('Quarto elemento <li> encontrado:', fourthListItem);

  // Fecha o navegador
  await browser.close();
}

// Chama a função para iniciar a raspagem
scrape();
