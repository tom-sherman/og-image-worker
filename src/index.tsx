import * as React from "react";
import { ImageResponse } from "workers-og";
import { ImmutableHeaders } from "immurl";
import { ZodSchema } from "zod";

interface TemplateModule {
  default: React.ComponentType<any>;
  propsSchema: ZodSchema<any>;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const pattern = new URLPattern({
      pathname: "/img/:template",
    });

    const url = new URL(request.url);

    const match = pattern.exec(url);

    if (!match) {
      return new Response("Not found", { status: 404 });
    }

    // Non-null assertion is safe because the pattern won't match otherwise
    const templateName = match.pathname.groups.template!;

    let module: TemplateModule;
    try {
      module = await import(`./templates/${templateName}`);
    } catch (error) {
      console.error(error);
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

    return new ImageResponse(<Component {...propsResult.data} />, {
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
