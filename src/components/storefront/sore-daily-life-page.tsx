import { soreDailyLifeStories } from "@/lib/sore-daily-life-content";

export function SoreDailyLifePage() {
  return (
    <div className="space-y-10 pb-8 pt-10 sm:space-y-12 sm:pt-12">
      <section className="mx-auto max-w-[760px] px-6 text-center sm:px-8">
        <h1 className="text-[2.1rem] font-semibold tracking-[-0.03em] text-[#2e2926] sm:text-[2.7rem]">
          痠痛日常
        </h1>
      </section>

      <section className="bg-[#e7e5e0]/80 px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {soreDailyLifeStories.map((story) => (
            <a
              key={story.id}
              href={`/pages/sore-daily-life-articles#${story.id}`}
              className="group relative overflow-hidden rounded-[12px] bg-[#7f1d1d] shadow-[0_12px_30px_rgba(82,41,33,0.14)]"
            >
              <div className="aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.cardImageUrl}
                  alt={story.meta}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#571d19]/88 via-[#6f241f]/54 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 px-3 pb-5 pt-16 text-center sm:px-4 sm:pb-6">
                <p className="text-[0.95rem] font-medium tracking-[0.01em] text-white sm:text-base">
                  {story.meta}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}