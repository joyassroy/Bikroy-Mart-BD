import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bikroymart BD - Online Grocery & Daily Essentials";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #00163E 0%, #00215B 50%, #00377A 100%)",
          padding: "60px 70px",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#FFFFFF",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236, 0, 140, 0.35) 0%, rgba(236, 0, 140, 0) 70%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #EC008C 0%, #00AFCC 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "28px",
                color: "#FFFFFF",
              }}
            >
              B
            </div>
            <div style={{ display: "flex", alignItems: "baseline", fontSize: "40px", fontWeight: "900" }}>
              <span>Bikroy</span>
              <span style={{ color: "#EC008C" }}>-Mart</span>
              <span style={{ color: "#00AFCC" }}>-BD</span>
            </div>
          </div>
          <div
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              background: "rgba(236, 0, 140, 0.2)",
              border: "1.5px solid rgba(236, 0, 140, 0.6)",
              fontSize: "17px",
              fontWeight: "700",
            }}
          >
            ⚡ 60-Min Express Delivery
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            zIndex: 10,
            maxWidth: "920px",
          }}
        >
          <h1
            style={{
              fontSize: "50px",
              fontWeight: "900",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Best Online Grocery Shopping in Bangladesh
          </h1>
          <p
            style={{
              fontSize: "24px",
              lineHeight: 1.4,
              color: "#C5D7F0",
              margin: 0,
            }}
          >
            Order fresh groceries, vegetables, meat &amp; essentials with real-time GPS tracking.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
            paddingTop: "20px",
            fontSize: "18px",
            color: "#AAB9D2",
            zIndex: 10,
          }}
        >
          <div style={{ color: "#00AFCC", fontWeight: "700" }}>🌐 bmaart.com</div>
          <div>@bikroymartbd</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

