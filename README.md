# Chomp

## Getting started

Install this package using `npm i chomp-email`.

## Configuration

Import Chomp and configure with your API key and namespace.

```typescript
import Chomp from 'chomp-email';

const chomp = new Chomp({
  apiKey: 'YOUR_API_KEY',
});
```

## Waiting for an email

Start waiting for an email using the `waitFor()` method, like so.

```typescript
try {
  const email = await chomp.waitFor({
    tag: "YOUR_TAG",
  });
  console.log(email);
} catch (e) {
  console.log(e.message);
}

```

Send an email to `demo+YOUR_TAG@send.chomp.email` and after a few seconds the method will return the email information.
