# Chomp

## Getting started

Install this package using `npm i chomp-email`.

## Configuration

Import Chomp and configure with your API key and namespace.

```typescript
import Chomp from 'chomp-email';

const chomp = new Chomp({
  apiKey: 'YOUR_API_KEY',
  namespace: 'demo'
});
```

## Waiting for an email

Start waiting for an email using the `waitFor()` method, like so.

```typescript
const email = await chomp.waitFor({
  tag: "my_tag",
});
console.log(email);
```

Send an email to `demo+my_tag@send.chomp.email` and after a few seconds the method will return the email information.
