import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError, postBooking, postEnquiry } from "../../lib/api";
import { Button } from "../ui/Button";
import { Field, SelectField, TextAreaField } from "../ui/Fields";

const services = [
  "Photography",
  "Videography",
  "Printing",
  "Custom Gifts",
  "Live Streaming",
  "Other",
];

type Props = {
  purpose: "contact" | "booking";
  productId?: string;
  productName?: string;
};

export function StudioForm({ purpose, productId, productName }: Props) {
  const [params] = useSearchParams();
  const prefilled = params.get("service") || productName || "";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState(prefilled);
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const options = useMemo(() => {
    if (prefilled && !services.includes(prefilled)) return [prefilled, ...services];
    return services;
  }, [prefilled]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSuccess("");
    try {
      if (purpose === "booking") {
        const result = await postBooking({
          name,
          phone,
          email,
          service,
          eventDate,
          location,
          requirements: details,
          honeypot,
        });
        setSuccess(result.message);
      } else {
        const result = await postEnquiry({
          name,
          phone,
          email,
          source: productId ? "product" : "contact",
          service,
          details,
          productId: productId || "",
          honeypot,
        });
        setSuccess(result.message);
      }
      setName("");
      setPhone("");
      setEmail("");
      setEventDate("");
      setLocation("");
      setDetails("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)} noValidate>
      <Field id={`${purpose}-name`} label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
      <Field
        id={`${purpose}-phone`}
        label="Contact number"
        required
        placeholder="07XXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Field
        id={`${purpose}-email`}
        label="Email (optional)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <SelectField
        id={`${purpose}-service`}
        label="Service type"
        required
        value={service}
        onChange={(e) => setService(e.target.value)}
      >
        <option value="">Select a service</option>
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </SelectField>
      {purpose === "booking" ? (
        <>
          <Field
            id={`${purpose}-date`}
            label="Event date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
          <Field
            id={`${purpose}-location`}
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </>
      ) : null}
      <TextAreaField
        id={`${purpose}-details`}
        label={purpose === "booking" ? "Requirements" : "Event / order details"}
        rows={5}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      />
      <label className="sr-only" htmlFor={`${purpose}-company`}>
        Company
        <input
          id={`${purpose}-company`}
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </label>
      {error ? (
        <p className="text-sm text-light-gold" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-light-gold" role="status">
          {success}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending
          ? "Sending"
          : purpose === "booking"
            ? "Send booking enquiry"
            : "Send enquiry / place order"}
      </Button>
    </form>
  );
}
