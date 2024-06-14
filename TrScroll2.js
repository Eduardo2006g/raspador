const puppeteer = require('puppeteer');
const XLSX = require('xlsx');

async function scrape() {
  const browser = await puppeteer.launch({ 
    headless: false,
    protocolTimeout: 300000 // Aumenta o tempo limite do protocolo para 300 segundos
  });
  const page = await browser.newPage();

  // Configura o cabeçalho para simular uma solicitação de navegador
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0'
  });

  // Navega até a página desejada
  const initialUrl = 'https://www.zapimoveis.com.br/venda/imoveis/es+guarapari/?transacao=venda&onde=,Esp%C3%ADrito%20Santo,Guarapari,,,,,city,BR%3EEspirito%20Santo%3ENULL%3EGuarapari,-20.673893,-40.499984,&itl_id=1000072&itl_name=zap_-_botao-cta_buscar_to_zap_resultado-pesquisa';
  await page.goto(initialUrl, { waitUntil: 'domcontentloaded', timeout: 120000 }); // Aumenta o tempo limite para 120 segundos

  // Função para rolar a página até o final
  async function autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 80;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
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

  // Função para criar uma espera explícita
  function waitForTimeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Função para coletar dados da página atual
  async function collectData(page) {
    // Rola a página para baixo para carregar todos os elementos
    await autoScroll(page);

    // Espera 2 segundos adicionais para garantir que todos os elementos sejam carregados
    await waitForTimeout(2000);

    // Obtém os endereços, ruas e preços dos imóveis
    const data = await page.evaluate(() => {
      const addressElements = document.querySelectorAll('h2.card__address');
      const streetElements = document.querySelectorAll('p.card__street');
      const priceElements = document.querySelectorAll('div.listing-price');

      const addresses = Array.from(addressElements, element => element.textContent.trim());
      const streets = Array.from(streetElements, element => element.textContent.trim());
      const prices = Array.from(priceElements, element => element.textContent.trim());

      return addresses.map((address, index) => ({
        address,
        street: streets[index] || '',
        price: prices[index] || ''
      }));
    });

    return data;
  }

  let pageCount = 0;  // Contador de páginas
  let allData = [];   // Array para armazenar todos os dados coletados

  // Loop para navegar pelas páginas e coletar os dados
  while (true) {  // Loop infinito, será interrompido ao não encontrar mais páginas
    // Aguarda até que a página esteja completamente carregada
    await page.waitForSelector('body');

    // Coleta os dados da página atual
    const data = await collectData(page);
    allData = allData.concat(data);  // Adiciona os dados coletados ao array total

    console.log(`Página ${pageCount + 1}, Link: ${page.url()}`);
    console.log('Endereço | Rua | Preço');
    data.forEach(item => {
      console.log(`${item.address} | ${item.street} | ${item.price}`);
    });

    pageCount++;  // Incrementa o contador de páginas

    // Tenta clicar no botão "Próxima página"
    const nextPageButton = await page.$('button[aria-label="Próxima página"]');
    if (nextPageButton) {
      const previousUrl = page.url();
      try {
        await nextPageButton.click();
        // Espera pela navegação, com tentativas adicionais em caso de timeout
        let navigationSuccess = false;
        for (let attempt = 0; attempt < 3; attempt++) { // Tenta até 3 vezes
          try {
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 120000 }); // Aumenta o tempo limite para 120 segundos
            navigationSuccess = true;
            break;
          } catch (navError) {
            console.warn(`Tentativa ${attempt + 1} falhou: ${navError.message}`);
          }
        }
        if (!navigationSuccess) {
          throw new Error('Falha ao navegar para a próxima página após 3 tentativas');
        }

        // Verifica se a página realmente mudou
        const currentUrl = page.url();
        if (currentUrl === previousUrl) {
          break; // Sai do loop se a página não mudou
        }
      } catch (error) {
        console.error('Erro ao tentar navegar para a próxima página:', error);
        break;
      }
    } else {
      break; // Sai do loop se o botão "Próxima página" não estiver presente
    }
  }

  // Fecha o navegador
  await browser.close();

  // Salva os dados em uma planilha Excel
  const worksheet = XLSX.utils.json_to_sheet(allData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Propriedade1');
  XLSX.writeFile(workbook, 'propriedade1.xlsx');

  console.log('Dados salvos na planilha propriedade1.xlsx');
}

// Chama a função para iniciar a raspagem
scrape();
