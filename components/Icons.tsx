import React from 'react';

type IconProps = { className?: string };

const Icon: React.FC<IconProps & { children: React.ReactNode; defaultSize?: string }> = ({
  className,
  defaultSize = 'w-5 h-5',
  children,
}) => (
  <svg
    className={className ?? defaultSize}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

export const LogoIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </Icon>
);

export const SearchIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const XIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path d="M6 18 18 6M6 6l12 12" />
  </Icon>
);

export const MoonIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className} defaultSize="w-6 h-6">
    <path d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z" />
  </Icon>
);

export const SunIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className} defaultSize="w-6 h-6">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
  </Icon>
);

export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
  </Icon>
);

export const ShareIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.59 13.51 6.83 3.98m-.01-10.98-6.82 3.98" />
  </Icon>
);

export const CopyIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
);

export const CheckIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path d="M19 12H5m7 7-7-7 7-7" />
  </Icon>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </Icon>
);

export const AlertIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4m0 4h.01" />
  </Icon>
);

export const HistoryIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5M12 7v5l3 2" />
  </Icon>
);
