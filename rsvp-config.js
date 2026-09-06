// Set to the deployed Worker URL when the public database is connected.
window.RSVP_API_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? '/api'
  : '';
