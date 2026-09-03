import { useMemo, useState } from "react";

type Mode = "generate" | "review";

type SchemaType =
  | "Organization"
  | "LocalBusiness"
  | "Article"
  | "BlogPosting"
  | "Product"
  | "Service"
  | "FAQPage"
  | "BreadcrumbList"
  | "Person"
  | "WebSite"
  | "WebPage"
  | "Event"
  | "Recipe"
  | "SoftwareApplication";

type FormData = {
  name: string;
  description: string;
  url: string;
  image: string;
  logo: string;
  author: string;
  publisher: string;
  datePublished: string;
  dateModified: string;
  price: string;
  currency: string;
  availability: string;
  telephone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  serviceType: string;
  provider: string;
  jobTitle: string;
  personName: string;
  streetAddress: string;
  itemList: string;
  faqs: string;
  ingredients: string;
  instructions: string;
  softwareVersion: string;
  operatingSystem: string;
};

const schemaTypes: SchemaType[] = [
  "Organization",
  "LocalBusiness",
  "Article",
  "BlogPosting",
  "Product",
  "Service",
  "FAQPage",
  "BreadcrumbList",
  "Person",
  "WebSite",
  "WebPage",
  "Event",
  "Recipe",
  "SoftwareApplication",
];

const initialForm: FormData = {
  name: "",
  description: "",
  url: "",
  image: "",
  logo: "",
  author: "",
  publisher: "",
  datePublished: "",
  dateModified: "",
  price: "",
  currency: "INR",
  availability: "https://schema.org/InStock",
  telephone: "",
  email: "",
  address: "",
  city: "",
  region: "",
  postalCode: "",
  country: "India",
  serviceType: "",
  provider: "",
  jobTitle: "",
  personName: "",
  streetAddress: "",
  itemList: "",
  faqs: "",
  ingredients: "",
  instructions: "",
  softwareVersion: "",
  operatingSystem: "",
};

function cleanObject(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => {
      if (item === undefined || item === null || item === "") return false;

      if (typeof item === "object" && !Array.isArray(item)) {
        return Object.keys(item as object).length > 0;
      }

      return true;
    })
  );
}

