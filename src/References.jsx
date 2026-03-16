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
        note: "Source for U.S. hearing loss prevalence including the 37.5 million and 1-in-8 figures.",
      },
      {
        authors: "National Institute on Deafness and Other Communication Disorders (NIDCD)",
        title: "Age-Related Hearing Loss (Presbycusis)",
        source: "NIDCD, NIH Publication No. 23-DC-4235",
        year: "2023",
        url: "https://www.nidcd.nih.gov/health/age-related-hearing-loss",
        note: "Context on the relationship between age and hearing loss.",
      },
      {
        authors: "World Health Organization",
        title: "Deafness and hearing loss",
        source: "WHO Fact Sheets",
        year: "2023",
        url: "https://www.who.int/news-room/fact-sheets/detail/deafness-and-hearing-loss",
        note: "Global hearing loss statistics and impact overview.",
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
        url: "https://dhds.cdc.gov/",
        note: "Source for the 35% Kentucky adult disability rate and state-level disability data.",
      },
      {
        authors: "Centers for Disease Control and Prevention",
        title: "Disability Impacts All of Us",
        source: "CDC Disability and Health Promotion",
        year: "2023",
        url: "https://www.cdc.gov/ncbddd/disabilityandhealth/infographic-disability-impacts-all.html",
        note: "Source for the 1-in-4 U.S. adults disability statistic and national context.",
      },
      {
        authors: "Centers for Disease Control and Prevention",
        title: "Disability and Health State Chartbook, 2023",
        source: "CDC, National Center on Birth Defects and Developmental Disabilities",
        year: "2023",
        url: "https://www.cdc.gov/ncbddd/disabilityandhealth/documents/disability_chartbook_2023.pdf",
        note: "State-by-state disability prevalence data used for Kentucky-specific statistics.",
      },
    ],
  },
  {
    title: "Technologies Used",
    entries: [
      {
        authors: "naptha / Tesseract.js contributors",
        title: "Tesseract.js — Pure JavaScript OCR for more than 100 Languages",
        source: "GitHub: naptha/tesseract.js",
        year: "2024",
        url: "https://github.com/naptha/tesseract.js",
        note: "Open-source JavaScript port of Google's Tesseract OCR engine. Used in Beacon's Text Scanner.",
      },
      {
        authors: "Mozilla Developer Network",
        title: "Web Speech API — SpeechRecognition",
        source: "MDN Web Docs",
        year: "2024",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition",
        note: "Browser-native speech-to-text API used for Beacon's Live Captions feature.",
      },
      {
        authors: "Mozilla Developer Network",
        title: "Web Speech API — SpeechSynthesis",
        source: "MDN Web Docs",
        year: "2024",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis",
        note: "Browser-native text-to-speech API used for read-aloud functionality across all features.",
      },
      {
        authors: "Mozilla Developer Network",
        title: "Web Audio API — AnalyserNode",
        source: "MDN Web Docs",
        year: "2024",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode",
        note: "Real-time audio frequency analysis API used in Beacon's Sound View feature.",
      },
      {
        authors: "Mozilla Developer Network",
        title: "Canvas API",
        source: "MDN Web Docs",
        year: "2024",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API",
        note: "Used for pixel-level color analysis in Color Finder and waveform rendering in Sound View.",
      },
      {
        authors: "Mozilla Developer Network",
        title: "MediaRecorder API",
        source: "MDN Web Docs",
        year: "2024",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder",
        note: "Used in the chunked fallback mode of Live Captions for restricted networks.",
      },
      {
        authors: "Meta Open Source",
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
      {
        authors: "Tailwind CSS Contributors",
        title: "Tailwind CSS — A utility-first CSS framework",
        source: "tailwindcss.com",
        year: "2024",
        url: "https://tailwindcss.com",
        note: "Utility-first CSS framework used for styling the Beacon interface.",
      },
    ],
  },
  {
    title: "Images",
    entries: [
      {
        authors: "Unsplash Contributors",
        title: "About page hero image — person with tablet",
        source: "Unsplash — Free-use image license",
        year: "2024",
        url: "https://unsplash.com/photos/Wiu3w-99tNg",
        note: "Used under the Unsplash License.",
      },
      {
        authors: "Unsplash Contributors",
        title: "Our Story section — person using a laptop",
        source: "Unsplash — Free-use image license",
        year: "2024",
        url: "https://unsplash.com/photos/ZVprbBmT8QA",
        note: "Used under the Unsplash License.",
      },
      {
        authors: "Unsplash Contributors",
        title: "Why Kentucky section — community group",
        source: "Unsplash — Free-use image license",
        year: "2024",
        url: "https://unsplash.com/photos/rDEOVtE7vOs",
        note: "Used under the Unsplash License.",
      },
      {
        authors: "Unsplash Contributors",
        title: "Our Commitment section — student with laptop",
        source: "Unsplash — Free-use image license",
        year: "2024",
        url: "https://unsplash.com/photos/gMsnXqILjp4",
        note: "Used under the Unsplash License.",
      },
      {
        authors: "Unsplash",
        title: "Unsplash License",
        source: "unsplash.com/license",
        year: "2024",
        url: "https://unsplash.com/license",
        note: "Full terms of the Unsplash free-use image license.",
      },
    ],
  },
];

