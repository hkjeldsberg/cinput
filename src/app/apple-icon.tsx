import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same mark as icon.svg, full-bleed: iOS rounds the corners itself.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#D6246E" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path
            d="M21.2 10.8A8.5 8.5 0 1 0 21.2 23.2"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4.6"
            strokeLinecap="round"
          />
          <circle cx="23.6" cy="17" r="3.1" fill="#FFC83D" />
        </svg>
      </div>
    ),
    size,
  );
}
