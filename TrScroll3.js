const puppeteer = require('puppeteer');

async function scrape() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Configura o cabeçalho para simular uma solicitação de navegador
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0'
  });

  // Navega até a página desejada
  const initialUrl = 'https://www.zapimoveis.com.br/venda/imoveis/es+guarapari/?transacao=venda&onde=,Esp%C3%ADrito%20Santo,Guarapari,,,,,city,BR%3EEspirito%20Santo%3ENULL%3EGuarapari,-20.673893,-40.499984,&itl_id=1000072&itl_name=zap_-_botao-cta_buscar_to_zap_resultado-pesquisa';
  await page.goto(initialUrl);

  // Função para rolar a página até o final
  async function autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
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
      const floorSizeElements = document.querySelectorAll('p[itemprop="floorSize"]');
      const numberOfRoomsElements = document.querySelectorAll('p[itemprop="numberOfRooms"]');
      const numberOfBathroomsTotalElements = document.querySelectorAll('p[itemprop="numberOfBathroomsTotal"]');
      const numberOfParkingSpacesElements = document.querySelectorAll('p[itemprop="numberOfParkingSpaces"]');

      const addresses = Array.from(addressElements, element => element.textContent.trim());
      const streets = Array.from(streetElements, element => element.textContent.trim());
      const prices = Array.from(priceElements, element => element.textContent.trim());
      const floors = Array.from(floorSizeElements, element => element.textContent.trim());
      const rooms = Array.from(numberOfRoomsElements, element => element.textContent.trim());
      const baths = Array.from(numberOfBathroomsTotalElements, element => element.textContent.trim());
      const parkingSlots = Array.from(numberOfParkingSpacesElements, element => element.textContent.trim());

      return addresses.map((address, index) => ({
        address,
        street: streets[index] || '',
        price: prices[index] || '',
        floor: floors[index] || '',
        room: rooms[index] || '',
        baths: baths[index] || '',
        parking: parkingSlots[index] || '',
      }));
    });

    return data;
  }

  let pageCount = 0;  // Contador de páginas

  // Loop para navegar pelas páginas e coletar os dados
  while (pageCount < 60) {  // Limite de 2 páginas
    // Aguarda até que a página esteja completamente carregada
    await page.waitForSelector('body');

    // Coleta os dados da página atual
    const data = await collectData(page);

    // Imprime os dados coletados da página atual
    console.log(`Página ${pageCount + 1}, Link: ${page.url()}`);
    console.log('Endereço | Rua | Preço | Área | Quartos | Banheiros | Vagas');
    data.forEach(item => {
      console.log(`${item.address} | ${item.street} | ${item.price} | ${item.floor} | ${item.room} | ${item.baths} | ${item.parking}`);
    });

    pageCount++;  // Incrementa o contador de páginas

    if (pageCount < 60) {  // Somente tenta ir para a próxima página se o contador for menor que 2
      // Tenta clicar no botão "Próxima página"
      const nextPageButton = await page.$('button[aria-label="Próxima página"]');
      if (nextPageButton) {
        await Promise.all([
          nextPageButton.click(),
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }) // 60 segundos
        ]);
      } else {
        break; // Sai do loop se o botão "Próxima página" não estiver presente
      }
    }
  }

  // Fecha o navegador
  await browser.close();
}

// Chama a função para iniciar a raspagem
scrape();
