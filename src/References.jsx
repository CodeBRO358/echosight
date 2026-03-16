const sections = [
  {
    title: "Vision Impairment",
    entries: [
      {
        authors: "World Health Organization",
        title: "Blindness and visual impairment",
        source: "WHO Fact Sheets",
        year: "2023",
        url: "https://www.who.int/news-room/fact-sheets/detail/blindness-and-visual-impairment",
        note: "Source for the 2.2 billion figure on global vision impairment.",
      },
      {
        authors: "World Health Organization",
        title: "World report on vision",
        source: "WHO Publications",
        year: "2019",
        url: "https://www.who.int/publications/i/item/9789241516570",
        note: "Foundational report on the global scope of vision loss and its consequences.",
      },
      {
        authors: "GBD 2019 Blindness and Vision Impairment Collaborators",
        title: "Causes of blindness and vision impairment in 2020 and trends over 30 years",
        source: "The Lancet Global Health, 9(2), e144–e160",
        year: "2021",
        url: "https://doi.org/10.1016/S2214-109X(20)30489-7",
        note: "Peer-reviewed meta-analysis underpinning global prevalence statistics.",
      },
      {
        authors: "International Agency for the Prevention of Blindness",
        title: "IAPB Vision Atlas",
        source: "visionatlas.iapb.org",
        year: "2023",
        url: "https://visionatlas.iapb.org/",
        note: "Interactive data dashboard for global eye health statistics.",
      },
    ],
  },
  {
    title: "Hearing Loss",
    entries: [
      {
        authors: "National Institute on Deafness and Other Communication Disorders (NIDCD)",
        title: "Quick Statistics About Hearing, Balance, and Dizziness",
        source: "NIDCD, National Institutes of Health",
        year: "2023",
        url: "https://www.nidcd.nih.gov/health/statistics/quick-statistics-hearing",
        note: "Source for U.S. hearing loss prevalence statistics including the 37.5 million and 1-in-8 figures.",
      },
      {
        authors: "Haile, L.M. et al. (GBD 2019 USA Hearing Loss Collaborators)",
        title: "Hearing Loss Prevalence, Years Lived With Disability, and Hearing Aid Use in the United States From 1990 to 2019",
        source: "Ear and Hearing, 45(1), 257–267",
        year: "2024",
        url: "https://doi.org/10.1097/AUD.0000000000001420",
        note: "Comprehensive GBD study on the U.S. burden of hearing loss.",
      },
      {
        authors: "National Institute on Deafness and Other Communication Disorders (NIDCD)",
        title: "Age-Related Hearing Loss (Presbycusis)",
        source: "NIDCD, NIH Publication No. 23-DC-4235",
        year: "2023",
        url: "https://www.nidcd.nih.gov/health/age-related-hearing-loss",
        note: "Context on the relationship between age and hearing loss.",
      },
    ],
  },
  {
    title: "Kentucky Disability Data",
    entries: [
      {
        authors: "Centers for Disease Control and Prevention",
        title: "Disability and Health Data System (DHDS)",
        source: "CDC, National Center on Birth Defects and Developmental Disabilities",
        year: "2024",
        url: "https://dhds.cdc.gov",
        note: "Source for the 35% Kentucky adult disability rate (1,253,016 individuals) and the $14B annual healthcare cost figure.",
      },
      {
        authors: "Centers for Disease Control and Prevention",
        title: "CDC Data Shows Over 70 Million U.S. Adults Reported Having a Disability",
        source: "CDC Online Newsroom",
        year: "2024",
        url: "https://www.cdc.gov/media/releases/2024/s0716-adult-disability.html",
        note: "National context for the 1-in-4 U.S. adults disability statistic.",
      },
      {
        authors: "University of Montana Rural Institute on Disabilities",
        title: "Kentucky State Disability Profile",
        source: "Rural Disability Research, University of Montana",
        year: "2020",
        url: "https://www.umt.edu/rural-disability-research/focus-areas/disability_maps/state-maps/kentucky.php",
        note: "County-level disability rate mapping for Kentucky, showing elevated rates in eastern rural counties.",
      },
      {
        authors: "Kentucky Workforce Innovation Board / U.S. Department of Education",
        title: "WIOA State Plan — Workforce Analysis: Disability and Health",
        source: "WIOA State Plan Portal",
        year: "2023",
        url: "https://wioaplans.ed.gov/node/20636",
        note: "Source for the 450,700 figure on working-age Kentuckians with a disability.",
      },
    ],
  },
  {
    title: "Technologies Used",
    entries: [
      {
        authors: "Naptha / naptha.js contributors",
        title: "Tesseract.js — Pure JavaScript OCR for more than 100 Languages",
        source: "GitHub: naptha/tesseract.js",
        year: "2024",
        url: "https://github.com/naptha/tesseract.js",
        note: "Open-source JavaScript port of Google's Tesseract OCR engine. Used in Beacon's Text Scanner feature.",
      },
      {
        authors: "Google / Open Source Community",
        title: "Tesseract OCR Engine",
        source: "GitHub: tesseract-ocr/tesseract",
        year: "2024",
        url: "https://github.com/tesseract-ocr/tesseract",
        note: "The underlying C++ OCR engine originally developed by HP and released by Google.",
      },
      {
        authors: "Mozilla Developer Network (MDN)",
        title: "Web Speech API — SpeechRecognition",
        source: "MDN Web Docs",
        year: "2024",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition",
        note: "Browser-native speech-to-text API used for Beacon's Live Captions feature.",
      },
      {
        authors: "Mozilla Developer Network (MDN)",
        title: "Web Speech API — SpeechSynthesis",
        source: "MDN Web Docs",
        year: "2024",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis",
        note: "Browser-native text-to-speech API used for read-aloud functionality across all features.",
      },
      {
        authors: "Mozilla Developer Network (MDN)",
        title: "Web Audio API — AnalyserNode",
        source: "MDN Web Docs",
        year: "2024",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode",
        note: "Real-time audio frequency analysis API used in Beacon's Sound View feature.",
      },
      {
        authors: "Mozilla Developer Network (MDN)",
        title: "Canvas API",
        source: "MDN Web Docs",
        year: "2024",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API",
        note: "Used for pixel-level color analysis in Color Finder and waveform rendering in Sound View.",
      },
      {
        authors: "Mozilla Developer Network (MDN)",
        title: "MediaRecorder API",
        source: "MDN Web Docs",
        year: "2024",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder",
        note: "Used in the chunked fallback mode of Live Captions for restricted networks.",
      },
      {
        authors: "Meta Open Source / React Contributors",
        title: "React — The library for web and native user interfaces",
        source: "react.dev",
        year: "2024",
        url: "https://react.dev",
        note: "JavaScript UI framework used to build the Beacon interface.",
      },
      {
        authors: "Vite Contributors",
        title: "Vite — Next Generation Frontend Tooling",
        source: "vitejs.dev",
        year: "2024",
        url: "https://vitejs.dev",
        note: "Build tool and development server used for the Beacon project.",
      },
    ],
  },
  {
    title: "Images",
    entries: [
      {
        authors: "Unsplash Contributors",
        title: "Hero image — elderly woman using a tablet",
        source: "Unsplash (free-use license)",
        year: "2024",
        url: "https://unsplash.com/photos/Cb4G4G5G4G4",
        note: "About page hero image. Used under the Unsplash License.",
      },
      {
        authors: "Unsplash Contributors",
        title: "Family assistance image",
        source: "Unsplash (free-use license)",
        year: "2024",
        url: "https://unsplash.com",
        note: "About page section image. Used under the Unsplash License.",
      },
      {
        authors: "Unsplash Contributors",
        title: "Assistive technology image",
        source: "Unsplash (free-use license)",
        year: "2024",
        url: "https://unsplash.com",
        note: "About page section image. Used under the Unsplash License.",
      },
      {
        authors: "Unsplash Contributors",
        title: "Student at computer image",
        source: "Unsplash (free-use license)",
        year: "2024",
        url: "https://unsplash.com",
        note: "About page section image. Used under the Unsplash License.",
      },
    ],
  },
];

