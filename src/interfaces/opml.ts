import { z } from "../../deps.ts";

export const FeedForOpmlSchema = z.object({
  feed: z.object({
    url: z.string(),
    title: z.string(),
    description: z.string(),
    link: z.string(),
    image: z.string(),
  }),
});

export type FeedForOpml = z.infer<typeof FeedForOpmlSchema>;
