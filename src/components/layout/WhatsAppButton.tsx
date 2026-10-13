import { buildChatUrl } from "@/lib/whatsapp";

export default function WhatsAppButton() {
  const url = buildChatUrl("Hi Team Bull Fuel House! I want to buy supplements from your website. Can you help me to  place an order?");

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="wa-ping fixed bottom-5 right-5 z-50 rounded-full bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-600"
    >
      WhatsApp Us
    </a>
  );
}
