import Scene from "@/components/Scene";

export default function Home() {
  return (
    <>
      <Scene />
      <main
        className="content-layer"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "var(--space-xl)",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            fontSize: "var(--step-5)",
            fontWeight: 700,
            color: "var(--color-text)",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Hemsedal
        </h1>
        <p
          style={{
            fontSize: "var(--step-1)",
            color: "var(--color-text-muted)",
            margin: 0,
            marginTop: "var(--space-xs)",
          }}
        >
          Phase 1 — Landscape MVP
        </p>
      </main>
    </>
  );
}
