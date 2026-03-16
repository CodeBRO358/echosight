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
    <div style={{ animation: "rise 0.45s ease both" }}>

      <div
        style={{
          position: "relative",
          borderRadius: "var(--r)",
          overflow: "hidden",
          marginBottom: 18,
          height: 260,
          background: "var(--surf2)",
        }}
      >
        <img
          src={IMAGES.hero}
          alt="Person receiving accessibility support"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            filter: "brightness(0.38)",
          }}
          onError={e => { e.currentTarget.style.display = "none"; }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "28px 30px",
            background: "linear-gradient(to top, rgba(5,14,31,0.92) 40%, transparent)",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--vis)",
              marginBottom: 8,
            }}
          >
            Kentucky TSA Software Development 2025
          </p>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(22px, 4vw, 34px)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.5px",
              color: "#fff",
            }}
          >
            Built for people we know,
            <br />
            in places we grew up.
          </h1>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
        role="list"
        aria-label="Key statistics"
      >
        {[
          { number: "2.2B",  note: "people worldwide live with vision impairment — WHO, 2023" },
          { number: "37.5M", note: "American adults report trouble hearing — NIDCD, 2023" },
          { number: "35%",   note: "of Kentucky adults live with at least one disability — CDC" },
          { number: "$0",    note: "is what Beacon costs to use, now and always" },
        ].map(({ number, note }) => (
          <div
            key={number}
            role="listitem"
            style={{
              background: "var(--surf)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r)",
              padding: "18px 16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--display)",
                fontSize: 32,
                fontWeight: 800,
                color: "var(--vis)",
                lineHeight: 1,
              }}
            >
              {number}
            </div>
            <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 7, lineHeight: 1.5 }}>
              {note}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <Card>
          <Label>Our Story</Label>
          <p style={body}>
            Beacon started with a frustration that felt personal. One of our
            team members has a grandmother in Pikeville who is legally blind.
            Every week, someone in the family drives over to read her mail,
            sort her medications, and help her pick out what to wear. She is
            sharp, capable, and independent in every other way — but the tools
            available to her are either too expensive, too complicated, or
            locked behind an internet connection she cannot always count on.
          </p>
          <p style={{ ...body, marginTop: 12 }}>
            We are students from Kentucky, and we asked a simple question: why
            does every accessibility app require a subscription, a login, or a
            stable broadband connection? The people those requirements lock out
            are the exact people who need the most help.
          </p>
          <p style={{ ...body, marginTop: 12 }}>
            So we built Beacon to work for anyone, anywhere, on whatever device
            they have. No accounts. No fees. No data ever leaves the device.
          </p>
        </Card>

        <PhotoBlock src={IMAGES.story} alt="Person using a laptop with assistive features" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <PhotoBlock src={IMAGES.kentucky} alt="Diverse group of people in a community" />

        <Card>
          <Label>Why Kentucky</Label>
          <p style={body}>
            Kentucky has one of the highest disability rates in the country.
            According to the CDC's Disability and Health Data System,
            1,253,016 adults in Kentucky — about 35 percent of the adult
            population — live with at least one disability. In rural eastern
            counties, that number climbs significantly higher, and access to
            assistive technology or trained specialists is limited by both
            geography and cost.
          </p>
          <p style={{ ...body, marginTop: 12 }}>
            We are not designing for an abstract user. We are designing for
            people in our communities, in a state where this gap is visible
            and measurable. Even a partial solution matters here.
          </p>
        </Card>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <Label>What Each Feature Solves</Label>
        <div>
          {features.map(({ name, accent, audience, body: text }, i) => (
            <div
              key={name}
              style={{
                display: "flex",
                gap: 18,
                padding: "16px 0",
                borderBottom: i < features.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                style={{
                  width: 3,
                  borderRadius: 3,
                  background: accent,
                  flexShrink: 0,
                  alignSelf: "stretch",
                }}
                aria-hidden="true"
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 5,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--display)",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    {name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "1.4px",
                      textTransform: "uppercase",
                      color: accent,
                      padding: "2px 9px",
                      borderRadius: 999,
                      border: `1px solid ${accent}44`,
                      background: `${accent}14`,
                    }}
                  >
                    {audience}
                  </span>
                </div>
                <p style={body}>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <Card>
          <Label>Our Commitment</Label>
          <p style={body}>
            Beacon will always be free. The source code is public on GitHub.
            There is no data collection, no advertising, and no login wall.
            Every feature runs locally on your device using browser technology
            that ships with the hardware you already own.
          </p>
          <p style={{ ...body, marginTop: 12 }}>
            We are students, not engineers. This software is not perfect. But
            we believe the right starting point for any accessibility tool is
            a simple question: does this actually work for the person who needs
            it, on the device they have, in the place they live?
          </p>
          <div
            style={{
              marginTop: 18,
              padding: "14px 18px",
              background: "var(--surf2)",
              borderRadius: "var(--rsm)",
              borderLeft: "3px solid var(--vis)",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontStyle: "italic",
                color: "var(--text)",
                lineHeight: 1.7,
                fontFamily: "var(--display)",
                fontWeight: 500,
              }}
            >
              "Accessibility is not a feature. It is a baseline."
            </p>
          </div>
        </Card>

        <PhotoBlock src={IMAGES.commit} alt="Student working on a laptop" />
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "20px 16px 4px",
          color: "var(--mute)",
          fontSize: 12,
          lineHeight: 2,
        }}
      >
        <span
          style={{
            fontFamily: "var(--display)",
            fontSize: 15,
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          Beacon
        </span>
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
    <div
      style={{
        borderRadius: "var(--r)",
        overflow: "hidden",
        minHeight: 260,
        background: "var(--surf2)",
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          minHeight: 260,
        }}
        onError={e => { e.currentTarget.style.display = "none"; }}
      />
    </div>
  );
}

function Card({ children }) {
  return (
    <div
      style={{
        background: "var(--surf)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r)",
        padding: "22px 24px",
      }}
    >
      {children}
    </div>
  );
}

function Label({ children }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "1.4px",
        textTransform: "uppercase",
        color: "var(--mute)",
        marginBottom: 14,
      }}
    >
      {children}
    </p>
  );
}

const body = {
  fontSize: 14,
  lineHeight: 1.75,
  color: "var(--dim)",
};
