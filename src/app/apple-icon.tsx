import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// A papel picado flag on its string, full-bleed: iOS rounds the corners itself.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FBEFF5" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <rect x="0" y="5" width="32" height="1.6" fill="#6A1B9A" />
          <path d="M6 6.6H26V28L22.7 25.3L19.3 28L16 25.3L12.7 28L9.3 25.3L6 28Z" fill="#C2185B" />
          <path
            d="M19 12.4A5.4 5.4 0 1 0 19 20.4"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.1"
            strokeLinecap="round"
          />
          <circle cx="20.5" cy="16.4" r="2" fill="#FFB300" />
        </svg>
      </div>
    ),
    size,
  );
}
