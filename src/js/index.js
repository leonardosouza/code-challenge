import './cssFiles'
import product from '../html/product.html'

/* global localStorage */
const BEER_DELIVERY = (function () {
  let autocomplete

  const ui = {
    cepField: document.querySelector('.search__form-input'),
    searchButton: document.querySelector('.search__form-button'),
    searchBox: document.querySelector('.search'),
    bestExperienceBox: document.querySelector('.best-experience'),
    productsSection: document.querySelector('.products')
  }

  const validateEntry = (e) => {
    e.target.value = e.target.value.replace(/\D+/g, '')
  }

  const getAddress = (e) => {
    e.preventDefault()
    if (localStorage && localStorage.currentPlace) {
      // ui.searchBox.classList.add('hide')
      ui.bestExperienceBox.classList.add('hide')
      ui.productsSection.innerHTML = product
      ui.productsSection.classList.remove('hide')
    }
    ui.cepField.focus()
  }

  const fillInAddress = () => {
    let place = autocomplete.getPlace()
    if (place && place.geometry) {
      localStorage.currentPlace = JSON.stringify({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lat(),
        address: place.formatted_address
      })
    }
    // console.log(place)
    // console.log('LAT ===>', place.geometry.location.lat())
    // console.log('LNG ===>', place.geometry.location.lng())
  }

  const gmapsAutoComplete = () => {
    autocomplete = new window.google.maps.places.Autocomplete(
      document.querySelector('.search__form-input'),
      { types: ['geocode'] }
    )

    autocomplete.addListener('place_changed', fillInAddress)
  }

  const loadGMapsApi = () => {
    const sc = document.createElement('script')
    const apiKey = 'AIzaSyBhafo4Tgv7VFZ_xsnj9Yp7rHQRJgorBk4'
    sc.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initAutocomplete`
    document.body.appendChild(sc)
  }

  (function () {
    // initialize
    loadGMapsApi()

    // add events
    ui.cepField.addEventListener('input', validateEntry)
    ui.cepField.addEventListener('focusout', getAddress)
    ui.searchButton.addEventListener('click', getAddress)
  })()

  return { gmapsAutoComplete }
})()

window.initAutocomplete = BEER_DELIVERY.gmapsAutoComplete
