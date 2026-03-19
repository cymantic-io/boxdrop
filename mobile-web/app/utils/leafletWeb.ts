const LEAFLET_STYLESHEET_ID = "leaflet-web-styles";
const LEAFLET_STYLESHEET_URL =
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

export function ensureLeafletWebStyles(): void {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(LEAFLET_STYLESHEET_ID)) {
    return;
  }

  const link = document.createElement("link");
  link.id = LEAFLET_STYLESHEET_ID;
  link.rel = "stylesheet";
  link.href = LEAFLET_STYLESHEET_URL;
  document.head.appendChild(link);
}
