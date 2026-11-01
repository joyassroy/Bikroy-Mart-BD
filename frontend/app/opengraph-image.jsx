import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bikroymart BD - Best Online Grocery Shopping in Bangladesh";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
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
        {/* Glow circles */}
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
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0, 175, 204, 0.3) 0%, rgba(0, 175, 204, 0) 70%)",
          }}
        />

        {/* Top Header */}
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
                boxShadow: "0 8px 24px rgba(236, 0, 140, 0.4)",
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
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "999px",
              background: "rgba(236, 0, 140, 0.18)",
              border: "1.5px solid rgba(236, 0, 140, 0.6)",
              fontSize: "17px",
              fontWeight: "700",
              color: "#FFFFFF",
            }}
          >
            <span>★</span>
            <span>#1 Online Grocery Platform in BD</span>
          </div>
        </div>

        {/* Middle Content */}
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
              fontSize: "52px",
              fontWeight: "900",
              lineHeight: 1.15,
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            Next-Gen E-Commerce &amp; Live Tracking
          </h1>
          <p
            style={{
              fontSize: "24px",
              lineHeight: 1.4,
              color: "#C5D7F0",
              margin: 0,
            }}
          >
            Fresh vegetables, fruits, fish, meat &amp; daily essentials delivered to your doorstep in 60 minutes.
          </p>
        </div>

        {/* Badges Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 18px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1.5px solid rgba(236, 0, 140, 0.8)",
              fontSize: "17px",
              fontWeight: "700",
            }}
          >
            ⚡ 60-Minute Fast Delivery
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 18px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1.5px solid rgba(0, 175, 204, 0.8)",
              fontSize: "17px",
              fontWeight: "700",
            }}
          >
            🛡️ 100% Fresh &amp; Authentic
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 18px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1.5px solid rgba(59, 130, 246, 0.8)",
              fontSize: "17px",
              fontWeight: "700",
            }}
          >
            📍 Live GPS Rider Tracking
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 18px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1.5px solid rgba(34, 197, 94, 0.8)",
              fontSize: "17px",
              fontWeight: "700",
            }}
          >
            💵 Cash on Delivery
          </div>
        </div>

        {/* Bottom Footer */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00AFCC", fontWeight: "700" }}>
            <span>🌐</span>
            <span>https://bmaart.com</span>
          </div>
          <div>Trusted Online Grocery Shopping Across Bangladesh</div>
          <div style={{ color: "#FFFFFF", fontWeight: "600" }}>Hotline: 01810-117100</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

