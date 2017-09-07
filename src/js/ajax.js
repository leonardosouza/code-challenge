/* global Headers fetch */
const ajax = function (endpoint, config, callbackSuccess, callbackError) {
  const headers = new Headers()
  headers.append('Content-type', 'application/json')
  headers.append('Accept', 'application/json')

  let conf = Object.assign({ headers }, config)

  fetch(endpoint, conf)
    .then((res) => {
      if (!res.ok) throw new Error(res.statusText)
      return res.json()
    })
    .then(callbackSuccess)
    .catch(callbackError)
}

export default ajax
