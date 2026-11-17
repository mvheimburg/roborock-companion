import { css } from "lit";
export const styles = css`
  :host {
    display: block;
    color: var(--primary-text-color, #212121);
    font-family: var(--ha-font-family-body, Roboto, system-ui, sans-serif);
    --rr-primary: var(--primary-color, #03a9f4);
    --rr-muted: var(--secondary-text-color, #727272);
    --rr-border: var(--divider-color, #e0e0e0);
    --rr-surface: var(--card-background-color, #fff);
    --rr-error: var(--error-color, #db4437);
  }
  * {
    box-sizing: border-box;
    scrollbar-width: thin;
    scrollbar-color: var(--rr-muted) transparent;
  }
  *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  *::-webkit-scrollbar-thumb {
    background: var(--rr-muted);
    border-radius: 4px;
  }
  ha-card {
    display: block;
  }
  ha-card,
  .surface {
    background: var(--rr-surface);
    border: 1px solid var(--rr-border);
    border-radius: var(--ha-card-border-radius, 12px);
    padding: 20px;
    overflow: visible;
  }
  :host([appearance="bubble"]) ha-card {
    border-radius: 24px;
    background: var(--bubble-card-background, var(--rr-surface));
    border: 0;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }
  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
  h1 {
    font-size: 24px;
    font-weight: 500;
  }
  h2 {
    font-size: 20px;
    font-weight: 500;
  }
  h3 {
    font-size: 16px;
    font-weight: 500;
  }
  .muted,
  small {
    color: var(--rr-muted);
  }
  .hint {
    font-size: 14px;
    line-height: 1.5;
    color: var(--rr-muted);
    margin: 8px 0;
  }
  button,
  a.button {
    font: inherit;
    color: inherit;
    min-height: 44px;
    padding: 10px 16px;
    border: 1px solid var(--rr-border);
    border-radius: 22px;
    background: transparent;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  button:hover:not(:disabled),
  a.button:hover {
    background: var(--secondary-background-color, #f5f5f5);
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--rr-primary);
    outline-offset: 3px;
  }
  .primary,
  button[aria-pressed="true"] {
    background: var(--rr-primary);
    color: var(--text-primary-color, #fff);
    border-color: var(--rr-primary);
  }
  .cog {
    width: 44px;
    height: 44px;
    padding: 10px;
    border-radius: 50%;
  }
  .actions,
  .chips,
  .toolbar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 12px 0;
  }
  .actions .primary {
    flex: 1;
  }
  .feedback {
    min-height: 24px;
    font-size: 14px;
    margin-top: 8px;
  }
  [role="alert"] {
    color: var(--rr-error);
  }
  label {
    display: grid;
    gap: 6px;
    font-size: 14px;
    margin: 12px 0;
  }
  input,
  select {
    font: inherit;
    color: inherit;
    background: var(--rr-surface);
    border: 1px solid var(--rr-border);
    border-radius: 8px;
    min-height: 44px;
    padding: 8px 12px;
    min-width: 0;
    width: 100%;
  }
  input[type="checkbox"] {
    width: 22px;
    min-height: 22px;
    accent-color: var(--rr-primary);
  }
  .fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 16px;
  }
  .measurements {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .reading {
    display: grid;
    gap: 3px;
    text-align: left;
  }
  .reading strong {
    font-variant-numeric: tabular-nums;
  }
  .section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--rr-border);
  }
  a {
    color: var(--rr-primary);
  }
  dialog {
    background: var(--rr-surface);
    color: inherit;
    border: 1px solid var(--rr-border);
    border-radius: 16px;
    max-width: min(560px, calc(100vw - 32px));
    max-height: calc(100dvh - 40px);
    overflow: auto;
    padding: 24px;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.45);
  }
  dialog h3 {
    margin-bottom: 12px;
  }
  .danger {
    color: var(--rr-error);
  }
  .workspace {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 24px;
    align-items: start;
  }
  .sidebar {
    min-width: 0;
  }
  .panel {
    padding: 24px;
    max-width: 1600px;
    margin: auto;
  }
  .tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 20px 0;
  }
  .status {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .map-frame {
    background: var(--secondary-background-color, #f5f5f5);
    border-radius: 12px;
    min-height: 280px;
    overflow: hidden;
  }
  .room-list {
    display: grid;
    gap: 8px;
  }
  .summary {
    display: grid;
    gap: 8px;
  }
  .history-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--rr-border);
  }
  @media (max-width: 900px) {
    .workspace {
      grid-template-columns: 1fr;
    }
    .panel {
      padding: 16px;
    }
  }
  @media (max-width: 400px) {
    ha-card {
      display: block;
    }
    ha-card,
    .surface {
      padding: 16px;
    }
    .fields {
      grid-template-columns: 1fr;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      scroll-behavior: auto;
    }
  }
`;
