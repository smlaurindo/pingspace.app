type PingContentType = "MARKDOWN" | "JSON";

type HttpAction = {
  type: "HTTP";
  label: string;
  url: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  headers?: unknown;
  body?: unknown;
};

type LinkAction = {
  type: "LINK";
  label: string;
  url: string;
};

type Action = HttpAction | LinkAction;

export type CreatePingRequest = {
  title?: string;
  contentType: PingContentType;
  content: string;
  tags: string[];
  actions: Action[];
  topicSlug: string;
  apiKeyId: string;
};

export type CreatePingResponse = {
  id: string;
  title: string;
  contentType: PingContentType;
  content: string;
  tags: {
    id: string;
    name: string;
  }[];
  actions: (Action & { id: string })[];
  topic: {
    id: string;
    slug: string;
  };
  spaceId: string;
  createdAt: Date;
};
