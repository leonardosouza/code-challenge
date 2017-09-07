/* global localStorage */
import moment from 'moment'
import numeral from 'numeral'
import _ from 'lodash'
import ajax from './ajax'
import Handlebars from 'handlebars'

// importing assets
import './css'
import productTpl from '../html/product.html'
import categoryEmptyTpl from '../html/category-empty.html'

const BEER_DELIVERY = (function () {
  let autocomplete
  let totalCart = 0
  const graphqlApi = 'https://803votn6w7.execute-api.us-west-2.amazonaws.com/dev/public/graphql'
  // const graphqlApi = 'https://api.zx-courier.com/public/graphql'

  const ui = {
    cepField: document.querySelector('.search__form-input'),
    searchButton: document.querySelector('.search__form-button'),
    searchSection: document.querySelector('.search'),
    searchForm: document.querySelector('.search__form'),
    searchChangeAddress: document.querySelector('.change-address'),
    experienceSection: document.querySelector('.best-experience'),
    productsSection: document.querySelector('.products'),
    productsList: document.querySelector('.products__list'),
    filterByName: document.querySelector('.filter-by-name'),
    filterByCategory: document.querySelector('.filter-by-category'),
    cartTotal: document.querySelector('.cart-total'),
    cartTotalPrice: document.querySelector('.cart-total-price')
  }

  const validateEntry = (e) => {
    e.target.value = e.target.value.replace(/\D+/g, '')
  }

  const getProductList = (pocId, textSearch = '', categoryId = 0, categoryName = '') => {
    const data = {
      query: `query pocCategorySearch($id: ID!, $search: String!, $categoryId: Int!) {
          poc(id: $id) {
            products(categoryId: $categoryId, search: $search) {
              productVariants{
                title
                description
                imageUrl
                price
              }
            }
          }
        }`,
      variables: { id: pocId, search: textSearch, categoryId },
      operationName: 'pocCategorySearch'
    }

    const getProductListSuccess = (res) => {
      if (_.get(res, 'data.poc.products')) {
        const products = res.data.poc.products
        const template = Handlebars.compile(productTpl)
        let html = []
        html.push(products.map(product => template(_.first(product.productVariants))))

        if (products.length === 0) {
          ui.productsList.innerHTML = Handlebars.compile(categoryEmptyTpl)({ categoryName })
        } else {
          ui.productsList.innerHTML = _.first(html).join('')
        }

        ui.experienceSection.classList.add('hide')
        ui.productsSection.classList.remove('hide')
      }
    }

    const getProductListError = (err) => console.log(err)

    ajax(graphqlApi, { method: 'POST', body: JSON.stringify(data) }, getProductListSuccess, getProductListError)
  }

  const showTotalCart = (total) => {
    const formatted = numeral(total).format('0,0.00')
    ui.cartTotalPrice.textContent = formatted.match(/NaN/) ? '0.00' : formatted
    ui.cartTotal.classList.add('cart-fixed-bar')
  }

  const increaseItem = (ctx) => {
    const { productPrice } = ctx.target.parentNode.dataset
    const inputElem = ctx.target.parentNode.querySelector('input')
    if (inputElem.value < 99) inputElem.value = Number(inputElem.value) + 1
    totalCart += Number(productPrice)
    if (totalCart < 0) totalCart = 0
    showTotalCart(totalCart)
  }

  const decreaseItem = (ctx) => {
    const { productPrice } = ctx.target.parentNode.dataset
    const inputElem = ctx.target.parentNode.querySelector('input')
    if (inputElem.value > 0) inputElem.value = Number(inputElem.value) - 1
    if (totalCart > 0) totalCart -= Number(productPrice)
    if (totalCart < 0) totalCart = 0
    showTotalCart(totalCart)
  }

  const addCart = (ctx) => {
    console.log(ctx)
  }

  const cardActions = (e) => {
    e.preventDefault()
    let { action } = e.target.dataset
    if (action === 'increase-item') return increaseItem(e)
    if (action === 'decrease-item') return decreaseItem(e)
    if (action === 'add-cart') return addCart(e)
  }

  const filterByName = (e) => {
    if (localStorage && localStorage.pocSearch) {
      const pocSearch = JSON.parse(localStorage.pocSearch)
      getProductList(pocSearch.id, e.target.value)
    }
  }

  const filterByCategory = (e) => {
    if (localStorage && localStorage.pocSearch) {
      const pocSearch = JSON.parse(localStorage.pocSearch)
      const opts = e.target.options
      const categoryId = Number(opts[opts.selectedIndex].id)
      const categoryName = opts[opts.selectedIndex].textContent
      getProductList(pocSearch.id, ui.filterByName.value, categoryId, categoryName)
    }
  }

  const getPOC = (e) => {
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
            const pocSearch = _.first(res.data.pocSearch)
            localStorage.pocSearch = JSON.stringify(pocSearch)
            getProductList(pocSearch.id)
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

  const populateCategories = (data = []) => {
    data.map((category) => {
      let opt = document.createElement('option')
      opt.id = category.id
      opt.textContent = category.title
      ui.filterByCategory.appendChild(opt)
    })
  }

  const loadCategories = () => {
    const data = {
      query: `query allCategoriesSearch {
          allCategory{
            title
            id
          }
        }
        `,
      variables: null,
      operationName: 'allCategoriesSearch'
    }

    const loadCategoriesSuccess = (res) => {
      if (localStorage && _.get(res, 'data.allCategory')) {
        populateCategories(res.data.allCategory)
        localStorage.allCategories = JSON.stringify(res.data.allCategory)
      }
    }

    const loadCategoriesError = (err) => console.log(err)

    if (localStorage && localStorage.allCategories) {
      populateCategories(JSON.parse(localStorage.allCategories))
      return
    }
    ajax(graphqlApi, { method: 'POST', body: JSON.stringify(data) }, loadCategoriesSuccess, loadCategoriesError)
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
    loadCategories()

    // add events
    ui.cepField.addEventListener('input', validateEntry)
    ui.searchButton.addEventListener('click', getPOC)
    ui.searchChangeAddress.addEventListener('click', changeAddress)
    ui.filterByName.addEventListener('input', filterByName)
    ui.filterByCategory.addEventListener('change', filterByCategory)
    ui.productsList.addEventListener('click', cardActions)
  })()

  return { gmapsAutoComplete }
})()

window.initAutocomplete = BEER_DELIVERY.gmapsAutoComplete
