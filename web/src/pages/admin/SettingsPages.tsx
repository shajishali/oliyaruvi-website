import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/useAdmin";
import { Button } from "../../components/ui/Button";
import { Field, TextAreaField } from "../../components/ui/Fields";
import { ApiError, getAdminSettings, saveAdminSettings } from "../../lib/api";
import type { SiteSettings } from "../../lib/types";

type Mode = "all" | "contact" | "seo";

const empty: SiteSettings = {
  businessName: "",
  businessNameTa: "",
  locationEn: "",
  locationTa: "",
  phonePrimary: "",
  phoneSecondary: "",
  whatsappNumber: "",
  experienceYears: 0,
  addressEn: "",
  addressTa: "",
  mapUrl: "",
  hours: null,
  socialLinks: [],
  announcementEn: "",
  announcementTa: "",
  announcementEnabled: false,
  contentVersion: 1,
};

export function SettingsPage() {
  return <SettingsEditor mode="all" title="Site settings" />;
}

export function ContactDetailsPage() {
  return <SettingsEditor mode="contact" title="Contact details" />;
}

export function SeoDefaultsPage() {
  return <SettingsEditor mode="seo" title="SEO and announcements" />;
}

function SettingsEditor({ mode, title }: { mode: Mode; title: string }) {
  const { token } = useAdmin();
  const [settings, setSettings] = useState<SiteSettings>(empty);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [socialDraft, setSocialDraft] = useState("");

  useEffect(() => {
    let active = true;
    getAdminSettings(token)
      .then((data) => {
        if (!active) return;
        setSettings({
          ...data,
          addressEn: data.addressEn ?? "",
          addressTa: data.addressTa ?? "",
          mapUrl: data.mapUrl ?? "",
          announcementEn: data.announcementEn ?? "",
          announcementTa: data.announcementTa ?? "",
        });
        setSocialDraft(
          (data.socialLinks ?? []).map((item) => `${item.label}|${item.url}`).join("\n"),
        );
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof ApiError ? caught.message : "Could not load settings");
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function onSave() {
    setPending(true);
    setError("");
    setMessage("");
    try {
      const socialLinks = socialDraft
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, ...rest] = line.split("|");
          return { label: label.trim(), url: rest.join("|").trim() };
        })
        .filter((item) => item.label && item.url);
      const saved = await saveAdminSettings(token, {
        ...settings,
        addressEn: settings.addressEn || null,
        addressTa: settings.addressTa || null,
        mapUrl: settings.mapUrl || null,
        announcementEn: settings.announcementEn || null,
        announcementTa: settings.announcementTa || null,
        socialLinks,
      });
      setSettings({
        ...saved,
        addressEn: saved.addressEn ?? "",
        addressTa: saved.addressTa ?? "",
        mapUrl: saved.mapUrl ?? "",
        announcementEn: saved.announcementEn ?? "",
        announcementTa: saved.announcementTa ?? "",
      });
      setMessage("Saved. Header phones and public contact blocks update from these values.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  function patch<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid max-w-3xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl">{title}</h1>
          <p className="mt-2 text-muted">Shared studio details used across the public site.</p>
        </div>
        <Button disabled={pending} onClick={() => void onSave()}>
          {pending ? "Saving" : "Save"}
        </Button>
      </div>
      {error ? (
        <p className="text-light-gold" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-muted">{message}</p> : null}
      <div className="grid gap-3 rounded-[1.5rem] border border-gold/20 bg-surface/40 p-4">
        {mode === "all" || mode === "contact" ? (
          <>
            <Field id="biz" label="Business name EN" value={settings.businessName} onChange={(e) => patch("businessName", e.target.value)} />
            <Field id="biz-ta" label="Business name TA" value={settings.businessNameTa} onChange={(e) => patch("businessNameTa", e.target.value)} />
            <Field id="loc" label="Location EN" value={settings.locationEn} onChange={(e) => patch("locationEn", e.target.value)} />
            <Field id="phone1" label="Primary phone" value={settings.phonePrimary} onChange={(e) => patch("phonePrimary", e.target.value)} />
            <Field id="phone2" label="Secondary phone" value={settings.phoneSecondary} onChange={(e) => patch("phoneSecondary", e.target.value)} />
            <Field id="wa" label="WhatsApp" value={settings.whatsappNumber} onChange={(e) => patch("whatsappNumber", e.target.value)} />
            <Field id="years" label="Experience years" type="number" value={settings.experienceYears} onChange={(e) => patch("experienceYears", Number(e.target.value) || 0)} />
            <Field id="address" label="Address EN" value={settings.addressEn ?? ""} onChange={(e) => patch("addressEn", e.target.value)} />
            <Field id="map" label="Map URL" value={settings.mapUrl ?? ""} onChange={(e) => patch("mapUrl", e.target.value)} />
            <TextAreaField
              id="social"
              label="Social links (label|url per line)"
              rows={4}
              value={socialDraft}
              onChange={(e) => setSocialDraft(e.target.value)}
            />
          </>
        ) : null}
        {mode === "all" || mode === "seo" ? (
          <>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={settings.announcementEnabled}
                onChange={(e) => patch("announcementEnabled", e.target.checked)}
              />
              Announcement enabled
            </label>
            <TextAreaField
              id="ann-en"
              label="Announcement EN"
              rows={3}
              value={settings.announcementEn ?? ""}
              onChange={(e) => patch("announcementEn", e.target.value)}
            />
            <TextAreaField
              id="ann-ta"
              label="Announcement TA"
              rows={3}
              value={settings.announcementTa ?? ""}
              onChange={(e) => patch("announcementTa", e.target.value)}
            />
            {mode === "seo" ? (
              <p className="text-sm text-muted">
                Per-page SEO titles and descriptions are edited in the page builder. These fields control the
                site-wide announcement strip.
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