export default function References() {
  return (
    <div className="animate-rise">
      <div className="mb-7">
        <h1 className="font-display text-[26px] font-extrabold leading-[1.2] mb-1.5 tracking-[-0.3px]">
          References &{" "}
          <span className="text-vis italic">Citations</span>
        </h1>
        <p className="text-dim text-sm leading-[1.65] max-w-[520px]">
          All statistics, research, and third-party content used in Beacon are cited below.
          Sources are organized by category. Citations follow APA 7th edition style.
        </p>
      </div>

      {sections.map(({ title, entries }) => (
        <div key={title} className="bg-card border border-line rounded-main mb-3.5 overflow-hidden">
          <div className="px-[22px] py-[13px] border-b border-line bg-card2">
            <span className="text-[11px] font-bold tracking-[1.6px] uppercase text-vis">{title}</span>
          </div>

          {entries.map((entry, i) => (
            <div key={i} className={`px-[22px] py-4 ${i < entries.length - 1 ? "border-b border-line" : ""}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-tx leading-[1.4] mb-1">{entry.title}</p>
                  <p className="text-[13px] text-dim leading-[1.5] mb-0.5">{entry.authors}</p>
                  <p className="text-xs text-mute leading-[1.5]">
                    {entry.source}{entry.year ? ` · ${entry.year}` : ""}
                  </p>
                  {entry.note && (
                    <p className="text-xs text-dim leading-[1.5] mt-1.5 italic">{entry.note}</p>
                  )}
                </div>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open source: ${entry.title}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-[8px] text-xs font-semibold text-vis bg-vis-s border border-vis/25 no-underline whitespace-nowrap flex-shrink-0 hover:opacity-75 transition-opacity"
                >
                  View Source
                </a>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="bg-card border border-line rounded-main px-[22px] py-[18px]">
        <p className="text-[11px] font-bold tracking-[1.4px] uppercase text-mute mb-2.5">Note on Sources</p>
        <p className="text-[13px] text-dim leading-[1.7]">
          All URLs were verified and accessed in 2025. Statistics from government sources (CDC, NIDCD, WHO)
          reflect the most recent data available at time of project submission. All images are used under the{" "}
          <a
            href="https://unsplash.com/license"
            target="_blank"
            rel="noreferrer"
            className="text-vis underline"
          >
            Unsplash License
          </a>
          , which permits free use without attribution requirements, though we include attribution as best practice.
        </p>
      </div>
    </div>
  );
}
