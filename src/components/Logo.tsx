interface LogoProps {
  variant?: 'full' | 'icon';
  size?: number;
  className?: string;
}

/**
 * Vector recreation of the NR Mothercare Confinement logo mark
 * (mother-and-baby silhouette + NR wordmark), since no source
 * image file was available to embed directly.
 */
export function Logo({ variant = 'full', size = 56, className = '' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={className}
        role="img"
        aria-label="NR Mothercare Confinement"
      >
        <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#f3d3e0" strokeWidth="1.5" />
        <path
          d="M62 22c9 4 15 13 15 24 0 12-8 21-18 25l3 8-10-5c-12-1-21-11-21-24 0-14 11-25 25-25 2 0 4 .3 6 1z"
          fill="#4f8a6d"
        />
        <circle cx="60" cy="66" r="9" fill="#ffffff" />
        <path
          d="M52 70c2-4 6-6 9-6 4 0 8 3 9 7-3 3-6 5-9 5s-7-2-9-6z"
          fill="#4f8a6d"
        />
        <text
          x="50"
          y="52"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="700"
          fontSize="26"
          fill="#d94f8c"
        >
          NR
        </text>
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="NR Mothercare Confinement"
    >
      <circle cx="100" cy="100" r="94" fill="#ffffff" stroke="#f3d3e0" strokeWidth="2" />
      <defs>
        <path id="logo-arc" d="M 30 148 A 78 78 0 0 0 170 148" />
      </defs>
      <path
        d="M126 46c16 7 27 23 27 42 0 21-14 38-32 44l4 13-17-8c-21-1-37-19-37-42 0-24 19-43 43-43 4 0 8 .6 12 1.8z"
        fill="#4f8a6d"
      />
      <circle cx="118" cy="120" r="15" fill="#ffffff" />
      <path
        d="M104 128c3-7 10-11 16-11 7 0 14 5 16 12-5 5-11 8-16 8s-12-3-16-9z"
        fill="#4f8a6d"
      />
      <text
        x="66"
        y="88"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="40"
        fill="#d94f8c"
      >
        NR
      </text>
      <text
        x="66"
        y="104"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fontSize="13"
        fill="#d94f8c"
      >
        Mothercare
      </text>
      <text
        x="66"
        y="118"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize="8.5"
        letterSpacing="1.5"
        fill="#4f8a6d"
      >
        CONFINEMENT
      </text>
      <text fontFamily="Georgia, serif" fontStyle="italic" fontSize="9" fill="#d94f8c">
        <textPath href="#logo-arc" startOffset="50%" textAnchor="middle">
          Sentuhan Tradisional Untuk Para Ibu
        </textPath>
      </text>
    </svg>
  );
}
