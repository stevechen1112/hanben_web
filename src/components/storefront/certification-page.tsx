export function CertificationPage({
  title,
  imageUrl,
  imageAlt,
  bodyHtml,
}: {
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  bodyHtml?: string | null;
}) {
  return (
    <div className="mx-auto max-w-[1120px] px-4 pt-8 pb-4 sm:px-6 lg:px-0">
      <div className="text-center">
        <h1 className="text-[2.45rem] font-semibold tracking-[-0.04em] text-[#232323] sm:text-[2.8rem]">{title}</h1>
      </div>

      {imageUrl ? (
        <div className="mt-6">
          <img src={imageUrl} alt={imageAlt || title} className="w-full object-contain" />
        </div>
      ) : null}

      {bodyHtml ? (
        <div className="mt-6">
          <div className="storefront-prose mx-auto max-w-[760px]" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        </div>
      ) : null}
    </div>
  );
}