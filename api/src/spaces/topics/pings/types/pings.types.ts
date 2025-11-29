type PingContentType = "MARKDOWN" | "JSON";

type HttpAction = {
  type: "HTTP";
  label: string;
  url: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  headers?: string;
  body?: string;
};

type LinkAction = {
  type: "LINK";
  label: string;
  url: string;
};

type Action = HttpAction | LinkAction;

export type CreatePingData = {
  title: string;
  contentType: PingContentType;
  content: string;
  tags: string[];
  actions: Action[];
  apiKeyId: string;
  topicId: string;
};

export type Ping = {
  id: string;
  title: string;
  contentType: PingContentType;
  content: string;
  tags: {
    id: string;
    name: string;
  }[];
  actions: (Action & { id: string })[];
  topicId: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type ListPingQuery = {
  topicId: string;
  cursor?: string;
  limit: number;
};

export type PaginatedPings = {
  items: Omit<Ping, "topicId">[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
};
