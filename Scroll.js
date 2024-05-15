// Agora ele usa scroll pra pegar tudo, só tenho que conferir esse URL aí
const puppeteer = require('puppeteer');

async function scrape() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Configura o cabeçalho para simular uma solicitação de navegador
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0'
  });

  // Navega até a página desejada
  await page.goto('https://www.zapimoveis.com.br/venda/imoveis/es+guarapari/?transacao=venda&onde=,Esp%C3%ADrito%20Santo,Guarapari,,,,,city,BR%3EEspirito%20Santo%3ENULL%3EGuarapari,-20.673893,-40.499984,&itl_id=1000072&itl_name=zap_-_botao-cta_buscar_to_zap_resultado-pesquisa');

  // Função para rolar a página até o final
  async function autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  // Aguarda até que a página esteja completamente carregada
  await page.waitForSelector('body');

  // Rola a página para baixo para carregar todos os elementos
  await autoScroll(page);

  // Obtém todos os preços dos imóveis
  const prices = await page.evaluate(() => {
    const priceElements = document.querySelectorAll('div.listing-price');
    return Array.from(priceElements, priceElement => priceElement.textContent.trim());
  });

  // Imprime os preços dos imóveis
  console.log('Preços dos imóveis:', prices);

  // Fecha o navegador
  await browser.close();
}

// Chama a função para iniciar a raspagem
scrape();
