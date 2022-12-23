import * as React from "react";
import { z } from "zod";

export const propsSchema = z.object({
  title: z.string(),
});

export default function Card({ title }: { title: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        fontFamily: "sans-serif",
        background: "#160f29",
      }}
    >
      <div
        style={{ display: "flex", width: "100vw", padding: 40, color: "white" }}
      >
        <h1
          style={{
            fontSize: "60px",
            fontWeight: "600",
            margin: 0,
            fontFamily: "Roboto",
          }}
        >
          ${title}
        </h1>
      </div>
    </div>
  );
}
