const axios = require('axios').create({
  baseURL: "http://ship-it.wake.mx/api/",
  validateStatus: undefined,
});

backend = {};

backend.createUser = function(name, lastName, university, password, email, callback) {
  axios.post('users', {
    name,
    lastName,
    university,
    password,
    email,
    callback
  }).then(function(response) {
    callback({ status: response.status, statusText: response.statusText, data: response.data });
  }).catch(function(error) {
    callback({ error: true });
  });
}

backend.login = function(email, password, callback) {
  axios.post('users/' + encodeURIComponent(email) + '/sessions', {
    password
  }).then(function(response) {
    callback({ status: response.status, statusText: response.statusText, data: response.data });
  }).catch(function(error) {
    callback({ error: true });
  });
}

backend.logout = function(email, token, callback) {
  axios.delete('users/' + encodeURIComponent(email) + '/sessions/' + encodeURIComponent(token)).then(function(response) {
    callback({ status: response.status, statusText: response.statusText, data: response.data });
  }).catch(function(error) {
    callback({ error: true });
  });
}

backend.getUserDetails = function(email, token, callback) {
  axios.get('users/' + encodeURIComponent(email), {
    headers: {
      Authorization: 'Bearer ' + token
    }
  }).then(function(response) {
    callback({ status: response.status, statusText: response.statusText, data: response.data });
  }).catch(function(error) {
    callback({ error: true });
  });
}

backend.listItem = function(name, category, notes, image, from, to, email, token, callback) {
  axios.post('users/' + encodeURIComponent(email) + '/items', {
    name,
    category,
    notes,
    image,
    from,
    to
  }, {
    headers: {
      Authorization: 'Bearer ' + token
    }
  }).then(function(response) {
    callback({ status: response.status, statusText: response.statusText, data: response.data });
  }).catch(function(error) {
    callback({ error: true });
  });
}

backend.getItems = function(email, token, callback) {
  axios.get('items', {
    headers: {
      Authorization: 'Bearer ' + token,
      'X-User': email
    }
  }).then(function(response) {
    callback({ status: response.status, statusText: response.statusText, data: response.data });
  }).catch(function(error) {
    callback({ error: true });
  });
}

backend.acceptItem = function(id, email, token, callback) {
  axios.patch('items/' + encodeURIComponent(id), {}, {
    headers: {
      Authorization: 'Bearer ' + token,
      'X-User': email
    }
  }).then(function(response) {
    callback({ status: response.status, statusText: response.statusText, data: response.data });
  }).catch(function(error) {
    callback({ error: true });
  });
}

backend.getMyItems = function(email, token, callback) {
  axios.get('users/' + encodeURIComponent(email) + '/items', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  }).then(function(response) {
    callback({ status: response.status, statusText: response.statusText, data: response.data });
  }).catch(function(error) {
    callback({ error: true });
  });
}

