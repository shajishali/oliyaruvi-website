import { useState } from "react";
import type { BlockType, PublicSection } from "../../lib/types";
import { Field, SelectField, TextAreaField } from "../ui/Fields";
import { Button } from "../ui/Button";
import { MediaPicker } from "./MediaPicker";
import { asArray, asRecord, asString } from "../../lib/content";

type Tab = "content" | "style" | "animation";

export function SectionEditor({
  section,
  onChange,
}: {
  section: PublicSection;
  onChange: (section: PublicSection) => void;
}) {
  const [tab, setTab] = useState<Tab>("content");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"mediaIds" | "mediaId">("mediaIds");

  const content = asRecord(section.content);
  const style = asRecord(section.style);
  const animation = asRecord(section.animation);
  const en = asRecord(content.en);
  const ta = asRecord(content.ta);

  function setContent(patch: Record<string, unknown>) {
    onChange({ ...section, content: { ...content, ...patch } });
  }

  function setLocale(locale: "en" | "ta", patch: Record<string, string>) {
    const current = asRecord(content[locale]);
    setContent({ [locale]: { ...current, ...patch } });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {(["content", "style", "animation"] as const).map((name) => (
          <button
            key={name}
            type="button"
            className={`btn is-outline capitalize ${tab === name ? "ring-1 ring-gold" : ""}`}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {tab === "content" ? (
        <div className="grid gap-3">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={section.isVisible}
              onChange={(event) => onChange({ ...section, isVisible: event.target.checked })}
            />
            Visible on publish
          </label>

          {section.blockType === "hero" ? (
            <>
              <SelectField
                id="hero-media-type"
                label="Hero media type"
                value={asString(content.mediaType, "image")}
                onChange={(event) => setContent({ mediaType: event.target.value })}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="slider">Slider</option>
              </SelectField>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={Boolean(content.autoplay)}
                    onChange={(event) => setContent({ autoplay: event.target.checked })}
                  />
                  Autoplay
                </label>
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={content.mute !== false}
                    onChange={(event) => setContent({ mute: event.target.checked })}
                  />
                  Mute
                </label>
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={Boolean(content.loop)}
                    onChange={(event) => setContent({ loop: event.target.checked })}
                  />
                  Loop
                </label>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setPickerTarget("mediaIds");
                  setPickerOpen(true);
                }}
              >
                Attach media
              </Button>
              <p className="text-xs text-muted">Media IDs: {asArray(content.mediaIds).join(", ") || "none"}</p>
            </>
          ) : null}

          {section.blockType === "image" ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setPickerTarget("mediaId");
                  setPickerOpen(true);
                }}
              >
                Choose image
              </Button>
              <p className="text-xs text-muted">Media: {asString(content.mediaId) || "none"}</p>
            </>
          ) : null}

          {hasLocaleCopy(section.blockType) ? (
            <div className="grid gap-3 md:grid-cols-2">
              <LocaleFields
                locale="EN"
                values={en}
                fields={localeFieldsFor(section.blockType)}
                onChange={(patch) => setLocale("en", patch)}
              />
              <LocaleFields
                locale="TA"
                values={ta}
                fields={localeFieldsFor(section.blockType)}
                onChange={(patch) => setLocale("ta", patch)}
              />
            </div>
          ) : null}

          {"primaryHref" in content || section.blockType === "hero" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Field
                id="primary-href"
                label="Primary href"
                value={asString(content.primaryHref)}
                onChange={(event) => setContent({ primaryHref: event.target.value })}
              />
              <Field
                id="secondary-href"
                label="Secondary href"
                value={asString(content.secondaryHref)}
                onChange={(event) => setContent({ secondaryHref: event.target.value })}
              />
            </div>
          ) : null}

          {section.blockType === "cta" ? (
            <Field
              id="cta-href"
              label="Button href"
              value={asString(content.href)}
              onChange={(event) => setContent({ href: event.target.value })}
            />
          ) : null}

          {section.blockType === "product_grid" ? (
            <SelectField
              id="catalogue"
              label="Catalogue"
              value={asString(content.catalogue, "printing")}
              onChange={(event) => setContent({ catalogue: event.target.value })}
            >
              <option value="printing">Printing</option>
              <option value="gifts">Gifts</option>
            </SelectField>
          ) : null}

          {section.blockType === "contact_form" ? (
            <SelectField
              id="purpose"
              label="Form purpose"
              value={asString(content.purpose, "contact")}
              onChange={(event) => setContent({ purpose: event.target.value })}
            >
              <option value="contact">Contact</option>
              <option value="booking">Booking</option>
            </SelectField>
          ) : null}

          {!hasLocaleCopy(section.blockType) && section.blockType !== "hero" && section.blockType !== "image" ? (
            <p className="text-sm text-muted">
              This block pulls shared catalogue or list data. Heading fields appear when the block supports them.
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === "style" ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            id="style-bg"
            label="Background"
            value={asString(style.background)}
            onChange={(event) => onChange({ ...section, style: { ...style, background: event.target.value } })}
          />
          <Field
            id="style-spacing"
            label="Spacing"
            value={asString(style.spacing)}
            onChange={(event) => onChange({ ...section, style: { ...style, spacing: event.target.value } })}
          />
          <SelectField
            id="style-align"
            label="Alignment"
            value={asString(style.alignment, "left")}
            onChange={(event) => onChange({ ...section, style: { ...style, alignment: event.target.value } })}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </SelectField>
        </div>
      ) : null}

      {tab === "animation" ? (
        <SelectField
          id="anim-type"
          label="Animation"
          value={asString(animation.type, "fade")}
          onChange={(event) => onChange({ ...section, animation: { ...animation, type: event.target.value } })}
        >
          <option value="none">None</option>
          <option value="fade">Fade</option>
          <option value="rise">Rise</option>
        </SelectField>
      ) : null}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(media) => {
          if (pickerTarget === "mediaId") {
            setContent({ mediaId: media.id });
            return;
          }
          const current = asArray(content.mediaIds).map(String);
          setContent({ mediaIds: [...current, media.id] });
        }}
      />
    </div>
  );
}

