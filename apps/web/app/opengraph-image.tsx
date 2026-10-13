import { ImageResponse } from "next/og";

export const alt = "FunBerry Kids — Berry the superhero guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff8ef",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 280,
              height: 320,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 220,
                height: 250,
                borderRadius: "110px 110px 90px 90px",
                background: "#ff2d6a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "16px solid #6d28d9",
              }}
            >
              <div style={{ width: 120, height: 36, borderRadius: 18, background: "#1e293b", marginTop: 20 }} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
          <div style={{ fontSize: 76, fontWeight: 800, color: "#1c3358" }}>FunBerry Kids</div>
          <div style={{ fontSize: 34, color: "#4b6284", marginTop: 16 }}>Learn through play — fun games for curious little minds!</div>
          <div style={{ fontSize: 28, color: "#cc0445", marginTop: 28 }}>Berry is the guide. Kids keep their own avatars.</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
