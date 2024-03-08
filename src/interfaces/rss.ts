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

export const RssLinkSchema = z.object({
  _text: z.string(),
});

export type RssLink = z.infer<typeof RssLinkSchema>;

export const RssLinkWithRelSchema = z.object({
  _attributes: z.object({
    rel: z.string(),
    type: z.optional(z.string()),
    href: z.optional(z.string()),
    xmlns: z.optional(z.string()),
  }),
});

export type RssLinkWithRel = z.infer<typeof RssLinkWithRelSchema>;

export const RssFeedInfoSchema = z.object({
  rss: z.object({
    channel: z.object({
      title: z.object({
        _text: z.string(),
      }),
      link: z.union([
        RssLinkSchema,
        z.array(z.union([RssLinkSchema, RssLinkWithRelSchema])),
      ]),
      description: z.optional(
        z.object({
          _text: z.optional(z.string()),
          _cdata: z.optional(z.string()),
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
