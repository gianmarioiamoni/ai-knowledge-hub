// app/icon.tsx
import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Icon generation function for Next.js 15
export default function Icon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "#5c7cfa",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "20%",
        }}
      >
        {/* Book base */}
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Book background */}
          <path
            d="M10 8C10 6.89543 10.8954 6 12 6H36C37.1046 6 38 6.89543 38 8V40C38 41.1046 37.1046 42 36 42H12C10.8954 42 10 41.1046 10 40V8Z"
            fill="white"
            opacity="0.3"
          />
          
          {/* AI Neural Network Nodes */}
          <circle cx="24" cy="14" r="2.5" fill="white" />
          <circle cx="18" cy="24" r="2" fill="white" />
          <circle cx="30" cy="24" r="2" fill="white" />
          <circle cx="24" cy="34" r="2.5" fill="white" />
          
          {/* Connection lines */}
          <path
            d="M24 16.5 L18 22 M24 16.5 L30 22 M18 26 L24 31.5 M30 26 L24 31.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          
          {/* Book outline */}
          <rect
            x="10"
            y="6"
            width="28"
            height="36"
            rx="2"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}

