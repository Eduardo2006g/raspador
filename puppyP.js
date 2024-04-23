// Esse código só serve pra pegar os bairros
const puppeteer = require('puppeteer');

async function scrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Configura o cabeçalho para simular uma solicitação de navegador
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0'
  });

  // Navega até a página desejada
  await page.goto('https://www.zapimoveis.com.br/venda/casas/es+guarapari/?__ab=olx:upgrade,zap-newldp:control,super-high:control,exp-aa-test:control,novopos:control,rp-imob:enabled&transacao=venda&onde=,Esp%C3%ADrito%20Santo,Guarapari,,,,,city,BR%3EEspirito%20Santo%3ENULL%3EGuarapari,-20.673893,-40.499984,&tipos=casa_residencial&pagina=1');

  // Espera até que a página esteja completamente carregada
  await page.waitForSelector('body');

  // Obtém todos os parágrafos com a classe 'card__street'
  const paragraphs = await page.evaluate(() => {
    const paragraphElements = [...document.querySelectorAll('p.card__street')];
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
