# og-image-worker

A Cloudflare Worker for generating og:image images for tom-sherman.com and other associated sites.

## How does it work?

This worker uses satori and resvg (via WASM) to generate an image from a JSX template. You can specify the template in the URL and props in the query string like so:

```
GET /img/some-template-name?title=Hello%20World
```

Each template lives in the `src/templates` directory in a file named `[template-name].tsx`. It exports two things:

- a default export: a React component that takes a `props` object as a prop
- A zod schema called `propsSchema` that validates the props object

Example:

```tsx
import { z } from "zod";

export const propsSchema = z.object({
  title: z.string(),
});

export default function SomeTemplate(props: z.infer<typeof propsSchema>) {
  return (
    <div>
      <h1>{props.title}</h1>
    </div>
  )
}
```
