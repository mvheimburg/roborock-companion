import type { Hass } from "./types";
const en = {
  start: "Start cleaning",
  pause: "Pause",
  stop: "Stop",
  home: "Return to dock",
  locate: "Find robot",
  configure: "Configure",
  unavailable: "Robot unavailable",
  loading: "Loading…",
  failed: "The request failed. Check the connection and try again.",
  pending: "Waiting for Home Assistant…",
  confirmed: "Changes confirmed",
  unconfirmed:
    "Request sent; the robot has not confirmed the change. Refresh before trying again.",
  settings: "Robot and dock",
  rooms: "Rooms",
  maps: "Maps and rooms",
  history: "Cleaning history",
  schedules: "Schedules",
  save: "Save changes",
  cancel: "Cancel",
  refresh: "Refresh",
  retry: "Try again",
  close: "Close",
  selectRobot: "Choose robot",
  noRobots:
    "Add Roborock Companion under Settings → Devices & services to configure a robot here.",
  noMap: "No map is available yet",
  companion: "Advanced settings need Roborock Companion",
  noSettings:
    "No configurable entities are available. Enable the relevant entities in the integration.",
  noRooms: "Room information is not available",
  allRooms: "Whole home",
  selected: "Selected rooms",
  cleanRooms: "Clean selected rooms",
  suction: "Suction power",
  title: "Title",
  appearance: "Appearance",
  default: "Default",
  bubble: "Bubble",
  showMap: "Show map",
  showMaintenance: "Show maintenance",
  entities: "Additional entities",
  maintenance: "Readings and maintenance",
  docked: "Docked",
  cleaning: "Cleaning",
  returning: "Returning to dock",
  paused: "Paused",
  idle: "Ready",
  error: "Needs attention",
  unknown: "Unknown",
  map: "Map",
  chooseMap: "Choose map",
  view: "View",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetView: "Reset view",
  panLeft: "Move map left",
  panRight: "Move map right",
  panUp: "Move map up",
  panDown: "Move map down",
  goTo: "Go here",
  zone: "Clean zone",
  wall: "Virtual wall",
  noGo: "No-go zone",
  split: "Split room",
  merge: "Merge rooms",
  material: "Floor material",
  wood: "Wood",
  tile: "Tile",
  direction: "Direction in degrees",
  drawHelp:
    "Choose two points on the map. Use the coordinate fields for precise or keyboard input.",
  x1: "First X",
  y1: "First Y",
  x2: "Second X",
  y2: "Second Y",
  add: "Add to draft",
  remove: "Remove",
  undo: "Undo last change",
  dirty: "Unsaved changes",
  discard: "Discard changes",
  discardHelp: "Your unsaved changes will be lost.",
  confirm: "Confirm",
  confirmMap:
    "Apply this map change? Existing restrictions not removed in the draft will be preserved.",
  blocked:
    "This operation is unavailable until the map and model support can be verified.",
  preservation:
    "Some map details cannot be preserved safely. Map replacement is disabled.",
  modelUnverified: "This command has not been verified for the model.",
  conflict:
    "The robot settings or map changed. Reload the current data; your draft is retained.",
  readback: "The change is not yet confirmed by the robot.",
  wrongMap:
    "Choose the currently active floor and wait until the robot is idle.",
  local: "Direct local connection available",
  serverLocal: "Configured custom server",
  serverCloud: "Roborock cloud",
  transportHelp:
    "HA owns the connection. A local connection does not prove the route of every command.",
  nativeSchedules:
    "Native robot schedules are not guaranteed by the local server. Use Home Assistant automations for reliable local scheduling.",
  openAutomations: "Open Home Assistant automations",
  emptyHistory: "No cleaning sessions were returned",
  loadHistory: "Load cleaning history",
  next: "Next",
  previous: "Previous",
  duration: "Duration",
  area: "Area",
  session: "Cleaning session",
  backup: "Back up current map",
  restore: "Restore map backup",
  buildMap: "Start a mapping run",
  confirmPhysical: "This sends a command to the robot. Continue?",
  admin: "Administrator access is required for configuration.",
  settingsHelp:
    "Edit a draft, then Save. Cancel leaves saved settings unchanged.",
  roomHelp:
    "Use the large map to choose rooms and edit supported details. Changing floors or robots discards no edits without confirmation.",
  floor: "Floor",
  invalid: "Check the entered values.",
  partial:
    "Some changes were applied before an error. Review the current settings before retrying.",
  setup: "Open integration settings",
  battery: "Battery",
  moreInfo: "More information",
  mapUpdated: "Map updated",
  readonly: "Read only",
  keyboardMap: "Keyboard alternative: enter coordinates below the map.",
  advanced: "Advanced map tools",
  cleanCount: "Cleaning passes",
  noSelection: "Choose a room first",
  plan: "Cleaning choices",
  toggle: "Toggle",
  rename: "Display name",
  roomName: "Room name",
  saveRoom: "Save room name",
};
type Dictionary = { [K in keyof typeof en]: string };
const nb: Dictionary = {
  start: "Start rengjøring",
  pause: "Pause",
  stop: "Stopp",
  home: "Til ladestasjonen",
  locate: "Finn roboten",
  configure: "Konfigurer",
  unavailable: "Roboten er utilgjengelig",
  loading: "Laster…",
  failed: "Forespørselen mislyktes. Kontroller forbindelsen og prøv igjen.",
  pending: "Venter på Home Assistant…",
  confirmed: "Endringene er bekreftet",
  unconfirmed:
    "Forespørselen er sendt, men roboten har ikke bekreftet endringen. Oppdater før du prøver igjen.",
  settings: "Robot og dokk",
  rooms: "Rom",
  maps: "Kart og rom",
  history: "Rengjøringshistorikk",
  schedules: "Tidsplaner",
  save: "Lagre endringer",
  cancel: "Avbryt",
  refresh: "Oppdater",
  retry: "Prøv igjen",
  close: "Lukk",
  selectRobot: "Velg robot",
  noRobots:
    "Legg til Roborock Companion under Innstillinger → Enheter og tjenester for å konfigurere en robot her.",
  noMap: "Ingen kart er tilgjengelige ennå",
  companion: "Avanserte innstillinger krever Roborock Companion",
  noSettings:
    "Ingen innstillingsentiteter er tilgjengelige. Aktiver relevante entiteter i integrasjonen.",
  noRooms: "Rominformasjon er ikke tilgjengelig",
  allRooms: "Hele boligen",
  selected: "Valgte rom",
  cleanRooms: "Rengjør valgte rom",
  suction: "Sugestyrke",
  title: "Tittel",
  appearance: "Utseende",
  default: "Standard",
  bubble: "Bubble",
  showMap: "Vis kart",
  showMaintenance: "Vis vedlikehold",
  entities: "Ekstra entiteter",
  maintenance: "Målinger og vedlikehold",
  docked: "I ladestasjonen",
  cleaning: "Rengjør",
  returning: "På vei til ladestasjonen",
  paused: "På pause",
  idle: "Klar",
  error: "Trenger tilsyn",
  unknown: "Ukjent",
  map: "Kart",
  chooseMap: "Velg kart",
  view: "Visning",
  zoomIn: "Zoom inn",
  zoomOut: "Zoom ut",
  resetView: "Tilbakestill visning",
  panLeft: "Flytt kart mot venstre",
  panRight: "Flytt kart mot høyre",
  panUp: "Flytt kart opp",
  panDown: "Flytt kart ned",
  goTo: "Kjør hit",
  zone: "Rengjør sone",
  wall: "Virtuell vegg",
  noGo: "Forbudssone",
  split: "Del rom",
  merge: "Slå sammen rom",
  material: "Gulvmateriale",
  wood: "Tre",
  tile: "Fliser",
  direction: "Retning i grader",
  drawHelp:
    "Velg to punkter i kartet. Bruk koordinatfeltene for presis plassering eller tastatur.",
  x1: "Første X",
  y1: "Første Y",
  x2: "Andre X",
  y2: "Andre Y",
  add: "Legg til i utkast",
  remove: "Fjern",
  undo: "Angre siste endring",
  dirty: "Ulagrede endringer",
  discard: "Forkast endringer",
  discardHelp: "De ulagrede endringene går tapt.",
  confirm: "Bekreft",
  confirmMap:
    "Lagre denne kartendringen? Eksisterende avgrensninger som ikke er fjernet i utkastet, bevares.",
  blocked:
    "Handlingen er utilgjengelig til kartet og modellstøtten kan verifiseres.",
  preservation:
    "Enkelte kartdetaljer kan ikke bevares sikkert. Overskriving av kart er deaktivert.",
  modelUnverified: "Kommandoen er ikke verifisert for modellen.",
  conflict:
    "Robotinnstillingene eller kartet er endret. Last inn gjeldende data; utkastet beholdes.",
  readback: "Endringen er ikke bekreftet av roboten ennå.",
  wrongMap: "Velg den aktive etasjen og vent til roboten er ledig.",
  local: "Direkte lokal forbindelse tilgjengelig",
  serverLocal: "Valgt egendefinert server",
  serverCloud: "Roborock-skyen",
  transportHelp:
    "HA eier forbindelsen. En lokal forbindelse beviser ikke veien hver kommando tar.",
  nativeSchedules:
    "Lokalserveren garanterer ikke støtte for robotens egne tidsplaner. Bruk HA-automasjoner for pålitelig lokal tidsstyring.",
  openAutomations: "Åpne HA-automasjoner",
  emptyHistory: "Ingen rengjøringer ble returnert",
  loadHistory: "Hent rengjøringshistorikk",
  next: "Neste",
  previous: "Forrige",
  duration: "Varighet",
  area: "Areal",
  session: "Rengjøring",
  backup: "Sikkerhetskopier gjeldende kart",
  restore: "Gjenopprett kartkopi",
  buildMap: "Start kartlegging",
  confirmPhysical: "Dette sender en kommando til roboten. Vil du fortsette?",
  admin: "Administratorrettigheter kreves for konfigurering.",
  settingsHelp:
    "Rediger et utkast og velg Lagre. Avbryt lar lagrede innstillinger være urørt.",
  roomHelp:
    "Bruk det store kartet til å velge rom og redigere støttede detaljer. Ulagrede endringer forkastes ikke uten bekreftelse.",
  floor: "Etasje",
  invalid: "Kontroller verdiene du har fylt inn.",
  partial:
    "Noen endringer ble utført før en feil. Kontroller gjeldende innstillinger før du prøver igjen.",
  setup: "Åpne integrasjonsinnstillinger",
  battery: "Batteri",
  moreInfo: "Mer informasjon",
  mapUpdated: "Kartet er oppdatert",
  readonly: "Kun visning",
  keyboardMap: "Tastaturalternativ: fyll inn koordinatene under kartet.",
  advanced: "Avanserte kartverktøy",
  cleanCount: "Antall rengjøringer",
  noSelection: "Velg et rom først",
  plan: "Rengjøringsvalg",
  toggle: "Bytt",
  rename: "Visningsnavn",
  roomName: "Romnavn",
  saveRoom: "Lagre romnavn",
};
export type TextKey = keyof Dictionary;
export function language(hass?: Hass) {
  const raw = (hass?.language || hass?.locale?.language || "en")
    .replaceAll("_", "-")
    .toLowerCase();
  return ["nb", "no", "nn"].includes(raw.split("-")[0]) ? "nb" : "en";
}
export function strings(hass?: Hass): Dictionary {
  return language(hass) === "nb" ? nb : en;
}
export function locale(hass?: Hass) {
  let value = (hass?.locale?.language || hass?.language || "en").replaceAll(
    "_",
    "-",
  );
  if (/^(no|nn)(-|$)/i.test(value)) value = value.replace(/^(no|nn)/i, "nb");
  try {
    return Intl.getCanonicalLocales(value)[0] || "en";
  } catch {
    return language(hass) === "nb" ? "nb-NO" : "en";
  }
}
export function number(hass: Hass | undefined, value: number, digits = 1) {
  if (!Number.isFinite(value)) return strings(hass).unknown;
  const preference = hass?.locale?.number_format;
  const target =
    preference === "comma_decimal"
      ? "de"
      : preference === "decimal_period"
        ? "en-US"
        : preference === "space_comma"
          ? "fr"
          : preference === "system"
            ? undefined
            : locale(hass);
  return new Intl.NumberFormat(target, {
    useGrouping: preference !== "none",
    maximumFractionDigits: digits,
  }).format(value);
}
export function errorText(hass: Hass | undefined, code?: string) {
  const t = strings(hass);
  return (
    (
      {
        conflict: t.conflict,
        readback_pending: t.readback,
        preservation_unverified: t.preservation,
        model_unverified: t.modelUnverified,
        wrong_map_or_busy: t.wrongMap,
        unauthorized: t.admin,
        invalid_setting: t.invalid,
        invalid_coordinates: t.invalid,
        confirmation_required: t.confirmPhysical,
      } as Record<string, string>
    )[code || ""] || t.failed
  );
}

export function optionLabel(hass: Hass | undefined, value: string) {
  const key = value.toLowerCase().replaceAll("_", " ");
  const en: Record<string, string> = {
    silent: "Quiet",
    balanced: "Balanced",
    turbo: "Turbo",
    max: "Max",
    off: "Off",
    standard: "Standard",
    deep: "Deep",
    custom: "Custom",
    smart: "Smart",
  };
  const nb: Record<string, string> = {
    silent: "Stille",
    balanced: "Balansert",
    turbo: "Turbo",
    max: "Maks",
    off: "Av",
    standard: "Standard",
    deep: "Grundig",
    custom: "Tilpasset",
    smart: "Smart",
  };
  return (language(hass) === "nb" ? nb : en)[key] || value;
}
