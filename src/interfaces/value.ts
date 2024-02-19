import { z } from "../../deps.ts";

// https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md#value-recipient
export const ValueRecipientSchema = z.object({
  address: z.string(),
  split: z.coerce.number().max(100).min(0),
  type: z.string(),
  customKey: z.optional(z.string()),
  customValue: z.optional(z.string()),
  fee: z.optional(z.boolean()),
  name: z.optional(z.string()),
});

export type ValueRecipient = z.infer<typeof ValueRecipientSchema>;

// https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md#value
export const ValueSchema = z.object({
  type: z.string(),
  method: z.string(),
  suggested: z.optional(z.coerce.number()),
});

export type Value = z.infer<typeof ValueSchema>;

export const PodcastIndexApiValueSchema = z.object({
  model: ValueSchema,
  destinations: z.array(ValueRecipientSchema),
});

export type PodcastIndexApiValue = z.infer<typeof PodcastIndexApiValueSchema>;

// Remote Items

export const RemoteItemSchema = z.object({
  feedGuid: z.string(),
  feedUrl: z.optional(z.string()),
  itemGuid: z.optional(z.string()),
  medium: z.optional(z.string()),
});

export type RemoteItem = z.infer<typeof RemoteItemSchema>;

export const RemoteItemsSchema = z.array(RemoteItemSchema);

export type RemoteItems = z.infer<typeof RemoteItemsSchema>;

export const RemoteItemWithParentSchema = RemoteItemSchema.extend({
  parent: z.enum(["channel", "podcast:podroll", "podcast:valueTimeSplit"]),
});

export type RemoteItemWithParent = z.infer<typeof RemoteItemWithParentSchema>;

export const RemoteItemsWithParentSchema = z.array(RemoteItemWithParentSchema);

export type RemoteItemsWithParent = z.infer<typeof RemoteItemsWithParentSchema>;
