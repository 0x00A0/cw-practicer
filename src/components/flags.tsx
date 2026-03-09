/** Inline SVG flag icons – works on all platforms including Windows */

export function FlagGB({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 30" width="20" height="10">
      <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  );
}

export function FlagCN({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 20" width="20" height="13">
      <rect width="30" height="20" fill="#DE2910"/>
      <g fill="#FFDE00">
        <polygon points="5,2 6.2,5.7 2.2,3.7 7.8,3.7 3.8,5.7"/>
        <polygon points="10,1 10.4,2.2 9.2,1.5 10.8,1.5 9.6,2.2"/>
        <polygon points="12,3 12.4,4.2 11.2,3.5 12.8,3.5 11.6,4.2"/>
        <polygon points="12,6 12.4,7.2 11.2,6.5 12.8,6.5 11.6,7.2"/>
        <polygon points="10,8 10.4,9.2 9.2,8.5 10.8,8.5 9.6,9.2"/>
      </g>
    </svg>
  );
}

export function FlagSE({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 10" width="20" height="13">
      <rect width="16" height="10" fill="#006AA7"/>
      <rect x="5" width="2" height="10" fill="#FECC00"/>
      <rect y="4" width="16" height="2" fill="#FECC00"/>
    </svg>
  );
}

