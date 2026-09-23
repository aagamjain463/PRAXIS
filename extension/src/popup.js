const byId = (id) => document.getElementById(id);
const captureForm = byId("capture-form");
const settingsForm = byId("settings-form");
let page = { title: "", url: "" };

async function load() {
  const [{ token, praxisUrl }, { pendingCapture }] = await Promise.all([
    chrome.storage.local.get(["token", "praxisUrl"]),
    chrome.storage.session.get("pendingCapture")
  ]);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  page = pendingCapture || { title: tab?.title || "", url: tab?.url || "" };
  await chrome.storage.session.remove("pendingCapture");
  byId("content").value = page.content || "";
  byId("page-title").textContent = page.title || "Current page";
  byId("page-url").textContent = page.url || "";
  const youtube = /(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(new URL(page.url || "https://invalid.local").hostname);
  byId("timestamp-label").hidden = !youtube;
  if (!token || !praxisUrl) showSettings();
  else { byId("praxis-url").value = praxisUrl; byId("token").value = token; }
}

function showSettings() { captureForm.hidden = true; settingsForm.hidden = false; }
function showCapture() { settingsForm.hidden = true; captureForm.hidden = false; }
byId("settings").addEventListener("click", showSettings);
byId("cancel-settings").addEventListener("click", showCapture);
settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const praxisUrl = byId("praxis-url").value.replace(/\/$/, "");
  const token = byId("token").value.trim();
  if (!token.startsWith("px_")) return;
  await chrome.storage.local.set({ token, praxisUrl });
  showCapture();
});
captureForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = byId("status");
  const save = byId("save");
  const { token, praxisUrl } = await chrome.storage.local.get(["token", "praxisUrl"]);
  if (!token || !praxisUrl) return showSettings();
  save.disabled = true; status.className = ""; status.textContent = "Saving…";
  try {
    const response = await fetch(`${praxisUrl}/api/extension/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: byId("content").value, note: byId("note").value, url: page.url, title: page.title, timestamp: byId("timestamp").value ? Number(byId("timestamp").value) : undefined })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Capture failed");
    status.textContent = "Saved to your Praxis Inbox.";
    byId("note").value = "";
  } catch (error) { status.className = "error"; status.textContent = error.message || "Could not reach Praxis."; }
  finally { save.disabled = false; }
});

load();
