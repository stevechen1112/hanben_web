import { soreDailyLifeStories, splitSoreDailyLifeStoryBody } from "@/lib/sore-daily-life-content";

export function SoreDailyLifeArticlesPage() {
  return (
    <div className="space-y-10 pb-8 pt-10 sm:space-y-12 sm:pt-12">
      <section className="mx-auto max-w-[760px] px-6 text-center sm:px-8">
        <h1 className="text-[2.1rem] font-semibold tracking-[-0.03em] text-[#2e2926] sm:text-[2.7rem]">
          痠痛日常
        </h1>
      </section>

      <section className="bg-[#e7e5e0]/80 px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-[800px] space-y-8">
          {soreDailyLifeStories.map((story) => {
            const paragraphs = splitSoreDailyLifeStoryBody(story.body);

            return (
              <article
                id={story.id}
                key={story.id}
                className="scroll-mt-28 rounded-[8px] bg-white px-5 py-8 shadow-[0_12px_30px_rgba(73,63,54,0.08)] sm:px-8 sm:py-10"
              >
                <div className="space-y-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={story.iconImageUrl}
                    alt=""
                    className="h-auto w-[92px]"
                  />
                  <div className="space-y-3 text-left">
                    <h2 className="text-[1.2rem] font-semibold leading-[1.45] tracking-[-0.01em] text-[#2e2926] sm:text-[1.36rem]">
                      {story.title}
                    </h2>
                    <p className="text-[0.98rem] font-medium text-[#4b433e]">
                      {story.meta}
                    </p>
                  </div>
                  <div className="space-y-4 text-[1rem] leading-8 text-[#3f3a37] sm:text-[1.02rem]">
                    {paragraphs.map((paragraph) => (
                      <p key={`${story.id}-${paragraph.slice(0, 24)}`}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}