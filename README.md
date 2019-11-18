# Signing Proxy

Very rudimentary implementation of a transparent HTTP(s) proxy that signs all requests as per [draft-cavage-http-signatures-00](https://tools.ietf.org/html/draft-cavage-http-signatures-00).

## Usage

Step 1: Create image

```
docker build -t $USER/playground-signing-proxy .
```

Step 2: Create container

```
docker run --name signing-proxy \
    --rm \
    -p 5050:5050 \
    -e KEY_ID="<YOUR_KEY_ID>" \
    -e KEY_SECRET="<YOUR_KEY_SECRET>" \
    $USER/playground-signing-proxy
```

Step 3: Use proxy to sign requests

```
curl -x localhost:5050 \
    -XGET \
    "http://some.domain.tld/path/to/api?param=value" \
    -H "Content-Type: application/json" \
    -d '{"key": "value"}'
```