export default function References() {
  return (
    <div style={{ animation: "rise 0.45s ease both" }}>
      <div style={{ marginBottom: 26 }}>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: 26,
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: 6,
            letterSpacing: "-0.3px",
          }}
        >
          References &{" "}
          <span style={{ color: "var(--vis)", fontStyle: "italic" }}>
            Citations
          </span>
        </h1>
        <p
          style={{
            color: "var(--dim)",
            fontSize: 14,
            lineHeight: 1.65,
            maxWidth: 520,
          }}
        >
          All statistics, research, and third-party content used in Beacon are
          cited below. Sources are organized by category.
        </p>
      </div>

      {sections.map(({ title, entries }) => (
        <div
          key={title}
          style={{
            background: "var(--surf)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r)",
            marginBottom: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 22px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surf2)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                color: "var(--vis)",
              }}
            >
              {title}
            </span>
          </div>

          {entries.map((entry, i) => (
            <div
              key={i}
              style={{
                padding: "16px 22px",
                borderBottom:
                  i < entries.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text)",
                      lineHeight: 1.4,
                      marginBottom: 3,
                    }}
                  >
                    {entry.title}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--dim)",
                      lineHeight: 1.5,
                      marginBottom: 2,
                    }}
                  >
                    {entry.authors}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--mute)",
                      lineHeight: 1.5,
                    }}
                  >
                    {entry.source}
                    {entry.year ? ` · ${entry.year}` : ""}
                  </p>
                  {entry.note && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--dim)",
                        lineHeight: 1.5,
                        marginTop: 6,
                        fontStyle: "italic",
                      }}
                    >
                      {entry.note}
                    </p>
                  )}
                </div>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open source: ${entry.title}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--vis)",
                    background: "var(--vis-s)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "opacity 0.15s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  View Source
                </a>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div
        style={{
          background: "var(--surf)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          padding: "18px 22px",
          marginBottom: 8,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "1.4px",
            textTransform: "uppercase",
            color: "var(--mute)",
            marginBottom: 10,
          }}
        >
          Citation Format
        </p>
        <p
          style={{ fontSize: 13, color: "var(--dim)", lineHeight: 1.7 }}
        >
          Citations follow APA 7th edition style. All URLs were last accessed
          in 2025. Statistics from government sources (CDC, NIDCD, WHO) reflect
          the most recent data available at time of project submission. All
          images are used under the{" "}
          <a
            href="https://unsplash.com/license"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--vis)", textDecoration: "underline" }}
          >
            Unsplash License
          </a>
          , which permits free use without attribution requirements.
        </p>
      </div>
    </div>
  );
}
