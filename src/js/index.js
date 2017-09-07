/* global localStorage */
import moment from 'moment'
import _ from 'lodash'
import ajax from './ajax'

// importing assets
import './cssFiles'
// import productTpl from '../html/product.html'

const BEER_DELIVERY = (function () {
  let autocomplete
  const graphqlApi = 'https://803votn6w7.execute-api.us-west-2.amazonaws.com/dev/public/graphql'

  const ui = {
    cepField: document.querySelector('.search__form-input'),
    searchButton: document.querySelector('.search__form-button'),
    searchSection: document.querySelector('.search'),
    searchForm: document.querySelector('.search__form'),
    searchChangeAddress: document.querySelector('.change-address'),
    experienceSection: document.querySelector('.best-experience'),
    productsSection: document.querySelector('.products')
  }

  const validateEntry = (e) => {
    e.target.value = e.target.value.replace(/\D+/g, '')
  }

  const getPOC = (e) => {
    // CEP: 04715-001
    e.preventDefault()
    if (localStorage && localStorage.currentPlace) {
      const { lat, lng } = JSON.parse(localStorage.currentPlace)

      const data = {
        query: `query pocSearchMethod($now: DateTime!, $algorithm: String!, $lat: String!, $long: String!) {
                  pocSearch(now: $now, algorithm: $algorithm, lat: $lat, long: $long) {
                    __typename
                    id
                    status
                    tradingName
                    officialName
                    deliveryTypes {
                      __typename
                      pocDeliveryTypeId
                      deliveryTypeId
                      price
                      title
                      subtitle
                      active
                    }
                    paymentMethods {
                      __typename
                      pocPaymentMethodId
                      paymentMethodId
                      active
                      title
                      subtitle
                    }
                    pocWorkDay {
                      __typename
                      weekDay
                      active
                      workingInterval {
                        __typename
                        openingTime
                        closingTime
                      }
                    }
                    address {
                      __typename
                      address1
                      address2
                      number
                      city
                      province
                      zip
                      coordinates
                    }
                    phone {
                      __typename
                      phoneNumber
                    }
                  }
                }
          `,
        variables: {
          'algorithm': 'NEAREST',
          'lat': `${lat}`,
          'long': `${lng}`,
          'now': moment().format()
        },
        operationName: 'pocSearchMethod'
      }

      const getPOCSuccess = (res) => {
        if (_.get(res, 'data.pocSearch')) {
          ui.searchForm.classList.add('poc-choiced')

          if (_.first(res.data.pocSearch)) {
            ui.searchForm.classList.remove('poc-not-found')
            localStorage.pocSearch = JSON.stringify(_.first(res.data.pocSearch))
          } else {
            ui.searchForm.classList.add('poc-not-found')
          }
        }
      }

      const getPOCError = (err) => console.log(err)

      ajax(graphqlApi, { method: 'POST', body: JSON.stringify(data) }, getPOCSuccess, getPOCError)
    } else {
      ui.cepField.focus()
    }
  }

  const changeAddress = (e) => {
    e.preventDefault()
    ui.searchForm.classList.remove('poc-choiced')
    ui.cepField.value = ''
    ui.cepField.focus()
  }

  const fillInAddress = () => {
    let place = autocomplete.getPlace()
    if (place && place.geometry) {
      localStorage.currentPlace = JSON.stringify({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address
      })
    }
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
    ui.searchButton.addEventListener('click', getPOC)
    ui.searchChangeAddress.addEventListener('click', changeAddress)
  })()

  return { gmapsAutoComplete }
})()

window.initAutocomplete = BEER_DELIVERY.gmapsAutoComplete
