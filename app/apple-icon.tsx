// app/apple-icon.tsx
import { ImageResponse } from "next/og";

// Apple touch icon size (recommended 180x180)
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Apple icon generation function for Next.js 15
export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: "#5c7cfa",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "22.5%", // Apple's recommended corner radius
        }}
      >
        {/* Logo icon - scaled for larger Apple icon - matches Logo.tsx exactly */}
        <svg width="140" height="140" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Book background */}
          <path
            d="M10 8C10 6.89543 10.8954 6 12 6H36C37.1046 6 38 6.89543 38 8V40C38 41.1046 37.1046 42 36 42H12C10.8954 42 10 41.1046 10 40V8Z"
            fill="white"
            opacity="0.2"
          />
          <path
            d="M14 10H34V38H14V10Z"
            fill="white"
            opacity="0.1"
          />
          
          {/* AI Neural Network Nodes */}
          <circle cx="24" cy="14" r="2.8" fill="white" />
          <circle cx="18" cy="24" r="2.3" fill="white" />
          <circle cx="30" cy="24" r="2.3" fill="white" />
          <circle cx="24" cy="34" r="2.8" fill="white" />
          
          {/* Connection lines */}
          <path
            d="M24 16.8 L18 21.7 M24 16.8 L30 21.7 M18 26.3 L24 31.2 M30 26.3 L24 31.2"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
          
          {/* Book outline */}
          <rect
            x="10"
            y="6"
            width="28"
            height="36"
            rx="2"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
          />
          
          {/* Book spine lines */}
          <line x1="14" y1="10" x2="14" y2="38" stroke="white" strokeWidth="2" opacity="0.3" />
          <line x1="34" y1="10" x2="34" y2="38" stroke="white" strokeWidth="2" opacity="0.3" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}

