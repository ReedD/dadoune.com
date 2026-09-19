// Serves every page at its slash-less URL.
//
// Astro's directory output writes dist/contact/index.html, and the S3 website
// endpoint answers a request for /contact with a 302 to /contact/. That is
// where the trailing slashes came from: nothing asked for them, they are just
// what the endpoint does with a directory. This function moves the resolution
// in front of the origin, so /contact is rewritten to /contact/index.html and
// served at 200 with the address bar left alone.
//
// The slash form stays valid, as a 301 to the slash-less one, because it was
// the canonical URL here from the 2018 react-static build until now and is
// what search engines have indexed.

function queryString(qs) {
  var parts = [];
  for (var key in qs) {
    var param = qs[key];
    if (param.multiValue) {
      for (var i = 0; i < param.multiValue.length; i++) {
        parts.push(key + '=' + param.multiValue[i].value);
      }
    } else if (param.value === '') {
      parts.push(key);
    } else {
      parts.push(key + '=' + param.value);
    }
  }
  return parts.length === 0 ? '' : '?' + parts.join('&');
}

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // The root has no slash to drop.
  if (uri === '/') {
    request.uri = '/index.html';
    return request;
  }

  // Domain-verification files are written by other tools and are fetched at
  // the exact path they were put at, extension or not. Never touch them.
  if (uri.indexOf('/.well-known/') === 0) {
    return request;
  }

  // The old canonical form. One permanent hop, so the two URLs consolidate
  // rather than both staying in the index.
  if (uri.charAt(uri.length - 1) === '/') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: uri.slice(0, -1) + queryString(request.querystring) },
      },
    };
  }

  // Anything whose last segment carries an extension is a file: hashed assets,
  // sw.js, rss.xml, the sitemaps, favicon.ico. Straight through.
  var lastSegment = uri.slice(uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') !== -1) {
    return request;
  }

  // Everything else is a page.
  request.uri = uri + '/index.html';
  return request;
}
