"use server";

type NewsletterState = { status: "idle" | "success" | "error"; message?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeToNewsletter(
  _previous: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  // TODO: send `email` to the chosen destination (Shopify, Klaviyo, Mailchimp, ...).
  return { status: "error", message: "Sign-up isn't available yet. Please try again later." };
}