function hasLocaleCopy(blockType: BlockType) {
  return [
    "hero",
    "video_hero",
    "text",
    "image",
    "gallery",
    "video_gallery",
    "services",
    "product_grid",
    "live_events",
    "testimonials",
    "faq",
    "contact_form",
    "cta",
  ].includes(blockType);
}

function localeFieldsFor(blockType: BlockType): string[] {
  switch (blockType) {
    case "hero":
      return ["heading", "subheading", "body", "primaryLabel", "secondaryLabel"];
    case "video_hero":
      return ["heading", "subheading"];
    case "text":
    case "cta":
      return blockType === "cta" ? ["heading", "body", "buttonLabel"] : ["heading", "body"];
    case "image":
      return ["caption"];
    case "contact_form":
      return ["heading", "intro"];
    default:
      return ["heading"];
  }
}

function LocaleFields({
  locale,
  values,
  fields,
  onChange,
}: {
  locale: string;
  values: Record<string, unknown>;
  fields: string[];
  onChange: (patch: Record<string, string>) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-gold/15 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{locale}</p>
      {fields.map((field) => {
        const value = asString(values[field]);
        const missingTa = locale === "TA" && !value.trim();
        const label = missingTa ? `${field} · Tamil missing` : field;
        return field === "body" || field === "intro" ? (
          <TextAreaField
            key={field}
            id={`${locale}-${field}`}
            label={label}
            rows={3}
            value={value}
            onChange={(event) => onChange({ [field]: event.target.value })}
          />
        ) : (
          <Field
            key={field}
            id={`${locale}-${field}`}
            label={label}
            value={value}
            onChange={(event) => onChange({ [field]: event.target.value })}
          />
        );
      })}
    </div>
  );
}
