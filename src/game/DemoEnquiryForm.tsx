import { useState, type FormEvent } from "react";

import { bookingSchema, getBookingWhatsAppHref } from "./booking";

interface FormValues {
  studentName: string;
  studentClass: string;
  parentPhone: string;
  preferredTime: string;
}

interface FormErrors {
  studentName?: string;
  studentClass?: string;
  parentPhone?: string;
  preferredTime?: string;
}

const EMPTY_FORM: FormValues = {
  studentName: "",
  studentClass: "",
  parentPhone: "",
  preferredTime: "",
};

export function DemoEnquiryForm() {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [whatsAppHref, setWhatsAppHref] = useState<string | null>(null);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setWhatsAppHref(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = bookingSchema.safeParse(values);

    if (!result.success) {
      const nextErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        switch (field) {
          case "studentName": nextErrors.studentName = issue.message; break;
          case "studentClass": nextErrors.studentClass = issue.message; break;
          case "parentPhone": nextErrors.parentPhone = issue.message; break;
          case "preferredTime": nextErrors.preferredTime = issue.message; break;
        }
      }
      setErrors(nextErrors);
      setWhatsAppHref(null);
      return;
    }

    setErrors({});
    setWhatsAppHref(getBookingWhatsAppHref(result.data));
  }

  return (
    <div className="demo-form-wrap">
      <p className="form-note">First demo class is free.</p>
      <form className="demo-form" onSubmit={handleSubmit} noValidate>
        <label className="form-field">
          <span>Student name</span>
          <input
            autoComplete="name"
            name="studentName"
            value={values.studentName}
            maxLength={80}
            onChange={(event) => updateField("studentName", event.currentTarget.value)}
            aria-invalid={Boolean(errors.studentName)}
            aria-describedby={errors.studentName ? "student-name-error" : undefined}
            required
          />
          {errors.studentName ? <span className="field-error" id="student-name-error">{errors.studentName}</span> : null}
        </label>

        <label className="form-field">
          <span>Class</span>
          <select
            name="studentClass"
            value={values.studentClass}
            onChange={(event) => updateField("studentClass", event.currentTarget.value)}
            aria-invalid={Boolean(errors.studentClass)}
            aria-describedby={errors.studentClass ? "student-class-error" : undefined}
            required
          >
            <option value="">Choose a class</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>
          {errors.studentClass ? <span className="field-error" id="student-class-error">{errors.studentClass}</span> : null}
        </label>

        <label className="form-field">
          <span>Parent phone</span>
          <input
            autoComplete="tel-national"
            inputMode="numeric"
            name="parentPhone"
            type="tel"
            value={values.parentPhone}
            maxLength={10}
            onChange={(event) => updateField("parentPhone", event.currentTarget.value.replace(/\D/g, ""))}
            aria-invalid={Boolean(errors.parentPhone)}
            aria-describedby={errors.parentPhone ? "parent-phone-error" : undefined}
            required
          />
          {errors.parentPhone ? <span className="field-error" id="parent-phone-error">{errors.parentPhone}</span> : null}
        </label>

        <label className="form-field">
          <span>Preferred time</span>
          <select
            name="preferredTime"
            value={values.preferredTime}
            onChange={(event) => updateField("preferredTime", event.currentTarget.value)}
            aria-invalid={Boolean(errors.preferredTime)}
            aria-describedby={errors.preferredTime ? "preferred-time-error" : undefined}
            required
          >
            <option value="">Choose a time</option>
            <option value="After school · 4–6 pm">After school · 4–6 pm</option>
            <option value="Early evening · 6–8 pm">Early evening · 6–8 pm</option>
            <option value="Weekend · flexible">Weekend · flexible</option>
          </select>
          {errors.preferredTime ? <span className="field-error" id="preferred-time-error">{errors.preferredTime}</span> : null}
        </label>

        <button className="button button-primary form-submit" type="submit">
          Request free demo
        </button>
      </form>

      {whatsAppHref ? (
        <div className="form-success" role="status" aria-live="polite">
          <p>Thanks, {values.studentName.trim()}. Your demo request is ready.</p>
          <a className="button button-whatsapp form-whatsapp" href={whatsAppHref} target="_blank" rel="noreferrer">
            Send on WhatsApp
          </a>
        </div>
      ) : null}
    </div>
  );
}