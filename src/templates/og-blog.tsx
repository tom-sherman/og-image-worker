import * as React from "react";
import { z } from "zod";

export const propsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});

export default function OgBlog({
  title,
  description,
}: z.infer<typeof propsSchema>) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Roboto",
        background: "#160f29",
        padding: 10,
      }}
    >
      <div
        style={{
          color: "white",
          border: "5px solid white",
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flexGrow: 1,
          width: "100%",
          padding: 40,
        }}
      >
        <h1
          style={{
            fontSize: 100,
            fontWeight: "600",
          }}
        >
          {title}
        </h1>
        {description && (
          <p style={{ fontSize: 60, maxWidth: "100vw", opacity: 0.6 }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
