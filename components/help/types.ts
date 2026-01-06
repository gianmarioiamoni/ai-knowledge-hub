export type FAQItem = {
  q: string;
  a: string;
};

export type HelpCard = {
  title: string;
  description: string;
  cta?: string;
  email?: string;
  sla?: string;
};

export type QuickLink = {
  title: string;
  body: string;
  href: string;
};

export type HelpPageLabels = {
  title: string;
  subtitle: string;
  description: string;
  cards: {
    manual: HelpCard;
    contact: HelpCard;
    support: HelpCard;
  };
  faq: {
    title: string;
    items: FAQItem[];
  };
  quick: {
    title: string;
    links: {
      documents: QuickLink;
      chat: QuickLink;
      procedures: QuickLink;
      plans: QuickLink;
    };
  };
};


