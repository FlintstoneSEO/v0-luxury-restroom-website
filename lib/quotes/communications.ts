export type CustomerMessage = {
  id: string;
  changed_at: string;
  message: string;
};

export type QuoteCommunications = {
  messages: CustomerMessage[];
  error: boolean;
};
