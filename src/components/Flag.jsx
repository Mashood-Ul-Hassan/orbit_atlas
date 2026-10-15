import { useState } from "react";

// Shows a flag image, or a neutral tile with the country's initials when the
// image is missing or fails to load (some territories have no flag file).
export default function Flag({ src, alt, name, className }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div className={`${className} flag-fallback`} role="img" aria-label={`No flag image for ${name}`}>
        <span aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt || `Flag of ${name}`}
      loading="lazy"
      onError={() => setFailedSrc(src)}
    />
  );
}
