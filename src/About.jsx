const IMAGES = {
  hero:     "https://images.unsplash.com/photo-1576765608866-5b51046452be?w=1200&q=80&fit=crop&crop=top",
  story:    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80&fit=crop",
  kentucky: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&fit=crop",
  commit:   "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80&fit=crop",
};

const features = [
  {
    name: "Text Scanner",
    accent: "var(--vis)",
    audience: "Vision disabilities",
    body: "Reading a medicine bottle, a restaurant menu, or a letter from the government should not require a sighted helper. Text Scanner uses an open-source OCR engine that runs entirely on your device — no internet, no account — to read any printed text aloud.",
  },
  {
    name: "Live Captions",
    accent: "var(--hear)",
    audience: "Hearing disabilities",
    body: "Following a conversation in a noisy room, a classroom lecture, or a job interview is exhausting when you rely on lip-reading alone. Live Captions converts spoken words into large on-screen text in real time, with an automatic offline fallback for restricted networks.",
  },
  {
    name: "Color Finder",
    accent: "var(--vis)",
    audience: "Vision disabilities",
    body: "Matching clothing independently is one of the most commonly cited daily frustrations for blind individuals. Color Finder analyzes pixel data from any photo and reads out dominant colors by specific name — no external service, no waiting.",
  },
  {
    name: "Sound View",
    accent: "var(--hear)",
    audience: "Hearing disabilities",
    body: "Knowing whether a room is silent, whether someone is calling your name, or whether an alarm has gone off is information hearing people absorb without thinking. Sound View visualizes the full audio environment in real time so deaf users can see what they cannot hear.",
  },
];

