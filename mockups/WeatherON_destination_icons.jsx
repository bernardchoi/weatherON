export function DestinationIcon({ type, size = 16, color = "currentColor" }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (type) {
    case "company":
      return (
        <svg {...common}>
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M3 21h18" />
          <path d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1" />
        </svg>
      );
    case "school":
      return (
        <svg {...common}>
          <path d="M3 10l9-5 9 5-9 5-9-5z" />
          <path d="M6 12v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4" />
          <path d="M21 10v5" />
        </svg>
      );
    case "airport":
      return (
        <svg {...common}>
          <path d="M2 16l20-8-8 12-3-7-9 3z" />
          <path d="M11 13l4 4" />
        </svg>
      );
    case "hotel":
      return (
        <svg {...common}>
          <path d="M4 21V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v15" />
          <path d="M16 10h2a2 2 0 0 1 2 2v9" />
          <path d="M8 8h1M12 8h1M8 12h1M12 12h1M8 16h1M12 16h1M3 21h18" />
        </svg>
      );
    case "baseball":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 5.8c1.6 2 1.6 10.4 0 12.4" />
          <path d="M16 5.8c-1.6 2-1.6 10.4 0 12.4" />
          <path d="M7.8 9.2l1.8-.7M7.8 12l2-.4M7.8 14.8l1.8.7M16.2 9.2l-1.8-.7M16.2 12l-2-.4M16.2 14.8l-1.8.7" />
        </svg>
      );
    case "mountain":
      return (
        <svg {...common}>
          <path d="M3 20h18" />
          <path d="M5 18l5.5-10 3 5 2-3 4.5 8" />
          <path d="M10.5 8l1.4 2.3 1.1-1.4" />
        </svg>
      );
    case "beach":
      return (
        <svg {...common}>
          <path d="M3 20c2.5-1.4 4.5-1.4 7 0s4.5 1.4 7 0 3.5-1.2 4 0" />
          <path d="M8 13a7 7 0 0 1 12 0" />
          <path d="M14 13V8" />
          <path d="M14 13l-2.5 5" />
        </svg>
      );
    case "season":
      return (
        <svg {...common}>
          <path d="M12 21c0-5.5 4.8-8.5 8-9-3.3-.7-6.3.2-8 2.7C10.3 12.2 7.3 11.3 4 12c3.2.5 8 3.5 8 9z" />
          <path d="M12 14.7V5" />
          <path d="M8 6c2 0 4 1.5 4 4-2 0-4-1.5-4-4z" />
          <path d="M16 6c-2 0-4 1.5-4 4 2 0 4-1.5 4-4z" />
        </svg>
      );
    case "culture":
      return (
        <svg {...common}>
          <path d="M5 6h14v4a2 2 0 0 0 0 4v4H5v-4a2 2 0 0 0 0-4V6z" />
          <path d="M10 8v8M14 8v8" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.4" />
        </svg>
      );
  }
}
