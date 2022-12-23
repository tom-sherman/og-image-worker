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
    // Names cache so we can invalidate by changing the name
    const cache = await caches.open("og");
    const cached = await cache.match(request);
    if (cached) {
      console.log("Cache hit");
      return cached;
    }
    console.log("Cache miss");
    const pattern = new URLPattern({
      pathname: "/img/:template",
    });

    const url = new URL(request.url);

    const match = pattern.exec(url);

    console.log(match);

    if (!match) {
      return new Response("Not found", { status: 404 });
    }

    // Non-null assertion is safe because the pattern won't match otherwise
    const templateName = match.pathname.groups.template!;

    const module = templates[templateName];

    if (!module) {
      return new Response("Template not found", { status: 404 });
    }

    const { default: Component, propsSchema } = module;

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

    console.log(propsResult.data);

    const response = new ImageResponse(<Component {...propsResult.data} />, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Roboto",
          data: await fetch(
            "https://cdnjs.cloudflare.com/ajax/libs/materialize/0.98.1/fonts/roboto/Roboto-Regular.ttf"
          ).then((res) => res.arrayBuffer()),
          weight: 400,
          style: "normal",
        },
      ],
    });

    ctx.waitUntil(cache.put(request, response.clone()));
    return response;
  },
};

const json = (data: any, init?: ResponseInit) => {
  const headers = new ImmutableHeaders(init?.headers);
  return new Response(JSON.stringify(data), {
    ...init,
    headers: headers.has("Content-Type")
      ? headers
      : headers.set("Content-Type", "application/json"),
  });
};
