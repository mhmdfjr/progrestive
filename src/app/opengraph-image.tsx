import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFF6E5",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            border: "8px solid #000",
            boxShadow: "16px 16px 0 #000",
            background: "#FFD400",
            padding: "56px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 110,
              fontWeight: 900,
              letterSpacing: -2,
              color: "#000",
            }}
          >
            PROGRESTIVE.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 44,
              fontWeight: 900,
              color: "#000",
            }}
          >
            <span style={{ background: "#FF0052", color: "#fff", padding: "4px 18px", border: "5px solid #000" }}>
              PUSH
            </span>
            <span style={{ margin: "4px 14px" }}>×</span>
            <span style={{ background: "#00C68D", color: "#000", padding: "4px 18px", border: "5px solid #000" }}>
              PAUSE
            </span>
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 30, fontWeight: 700, color: "#000" }}>
            Balance ur day. No guilt, just progress.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
