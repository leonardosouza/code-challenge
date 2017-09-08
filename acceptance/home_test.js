/* global Feature Scenario */
Feature('Home')

Scenario('a página foi carregada?', (I) => {
  I.amOnPage('/')
  I.see('Beer Delivery')
  I.see('Delivery para qualquer sede: peça e receba em casa')
  I.see('peça e receba em casa')
})

Scenario('preencha o campo "Digite seu CEP"', (I) => {
  I.amOnPage('/')
  I.seeElement('.search__form-input')
  I.fillField('.search__form-input', '03183001')
  I.click('BUSCAR')
  I.waitForElement('.pac-matched', 120)
  // I.see('Alto da Mooca', '.pac-matched')
})


