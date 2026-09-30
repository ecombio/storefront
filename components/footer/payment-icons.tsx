import Image from "next/image";

const METHODS = [
  { file: "visa", label: "Visa" },
  { file: "mastercard", label: "Mastercard" },
  { file: "amex", label: "American Express" },
  { file: "discover", label: "Discover" },
  { file: "paypal", label: "PayPal" },
  { file: "apple_pay", label: "Apple Pay" },
  { file: "google_pay", label: "Google Pay" },
  { file: "affirm", label: "Affirm" },
  { file: "klarna", label: "Klarna" },
];

export function PaymentIcons() {
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
      {METHODS.map((method) => (
        <li key={method.file}>
          <Image
            src={`/payments/${method.file}.svg`}
            alt={method.label}
            width={40}
            height={26}
            unoptimized
            className="h-6 w-auto"
          />
        </li>
      ))}
    </ul>
  );
}
