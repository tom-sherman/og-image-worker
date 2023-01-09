import * as React from "react";
import { ImageResponse } from "workers-og";
import { templates } from "./templates";
import { ImmutableHeaders } from "immurl";

type Context = EventContext<unknown, string, unknown>;

export default {
  async fetch(
    request: Request,
    _env: unknown,
    ctx: Context
  ): Promise<Response> {
    const pattern = new URLPattern({
      pathname: "/img/:template",
    });

    const url = new URL(request.url);

    const match = pattern.exec(url);

    if (!match) {
      return new Response("Not found", { status: 404 });
    }

    // Names cache so we can invalidate by changing the name
    const cache = await caches.open("og");
    const cached = await cache.match(request.url);
    if (cached) {
      console.log("Cache hit");
      return cached;
    }
    console.log("Cache miss");

    const response = await renderImageResponse(
      match.pathname.groups.template!,
      request,
      ctx
    );

    console.log("cache-control", response.headers.get("Cache-Control"));

    if (response.ok) {
      ctx.waitUntil(cache.put(request.url, response.clone()));
    }
    return response;
  },
};

async function renderImageResponse(
  templateName: string,
  request: Request,
  context: Context
): Promise<Response> {
  const module = templates[templateName];

  if (!module) {
    return new Response("Template not found", { status: 404 });
  }

  const { default: Component, propsSchema } = module;

  const url = new URL(request.url);
  const propsResult = propsSchema.safeParse(
    Object.fromEntries(url.searchParams.entries())
  );

  if (!propsResult.success) {
    return json(
      {
        message: "Invalid props",
        errors: propsResult.error.issues,
      },
      { status: 400 }
    );
  }

  return new ImageResponse(<Component {...propsResult.data} />, {
    width: 1128,
    height: 600,
    fonts: [
      {
        name: "Roboto",
        data: await fetchFont(
          "https://cdnjs.cloudflare.com/ajax/libs/materialize/0.98.1/fonts/roboto/Roboto-Regular.ttf",
          context
        ),
        weight: 400,
        style: "normal",
      },
    ],
    headers: {
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000",
    },
  });
}

function json(data: any, init?: ResponseInit) {
  const headers = new ImmutableHeaders(init?.headers);
  return new Response(JSON.stringify(data), {
    ...init,
    headers: headers.has("Content-Type")
      ? headers
      : headers.set("Content-Type", "application/json"),
  });
}

async function fetchFont(url: string, ctx: Context) {
  const cache = await caches.open("fonts");
  const cached = await cache.match(url);
  if (cached) {
    console.log("font cache hit");
    return cached.arrayBuffer();
  }
  console.log("font cache miss");
  const response = await fetch(url);
  ctx.waitUntil(cache.put(url, response.clone()));

  return response.arrayBuffer();
}
