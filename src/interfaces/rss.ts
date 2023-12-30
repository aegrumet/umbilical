import { z } from "../../deps.ts";

export const RssWithPodrollSchema = z.object({
  rss: z.object({
    channel: z.object({
      "podcast:podroll": z.object({
        "podcast:remoteItem": z.array(
          z.object({
            _attributes: z.object({
              feedGuid: z.optional(z.string()),
              feedUrl: z.optional(z.string()),
            }),
          })
        ),
      }),
    }),
  }),
});

export const RssFeedInfoSchema = z.object({
  rss: z.object({
    channel: z.object({
      title: z.object({
        _text: z.string(),
      }),
      link: z.optional(
        z.object({
          _text: z.string(),
        })
      ),
      description: z.optional(
        z.object({
          _text: z.string(),
        })
      ),
      image: z.optional(
        z.object({
          url: z.object({
            _text: z.string(),
          }),
        })
      ),
    }),
  }),
});

export type RssFeedInfo = z.infer<typeof RssFeedInfoSchema>;
export type RssWithPodroll = z.infer<typeof RssWithPodrollSchema>;
