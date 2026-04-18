import { ChevronDown } from "lucide-react";

type FaqItem = {
  question: string;
  paragraphs: string[];
};

function stripTags(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFaqTitle(bodyHtml?: string | null) {
  if (!bodyHtml) {
    return null;
  }

  const match = bodyHtml.match(/<h1>([\s\S]*?)<\/h1>/i);
  return match ? stripTags(match[1]).replace(/\s+/g, "") : null;
}

function parseFaqItems(bodyHtml?: string | null): FaqItem[] {
  if (!bodyHtml) {
    return [];
  }

  const items: FaqItem[] = [];
  const sectionPattern = /<h3>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3>|$)/gi;

  for (const match of bodyHtml.matchAll(sectionPattern)) {
    const question = stripTags(match[1]);
    const body = match[2] ?? "";
    const paragraphs = Array.from(body.matchAll(/<p>([\s\S]*?)<\/p>/gi))
      .map((paragraphMatch) => stripTags(paragraphMatch[1]))
      .filter(Boolean);

    if (question) {
      items.push({ question, paragraphs });
    }
  }

  return items;
}

export function FaqPage({ title, bodyHtml }: { title: string; bodyHtml?: string | null }) {
  const resolvedTitle = parseFaqTitle(bodyHtml) || title;
  const items = parseFaqItems(bodyHtml);

  return (
    <div className="bg-white pb-16 pt-20 sm:pt-24">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-0">
        <h1 className="text-center text-[2.45rem] font-semibold tracking-[-0.04em] text-[#232323] sm:text-[2.9rem]">{resolvedTitle}</h1>

        <div className="mx-auto mt-16 max-w-[840px] border-t border-[#8f8f8f]">
          {items.map((item) => (
            <details key={item.question} className="group border-b border-[#8f8f8f]">
              <summary className="flex list-none cursor-pointer items-center justify-between gap-6 py-4 text-[1.08rem] font-medium text-[#434343] marker:hidden [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#4b4b4b] transition-transform group-open:rotate-180" />
              </summary>
              <div className="pb-5 pr-8 text-[0.98rem] leading-[1.95] text-[#5c5c5c]">
                {item.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-2 first:mt-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}