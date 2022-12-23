import * as React from "react";
import { ZodSchema } from "zod";
import * as ogBlog from "./og-blog";

interface TemplateModule {
  default: React.ComponentType<any>;
  propsSchema: ZodSchema<any>;
}

export const templates = {
  "og-blog": ogBlog,
} as Record<string, TemplateModule>;