function buildSchema(type: SchemaType, form: FormData) {
  const context = "https://schema.org";

  const base = {
    "@context": context,
    "@type": type,
  };

  if (type === "Organization") {
    return cleanObject({
      ...base,
      name: form.name,
      url: form.url,
      logo: form.logo ? { "@type": "ImageObject", url: form.logo } : undefined,
      description: form.description,
      email: form.email,
      telephone: form.telephone,
    });
  }

  if (type === "LocalBusiness") {
    return cleanObject({
      ...base,
      name: form.name,
      url: form.url,
      image: form.image,
      description: form.description,
      telephone: form.telephone,
      email: form.email,
      address: cleanObject({
        "@type": "PostalAddress",
        streetAddress: form.streetAddress || form.address,
        addressLocality: form.city,
        addressRegion: form.region,
        postalCode: form.postalCode,
        addressCountry: form.country,
      }),
    });
  }

  if (type === "Article" || type === "BlogPosting") {
    return cleanObject({
      ...base,
      headline: form.name,
      description: form.description,
      image: form.image ? [form.image] : undefined,
      author: form.author
        ? {
            "@type": "Person",
            name: form.author,
          }
        : undefined,
      publisher: form.publisher
        ? {
            "@type": "Organization",
            name: form.publisher,
            logo: form.logo
              ? {
                  "@type": "ImageObject",
                  url: form.logo,
                }
              : undefined,
          }
        : undefined,
      datePublished: form.datePublished,
      dateModified: form.dateModified,
      mainEntityOfPage: form.url
        ? {
            "@type": "WebPage",
            "@id": form.url,
          }
        : undefined,
    });
  }

  if (type === "Product") {
    return cleanObject({
      ...base,
      name: form.name,
      description: form.description,
      image: form.image ? [form.image] : undefined,
      url: form.url,
      offers:
        form.price || form.currency || form.availability
          ? cleanObject({
              "@type": "Offer",
              price: form.price,
              priceCurrency: form.currency,
              availability: form.availability,
              url: form.url,
            })
          : undefined,
    });
  }

  if (type === "Service") {
    return cleanObject({
      ...base,
      name: form.name,
      description: form.description,
      serviceType: form.serviceType || undefined,
      url: form.url,
      provider: form.provider
        ? {
            "@type": "Organization",
            name: form.provider,
          }
        : undefined,
    });
  }

  if (type === "FAQPage") {
    const questions = form.faqs
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf("|");
        const question =
          separator >= 0 ? line.slice(0, separator).trim() : line;
        const answer =
          separator >= 0 ? line.slice(separator + 1).trim() : "";

        return cleanObject({
          "@type": "Question",
          name: question,
          acceptedAnswer: answer
            ? {
                "@type": "Answer",
                text: answer,
              }
            : undefined,
        });
      });

    return cleanObject({
      ...base,
      mainEntity: questions,
    });
  }

  if (type === "BreadcrumbList") {
    const items = form.itemList
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const separator = line.indexOf("|");
        const name =
          separator >= 0 ? line.slice(0, separator).trim() : line;
        const url =
          separator >= 0 ? line.slice(separator + 1).trim() : "";

        return cleanObject({
          "@type": "ListItem",
          position: index + 1,
          name,
          item: url || undefined,
        });
      });

    return cleanObject({
      ...base,
      itemListElement: items,
    });
  }

  if (type === "Person") {
    return cleanObject({
      ...base,
      name: form.personName || form.name,
      jobTitle: form.jobTitle,
      description: form.description,
      url: form.url,
      image: form.image,
      email: form.email,
      telephone: form.telephone,
    });
  }

  if (type === "WebSite") {
    return cleanObject({
      ...base,
      name: form.name,
      url: form.url,
      description: form.description,
      publisher: form.publisher
        ? {
            "@type": "Organization",
            name: form.publisher,
          }
        : undefined,
    });
  }

  if (type === "WebPage") {
    return cleanObject({
      ...base,
      name: form.name,
      url: form.url,
      description: form.description,
      image: form.image,
      isPartOf: form.url
        ? {
            "@type": "WebSite",
            url: new URL(form.url).origin,
          }
        : undefined,
    });
  }

  if (type === "Event") {
    return cleanObject({
      ...base,
      name: form.name,
      description: form.description,
      image: form.image,
      url: form.url,
      location: form.address
        ? {
            "@type": "Place",
            name: form.address,
            address: cleanObject({
              "@type": "PostalAddress",
              addressLocality: form.city,
              addressRegion: form.region,
              postalCode: form.postalCode,
              addressCountry: form.country,
            }),
          }
        : undefined,
    });
  }

  if (type === "Recipe") {
    const ingredients = form.ingredients
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    return cleanObject({
      ...base,
      name: form.name,
      description: form.description,
      image: form.image ? [form.image] : undefined,
      author: form.author
        ? {
            "@type": "Person",
            name: form.author,
          }
        : undefined,
      datePublished: form.datePublished,
      recipeIngredient: ingredients,
      recipeInstructions: form.instructions
        ? [
            {
              "@type": "HowToStep",
              text: form.instructions,
            },
          ]
        : undefined,
    });
  }

  if (type === "SoftwareApplication") {
    return cleanObject({
      ...base,
      name: form.name,
      description: form.description,
      url: form.url,
      image: form.image,
      applicationCategory: form.serviceType,
      operatingSystem: form.operatingSystem,
      softwareVersion: form.softwareVersion,
      offers: form.price
        ? {
            "@type": "Offer",
            price: form.price,
            priceCurrency: form.currency,
          }
        : undefined,
    });
  }

  return base;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  multiline = false,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <label className="field">
      <span>
        {label} {required && <b>*</b>}
      </span>

      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function App() {
  const [mode, setMode] = useState<Mode>("generate");
  const [schemaType, setSchemaType] =
    useState<SchemaType>("Organization");
  const [form, setForm] = useState<FormData>(initialForm);
  const [reviewInput, setReviewInput] = useState("");
const [reviewError, setReviewError] = useState("");
const [reviewSuccess, setReviewSuccess] = useState("");
const [copied, setCopied] = useState(false);

  const generatedSchema = useMemo(() => {
    try {
      return JSON.stringify(buildSchema(schemaType, form), null, 2);
    } catch {
      return "";
    }
  }, [schemaType, form]);

    const updateField = (key: keyof FormData, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

    const requiredFields: Partial<Record<SchemaType, (keyof FormData)[]>> = {
    Organization: ["name", "url"],
    LocalBusiness: ["name"],
    Article: ["name", "url", "author"],
    BlogPosting: ["name", "url", "author"],
    Product: ["name"],
    Service: ["name"],
    FAQPage: ["faqs"],
    BreadcrumbList: ["itemList"],
    Person: ["personName"],
    WebSite: ["name", "url"],
    WebPage: ["name", "url"],
    Event: ["name"],
    Recipe: ["name"],
    SoftwareApplication: ["name"],
  };

  const isFormComplete = (type: SchemaType) => {
    const fields = requiredFields[type] ?? [];

    return fields.every((field) => form[field].trim() !== "");
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadJson = () => {
    const blob = new Blob([generatedSchema], {
      type: "application/ld+json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${schemaType.toLowerCase()}-schema.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const review = () => {
  setReviewError("");
  setReviewSuccess("");

  try {
    const parsed = JSON.parse(reviewInput);

    const types = Array.isArray(parsed)
      ? parsed.map((item) => item?.["@type"]).filter(Boolean)
      : [parsed?.["@type"]].filter(Boolean);

    if (types.length === 0) {
      setReviewError(
        "No @type property was found in the supplied JSON-LD."
      );
      return;
    }

    setReviewSuccess(
      `Valid JSON-LD. Detected schema type: ${types.join(", ")}.`
    );
  } catch {
    setReviewError(
      "The supplied content is not valid JSON. Check commas, quotes, brackets and braces."
    );
  }
};

  const reset = () => {
    setForm(initialForm);
    setReviewInput("");
    setReviewError("");
    setCopied(false);
  };

  const renderFields = () => {
    if (schemaType === "Organization") {
      return (
        <>
          <Field
            label="Organization name"
            value={form.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Your organization name"
            required
          />
          <Field
            label="Website URL"
            value={form.url}
            onChange={(value) => updateField("url", value)}
            placeholder="https://example.com"
            required
          />
          <Field
            label="Description"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            placeholder="Brief description of the organization"
            multiline
          />
          <Field
            label="Logo URL"
            value={form.logo}
            onChange={(value) => updateField("logo", value)}
            placeholder="https://example.com/logo.png"
          />
          <Field
            label="Email"
            value={form.email}
            onChange={(value) => updateField("email", value)}
            placeholder="hello@example.com"
          />
          <Field
            label="Telephone"
            value={form.telephone}
            onChange={(value) => updateField("telephone", value)}
            placeholder="+91 98765 43210"
          />
        </>
      );
    }

    if (schemaType === "LocalBusiness") {
      return (
        <>
          <Field
            label="Business name"
            value={form.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Business name"
            required
          />
          <Field
            label="Website URL"
            value={form.url}
            onChange={(value) => updateField("url", value)}
            placeholder="https://example.com"
          />
          <Field
            label="Business description"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            placeholder="Describe the business"
            multiline
          />
          <Field
            label="Image URL"
            value={form.image}
            onChange={(value) => updateField("image", value)}
            placeholder="https://example.com/business.jpg"
          />
          <Field
            label="Telephone"
            value={form.telephone}
            onChange={(value) => updateField("telephone", value)}
            placeholder="+91 98765 43210"
          />
          <Field
            label="Street address"
            value={form.streetAddress}
            onChange={(value) => updateField("streetAddress", value)}
            placeholder="123 Main Street"
          />
          <Field
            label="City"
            value={form.city}
            onChange={(value) => updateField("city", value)}
            placeholder="Mumbai"
          />
          <Field
            label="State / region"
            value={form.region}
            onChange={(value) => updateField("region", value)}
            placeholder="Maharashtra"
          />
          <Field
            label="Postal code"
            value={form.postalCode}
            onChange={(value) => updateField("postalCode", value)}
            placeholder="400001"
          />
          <Field
            label="Country"
            value={form.country}
            onChange={(value) => updateField("country", value)}
            placeholder="India"
          />
        </>
      );
    }

    if (schemaType === "Article" || schemaType === "BlogPosting") {
      return (
        <>
          <Field
            label="Headline"
            value={form.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Article headline"
            required
          />
          <Field
            label="Article URL"
            value={form.url}
            onChange={(value) => updateField("url", value)}
            placeholder="https://example.com/article"
            required
          />
          <Field
            label="Description"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            placeholder="Short article description"
            multiline
          />
          <Field
            label="Image URL"
            value={form.image}
            onChange={(value) => updateField("image", value)}
            placeholder="https://example.com/article.jpg"
          />
          <Field
            label="Author name"
            value={form.author}
            onChange={(value) => updateField("author", value)}
            placeholder="Author name"
            required
          />
          <Field
            label="Publisher name"
            value={form.publisher}
            onChange={(value) => updateField("publisher", value)}
            placeholder="Publisher / organization"
          />
          <Field
            label="Publisher logo URL"
            value={form.logo}
            onChange={(value) => updateField("logo", value)}
            placeholder="https://example.com/logo.png"
          />
          <Field
            label="Date published"
            value={form.datePublished}
            onChange={(value) => updateField("datePublished", value)}
            placeholder="2026-09-02"
          />
          <Field
            label="Date modified"
            value={form.dateModified}
            onChange={(value) => updateField("dateModified", value)}
            placeholder="2026-09-02"
          />
        </>
      );
    }

    if (schemaType === "Product") {
      return (
        <>
          <Field
            label="Product name"
            value={form.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Product name"
            required
          />
          <Field
            label="Product URL"
            value={form.url}
            onChange={(value) => updateField("url", value)}
            placeholder="https://example.com/product"
          />
          <Field
            label="Description"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            placeholder="Product description"
            multiline
          />
          <Field
            label="Image URL"
            value={form.image}
            onChange={(value) => updateField("image", value)}
            placeholder="https://example.com/product.jpg"
          />
          <Field
            label="Price"
            value={form.price}
            onChange={(value) => updateField("price", value)}
            placeholder="999"
          />
          <Field
            label="Currency"
            value={form.currency}
            onChange={(value) => updateField("currency", value)}
            placeholder="INR"
          />
        </>
      );
    }

    if (schemaType === "Service") {
      return (
        <>
          <Field
            label="Service name"
            value={form.name}
            onChange={(value) => updateField("name", value)}
            placeholder="SEO consulting"
            required
          />
          <Field
            label="Service type"
            value={form.serviceType}
            onChange={(value) => updateField("serviceType", value)}
            placeholder="SEO Service"
          />
          <Field
            label="Description"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            placeholder="Describe the service"
            multiline
          />
          <Field
            label="Service URL"
            value={form.url}
            onChange={(value) => updateField("url", value)}
            placeholder="https://example.com/services"
          />
          <Field
            label="Provider"
            value={form.provider}
            onChange={(value) => updateField("provider", value)}
            placeholder="Organization or business name"
          />
        </>
      );
    }

    if (schemaType === "FAQPage") {
      return (
        <>
          <Field
            label="FAQ questions and answers"
            value={form.faqs}
            onChange={(value) => updateField("faqs", value)}
            placeholder={
              "What is SEO? | SEO improves a website's visibility.\nHow long does SEO take? | SEO is an ongoing process."
            }
            multiline
            rows={8}
            required
          />
          <p className="field-help">
            Enter one question per line using: <b>Question | Answer</b>
          </p>
        </>
      );
    }

    if (schemaType === "BreadcrumbList") {
      return (
        <>
          <Field
            label="Breadcrumb items"
            value={form.itemList}
            onChange={(value) => updateField("itemList", value)}
            placeholder={
              "Home | https://example.com/\nSEO | https://example.com/seo/\nSEO Services | https://example.com/seo-services/"
            }
            multiline
            rows={8}
            required
          />
          <p className="field-help">
            Enter one breadcrumb per line using: <b>Name | URL</b>
          </p>
        </>
      );
    }

    if (schemaType === "Person") {
      return (
        <>
          <Field
            label="Person name"
            value={form.personName}
            onChange={(value) => updateField("personName", value)}
            placeholder="Full name"
            required
          />
          <Field
            label="Job title"
            value={form.jobTitle}
            onChange={(value) => updateField("jobTitle", value)}
            placeholder="SEO Consultant"
          />
          <Field
            label="Description"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            placeholder="Professional description"
            multiline
          />
          <Field
            label="Profile URL"
            value={form.url}
            onChange={(value) => updateField("url", value)}
            placeholder="https://example.com/about"
          />
          <Field
            label="Image URL"
            value={form.image}
            onChange={(value) => updateField("image", value)}
            placeholder="https://example.com/profile.jpg"
          />
          <Field
            label="Email"
            value={form.email}
            onChange={(value) => updateField("email", value)}
            placeholder="person@example.com"
          />
        </>
      );
    }

    if (schemaType === "WebSite" || schemaType === "WebPage") {
      return (
        <>
          <Field
            label={schemaType === "WebSite" ? "Website name" : "Page name"}
            value={form.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Name"
            required
          />
          <Field
            label="URL"
            value={form.url}
            onChange={(value) => updateField("url", value)}
            placeholder="https://example.com/"
            required
          />
          <Field
            label="Description"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            placeholder="Description"
            multiline
          />
          {schemaType === "WebSite" && (
            <Field
              label="Publisher"
              value={form.publisher}
              onChange={(value) => updateField("publisher", value)}
              placeholder="Organization name"
            />
          )}
        </>
      );
    }

    if (schemaType === "Event") {
      return (
        <>
          <Field
            label="Event name"
            value={form.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Event name"
            required
          />
          <Field
            label="Event URL"
            value={form.url}
            onChange={(value) => updateField("url", value)}
            placeholder="https://example.com/event"
          />
          <Field
            label="Description"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            placeholder="Event description"
            multiline
          />
          <Field
            label="Venue"
            value={form.address}
            onChange={(value) => updateField("address", value)}
            placeholder="Venue name"
          />
          <Field
            label="City"
            value={form.city}
            onChange={(value) => updateField("city", value)}
            placeholder="Mumbai"
          />
          <Field
            label="State / region"
            value={form.region}
            onChange={(value) => updateField("region", value)}
            placeholder="Maharashtra"
          />
          <Field
            label="Country"
            value={form.country}
            onChange={(value) => updateField("country", value)}
            placeholder="India"
          />
        </>
      );
    }

    if (schemaType === "Recipe") {
      return (
        <>
          <Field
            label="Recipe name"
            value={form.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Recipe name"
            required
          />
          <Field
            label="Description"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            placeholder="Recipe description"
            multiline
          />
          <Field
            label="Image URL"
            value={form.image}
            onChange={(value) => updateField("image", value)}
            placeholder="https://example.com/recipe.jpg"
          />
          <Field
            label="Author"
            value={form.author}
            onChange={(value) => updateField("author", value)}
            placeholder="Author name"
          />
          <Field
            label="Ingredients"
            value={form.ingredients}
            onChange={(value) => updateField("ingredients", value)}
            placeholder={"2 cups flour\n1 cup milk\n1 tsp salt"}
            multiline
            rows={6}
          />
          <Field
            label="Instructions"
            value={form.instructions}
            onChange={(value) => updateField("instructions", value)}
            placeholder="Describe the preparation steps."
            multiline
            rows={6}
          />
        </>
      );
    }

    if (schemaType === "SoftwareApplication") {
      return (
        <>
          <Field
            label="Application name"
            value={form.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Application name"
            required
          />
          <Field
            label="Application URL"
            value={form.url}
            onChange={(value) => updateField("url", value)}
            placeholder="https://example.com/app"
          />
          <Field
            label="Description"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            placeholder="Application description"
            multiline
          />
          <Field
            label="Application category"
            value={form.serviceType}
            onChange={(value) => updateField("serviceType", value)}
            placeholder="BusinessApplication"
          />
          <Field
            label="Operating system"
            value={form.operatingSystem}
            onChange={(value) => updateField("operatingSystem", value)}
            placeholder="Web"
          />
          <Field
            label="Software version"
            value={form.softwareVersion}
            onChange={(value) => updateField("softwareVersion", value)}
            placeholder="1.0"
          />
          <Field
            label="Price"
            value={form.price}
            onChange={(value) => updateField("price", value)}
            placeholder="0"
          />
          <Field
            label="Currency"
            value={form.currency}
            onChange={(value) => updateField("currency", value)}
            placeholder="INR"
          />
        </>
      );
    }

    return null;
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-name">SarjilSEO</div>
            <div className="brand-subtitle">Schema Markup Generator</div>
          </div>
        </div>

        <div className="header-badge">Free Tool</div>
      </header>

      <main className="container">
        <section className="hero">
          <span className="eyebrow">STRUCTURED DATA TOOL</span>

          <h1>Schema Markup Generator & Reviewer</h1>

          <p>
            Create clean Schema.org JSON-LD markup or review existing
            structured data before adding it to your website.
          </p>
        </section>

        <div className="mode-switch">
          <button
            className={mode === "generate" ? "active" : ""}
            onClick={() => setMode("generate")}
          >
            Generate Schema
          </button>

          <button
            className={mode === "review" ? "active" : ""}
            onClick={() => setMode("review")}
          >
            Review Schema
          </button>
        </div>

        {mode === "generate" ? (
          <section className="workspace">
            <div className="panel form-panel">
              <div className="panel-heading">
                <div>
                  <h2>Generate structured data</h2>
                  <p>Select a schema type and complete the relevant fields.</p>
                </div>
              </div>

              <label className="field">
                <span>Schema type</span>
                <select
                  value={schemaType}
                  onChange={(event) =>
                    setSchemaType(event.target.value as SchemaType)
                  }
                >
                  {schemaTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-grid">{renderFields()}</div>

              <div className="actions">
                <button
                  className="button secondary"
                  onClick={reset}
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="panel output-panel">
              <div className="panel-heading output-heading">
                <div>
                  <h2>Generated JSON-LD</h2>
                  <p>Review the markup before placing it on your page.</p>
                </div>

                <span
  className={`status-pill ${
    isFormComplete(schemaType) ? "ready" : "incomplete"
  }`}
>
  {isFormComplete(schemaType) ? "Ready" : "Incomplete"}
</span>
              </div>

              <pre className="code-output">
                <code>{generatedSchema}</code>
              </pre>

              <div className="actions">
                <button
                  className="button primary"
                  onClick={() => copyText(generatedSchema)}
                >
                  {copied ? "Copied!" : "Copy JSON-LD"}
                </button>

                <button
                  className="button secondary"
                  onClick={downloadJson}
                >
                  Download JSON
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="review-section">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Review existing Schema</h2>
                  <p>
                    Paste JSON-LD below to check its syntax and identify
                    the detected schema type.
                  </p>
                </div>
              </div>

              <textarea
                className="review-editor"
                value={reviewInput}
                onChange={(event) => setReviewInput(event.target.value)}
                placeholder="Paste your JSON-LD here to review it..."
              />

              {reviewError && (
  <div className="review-error">{reviewError}</div>
)}

{reviewSuccess && (
  <div className="review-success">{reviewSuccess}</div>
)}

              <div className="actions">
                <button className="button primary" onClick={review}>
                  Review Schema
                </button>

                <button
  className="button secondary"
  onClick={() => {
    setReviewInput("");
    setReviewError("");
    setReviewSuccess("");
  }}
>
  Clear
</button>
              </div>

              <div className="review-note">
                <strong>Important:</strong> Schema.org validity does not
                guarantee eligibility for a Google rich result. Google's
                structured-data requirements and search-feature guidelines
                should also be checked.
              </div>
            </div>
          </section>
        )}

        <section className="info-grid">
          <div className="info-card">
            <span className="info-number">01</span>
            <h3>Choose a schema type</h3>
            <p>
              Start with a curated selection of commonly used
              Schema.org types.
            </p>
          </div>

          <div className="info-card">
            <span className="info-number">02</span>
            <h3>Complete the fields</h3>
            <p>
              Only relevant fields are presented for the selected
              schema type.
            </p>
          </div>

          <div className="info-card">
            <span className="info-number">03</span>
            <h3>Copy your JSON-LD</h3>
            <p>
              Review the generated markup and add it to the appropriate
              page on your website.
            </p>
          </div>
        </section>

        <section className="disclaimer">
  <strong>Schema.org structured data</strong>{" "}
  <span>
    This tool generates JSON-LD based on Schema.org vocabulary.
    Always review the generated markup and Google's current
    structured-data guidelines before publishing.
  </span>
</section>
</main>

<footer className="footer">
  <div className="footer-content">
    <span>© {new Date().getFullYear()} SarjilSEO</span>
    <span>Schema Markup Generator</span>
  </div>
</footer>
    </div>
  );
}

export default App;
