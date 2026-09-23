"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Command, Plus, Search, X } from "lucide-react";
import { createCapture } from "@/app/(app)/actions";
import { SubmitButton } from "@/components/submit-button";

export function CommandCenter() {
  const captureRef = useRef<HTMLDialogElement>(null);
  const commandRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"quick" | "url" | "manual">("quick");

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        commandRef.current?.showModal();
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "c"
      ) {
        event.preventDefault();
        captureRef.current?.showModal();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const close = (ref: React.RefObject<HTMLDialogElement | null>) =>
    ref.current?.close();
  return (
    <>
      <div className="app-quick-actions">
        <button
          onClick={() => commandRef.current?.showModal()}
          className="search-trigger"
        >
          <Search size={15} /> Search or command <kbd>⌘K</kbd>
        </button>
        <button
          onClick={() => captureRef.current?.showModal()}
          className="capture-trigger"
        >
          <Plus size={16} /> Capture
        </button>
      </div>
      <dialog
        ref={commandRef}
        className="command-dialog"
        onClick={(e) => e.target === commandRef.current && close(commandRef)}
      >
        <div className="dialog-top">
          <Command size={17} />
          <input
            autoFocus
            placeholder="Where do you want to go?"
            aria-label="Command search"
          />
          <button onClick={() => close(commandRef)} aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="command-list">
          {[
            ["Capture an insight", "capture"],
            ["Search your library", "/library"],
            ["Ask Praxis", "/ask"],
            ["Open Inbox", "/inbox"],
            ["Create a goal", "/goals"],
            ["Open Today", "/today"],
          ].map(([label, target]) =>
            target === "capture" ? (
              <button
                key={label}
                onClick={() => {
                  close(commandRef);
                  captureRef.current?.showModal();
                }}
              >
                <Plus size={16} />
                {label}
              </button>
            ) : (
              <Link key={label} href={target} onClick={() => close(commandRef)}>
                {label}
              </Link>
            ),
          )}
        </div>
      </dialog>
      <dialog
        ref={captureRef}
        className="capture-dialog"
        onClick={(e) => e.target === captureRef.current && close(captureRef)}
      >
        <div className="dialog-heading">
          <div>
            <span>QUICK CAPTURE</span>
            <h2>Save the idea. Process it later.</h2>
          </div>
          <button onClick={() => close(captureRef)} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="capture-tabs">
          {(["quick", "url", "manual"] as const).map((item) => (
            <button
              type="button"
              className={mode === item ? "active" : ""}
              onClick={() => setMode(item)}
              key={item}
            >
              {item === "quick"
                ? "Text"
                : item === "url"
                  ? "URL"
                  : "Other source"}
            </button>
          ))}
        </div>
        <form action={createCapture} className="stack-form">
          <label>
            What did you find useful?
            <textarea
              name="content"
              autoFocus
              placeholder="Paste a line, write a thought, or capture the idea in your own words…"
              maxLength={10000}
              required
            />
          </label>
          {mode !== "quick" && (
            <>
              <label>
                Source URL
                <input
                  type="url"
                  name="sourceUrl"
                  placeholder="https://"
                  maxLength={2048}
                  required={mode === "url"}
                />
              </label>
              <label>
                Source title <small>Optional; YouTube fills this automatically</small>
                <input name="sourceTitle" maxLength={500} placeholder="Video, book, episode, or article title" />
              </label>
            </>
          )}
          {mode === "manual" && (
            <label>
              Source type
              <select name="sourceType" defaultValue="book">
                <option value="book">Book</option>
                <option value="podcast">Podcast</option>
                <option value="conversation">Conversation</option>
                <option value="course">Course</option>
                <option value="instagram">Instagram</option>
                <option value="x">X / Twitter</option>
                <option value="newsletter">Newsletter</option>
                <option value="pdf">PDF</option>
                <option value="other">Other</option>
              </select>
            </label>
          )}
          {mode === "url" && (
            <input type="hidden" name="sourceType" value="article" />
          )}
          <label>
            Quick note <small>Optional</small>
            <input
              name="note"
              placeholder="Why did this stand out?"
              maxLength={2000}
            />
          </label>
          <div className="dialog-actions">
            <span>⌘⇧C opens capture anywhere</span>
            <SubmitButton pendingLabel="Saving…">Save to Inbox</SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}
