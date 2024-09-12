function onOpen() {
  // Adiciona o menu "Contraste de Cores" na barra do Google Sheets
  SpreadsheetApp.getUi()
    .createMenu('Contraste de Cores')
    .addItem('Exibir Resultados', 'showDialog')
    .addToUi();
}

/**
 * Exibe os resultados em um modal centralizado com largura menor para ser responsivo
 */
function showDialog() {
  const html = HtmlService.createHtmlOutputFromFile('sidebar')
    .setTitle('Contraste de Cores')
    .setWidth(600) // Diminuímos a largura para ser mais responsivo
    .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(html, 'Contraste de Cores');
}

/**
 * Função para calcular e retornar os dados de contraste para o HTML
 * @returns {Array} Array de pares de cores com suas classificações
 */
function getContrastData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const colors = sheet.getRange('A2:A7').getValues().flat().filter(Boolean); // Ignora células vazias
  const colorPairs = [];

  // Comparar todas as combinações de cores possíveis
  for (let i = 0; i < colors.length - 1; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const color1 = colors[i];
      const color2 = colors[j];
      const contrastRatio = calculateContrast(color1, color2);
      const classification = classifyContrast(contrastRatio);

      colorPairs.push({
        color1: color1,
        color2: color2,
        ratio: contrastRatio,
        rating: classification.rating,
        emoji: classification.emoji,
        className: classification.className
      });
    }
  }

  // Ordenar em ordem decrescente pelo valor de contraste
  colorPairs.sort((a, b) => b.ratio - a.ratio);

  return colorPairs;
}

/**
 * Função para calcular a razão de contraste entre duas cores hexadecimais
 * @param {string} hex1 - Cor hexadecimal 1
 * @param {string} hex2 - Cor hexadecimal 2
 * @returns {number} Razão de contraste
 */
function calculateContrast(hex1, hex2) {
  const color1 = hexToRgb(hex1);
  const color2 = hexToRgb(hex2);
  const lum1 = relativeLuminance(color1.r, color1.g, color1.b);
  const lum2 = relativeLuminance(color2.r, color2.g, color2.b);
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

/**
 * Função para calcular a luminância relativa de uma cor
 * @param {number} r - Componente vermelho (0-255)
 * @param {number} g - Componente verde (0-255)
 * @param {number} b - Componente azul (0-255)
 * @returns {number} Luminância relativa
 */
function relativeLuminance(r, g, b) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

/**
 * Função para converter hexadecimal para RGB
 * @param {string} hex - Cor hexadecimal
 * @returns {object} Objeto com valores de r, g, b
 */
function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

/**
 * Função para classificar o contraste com base no valor
 * @param {number} contrastRatio - Razão de contraste
 * @returns {object} Classificação do contraste com rótulo e emoji
 */
function classifyContrast(contrastRatio) {
  if (contrastRatio < 3) return { rating: 'Péssimo', emoji: '😡', className: 'péssimo' };
  if (contrastRatio >= 3 && contrastRatio < 4.5) return { rating: 'Regular', emoji: '🫤', className: 'regular' };
  if (contrastRatio >= 4.5 && contrastRatio < 7) return { rating: 'Bom', emoji: '🙂', className: 'bom' };
  return { rating: 'Ótimo', emoji: '😍', className: 'ótimo' };
}
