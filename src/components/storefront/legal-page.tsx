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

function parseLegalTitle(bodyHtml?: string | null) {
  if (!bodyHtml) {
    return null;
  }

  const match = bodyHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? stripTags(match[1]) : null;
}

function stripLeadingTitle(bodyHtml?: string | null) {
  if (!bodyHtml) {
    return "";
  }

  return bodyHtml.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, "").trim();
}

export function LegalPage({ title, bodyHtml }: { title: string; bodyHtml?: string | null }) {
  const resolvedTitle = parseLegalTitle(bodyHtml) || title;
  const contentHtml = stripLeadingTitle(bodyHtml);

  return (
    <div className="bg-white pb-16 pt-20 sm:pt-24">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-0">
        <h1 className="text-center text-[2.45rem] font-semibold tracking-[-0.04em] text-[#232323] sm:text-[2.9rem]">
          {resolvedTitle}
        </h1>

        <div className="mx-auto mt-10 max-w-[980px]">
          <div className="storefront-prose max-w-none text-[#4f4f4f]" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>
    </div>
  );
}