export default function About() {
  return (
    <div className="animate-rise">

      <div className="relative rounded-main overflow-hidden mb-[18px] h-[260px] bg-card2">
        <img
          src={IMAGES.hero}
          alt="Person receiving accessibility support"
          className="w-full h-full object-cover block brightness-[0.38]"
          onError={e => { e.currentTarget.style.display = "none"; }}
        />
        <div className="absolute inset-0 flex flex-col justify-end p-7 bg-gradient-to-t from-[rgba(5,14,31,0.92)] to-transparent">
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-vis mb-2">
            Kentucky TSA Software Development 2025
          </p>
          <h1 className="font-display text-[clamp(22px,4vw,34px)] font-extrabold leading-[1.15] tracking-[-0.5px] text-white">
            Built for people we know,<br />in places we grew up.
          </h1>
        </div>
      </div>

      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3 mb-[18px]"
        role="list"
        aria-label="Key statistics"
      >
        {[
          { number: "2.2B",  note: "people worldwide live with vision impairment — WHO, 2023" },
          { number: "37.5M", note: "American adults report trouble hearing — NIDCD, 2023" },
          { number: "35%",   note: "of Kentucky adults live with at least one disability — CDC" },
          { number: "$0",    note: "is what Beacon costs to use, now and always" },
        ].map(({ number, note }) => (
          <div key={number} role="listitem" className="bg-card border border-line rounded-main p-[18px_16px] text-center">
            <div className="font-display text-[32px] font-extrabold text-vis leading-none">{number}</div>
            <div className="text-[11px] text-dim mt-[7px] leading-[1.5]">{note}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-[18px] mb-[18px] max-[640px]:grid-cols-1">
        <Card>
          <Label>Our Story</Label>
          <p className="text-sm leading-[1.75] text-dim">
            Beacon started with a frustration that felt personal. One of our
            team members has a grandmother in Pikeville who is legally blind.
            Every week, someone in the family drives over to read her mail,
            sort her medications, and help her pick out what to wear. She is
            sharp, capable, and independent in every other way — but the tools
            available to her are either too expensive, too complicated, or
            locked behind an internet connection she cannot always count on.
          </p>
          <p className="text-sm leading-[1.75] text-dim mt-3">
            We are students from Kentucky, and we asked a simple question: why
            does every accessibility app require a subscription, a login, or a
            stable broadband connection? The people those requirements lock out
            are the exact people who need the most help.
          </p>
          <p className="text-sm leading-[1.75] text-dim mt-3">
            So we built Beacon to work for anyone, anywhere, on whatever device
            they have. No accounts. No fees. No data ever leaves the device.
          </p>
        </Card>
        <PhotoBlock src={IMAGES.story} alt="Person using a laptop with assistive features" />
      </div>

      <div className="grid grid-cols-2 gap-[18px] mb-[18px] max-[640px]:grid-cols-1">
        <PhotoBlock src={IMAGES.kentucky} alt="Diverse group of people in a community" />
        <Card>
          <Label>Why Kentucky</Label>
          <p className="text-sm leading-[1.75] text-dim">
            Kentucky has one of the highest disability rates in the country.
            According to the CDC's Disability and Health Data System,
            1,253,016 adults in Kentucky — about 35 percent of the adult
            population — live with at least one disability. In rural eastern
            counties, that number climbs significantly higher, and access to
            assistive technology or trained specialists is limited by both
            geography and cost.
          </p>
          <p className="text-sm leading-[1.75] text-dim mt-3">
            We are not designing for an abstract user. We are designing for
            people in our communities, in a state where this gap is visible
            and measurable. Even a partial solution matters here.
          </p>
        </Card>
      </div>

      <Card className="mb-[18px]">
        <Label>What Each Feature Solves</Label>
        <div>
          {features.map(({ name, accent, audience, body }, i) => (
            <div
              key={name}
              className={`flex gap-[18px] py-4 ${i < features.length - 1 ? "border-b border-line" : ""}`}
            >
              <div
                className="w-[3px] rounded-[3px] flex-shrink-0 self-stretch"
                style={{ background: accent }}
                aria-hidden="true"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <span className="font-display text-base font-bold text-tx">{name}</span>
                  <span
                    className="text-[10px] font-bold tracking-[1.4px] uppercase px-[9px] py-[2px] rounded-full border"
                    style={{ color: accent, borderColor: `${accent}44`, background: `${accent}14` }}
                  >
                    {audience}
                  </span>
                </div>
                <p className="text-sm leading-[1.75] text-dim">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-[18px] mb-[18px] max-[640px]:grid-cols-1">
        <Card>
          <Label>Our Commitment</Label>
          <p className="text-sm leading-[1.75] text-dim">
            Beacon will always be free. The source code is public on GitHub.
            There is no data collection, no advertising, and no login wall.
            Every feature runs locally on your device using browser technology
            that ships with the hardware you already own.
          </p>
          <p className="text-sm leading-[1.75] text-dim mt-3">
            We are students, not engineers. This software is not perfect. But
            we believe the right starting point for any accessibility tool is
            a simple question: does this actually work for the person who needs
            it, on the device they have, in the place they live?
          </p>
          <div className="mt-[18px] px-[18px] py-[14px] bg-card2 rounded-[10px] border-l-[3px] border-vis">
            <p className="text-sm italic text-tx leading-[1.7] font-display font-medium">
              "Accessibility is not a feature. It is a baseline."
            </p>
          </div>
        </Card>
        <PhotoBlock src={IMAGES.commit} alt="Student working on a laptop" />
      </div>

      <div className="text-center py-5 text-mute text-xs leading-[2]">
        <span className="font-display text-[15px] font-bold text-tx">Beacon</span>
        <br />
        Kentucky TSA Software Development 2025
        <br />
        Runs entirely in your browser · No accounts · No fees · Open source
      </div>
    </div>
  );
}

function PhotoBlock({ src, alt }) {
  return (
    <div className="rounded-main overflow-hidden min-h-[260px] bg-card2">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover block min-h-[260px]"
        onError={e => { e.currentTarget.style.display = "none"; }}
      />
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="bg-card border border-line rounded-main p-[22px_24px]">
      {children}
    </div>
  );
}

function Label({ children }) {
  return (
    <p className="text-[11px] font-bold tracking-[1.4px] uppercase text-mute mb-[14px]">
      {children}
    </p>
  );
}
