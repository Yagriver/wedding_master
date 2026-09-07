// Local previews use a separate test database; the public site uses Cloudflare.
window.RSVP_API_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? '/api'
  : 'https://wedding-rsvp.yagodeese.workers.dev';
