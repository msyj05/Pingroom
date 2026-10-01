import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";
import Picker, { Theme, type EmojiClickData } from "emoji-picker-react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [pickerWidth, setPickerWidth] = useState(320);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      const maxWidth = window.innerWidth - 24;
      setPickerWidth(Math.min(320, maxWidth));
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // NEW: prevent the picker's search input from stealing focus (and popping
  // the mobile keyboard) when the panel opens.
  useEffect(() => {
    if (!open) return;
    const blurActiveInput = () => {
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        panelRef.current?.contains(active) &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
      ) {
        active.blur();
      }
    };
    // Run a few times to cover the picker's own autofocus timing
    const timers = [0, 50, 150, 300].map((ms) =>
      setTimeout(blurActiveInput, ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [open]);

  return (
    <span className="relative" ref={wrapperRef}>
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-20 right-3 z-50 overflow-hidden rounded-xl border border-line shadow-2xl sm:absolute sm:bottom-10 sm:right-0"
        >
          <Picker
            onEmojiClick={(data: EmojiClickData) => onSelect(data.emoji)}
            theme={Theme.LIGHT}
            width={pickerWidth}
            height={400}
          />
        </div>
      )}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className={`transition ${open ? "text-lime" : "text-muted hover:text-ink"}`}
        aria-label="Toggle emoji picker"
      >
        <Smile size={18} />
      </button>
    </span>
  );
}
