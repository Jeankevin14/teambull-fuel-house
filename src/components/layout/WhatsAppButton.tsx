import { buildChatUrl } from "@/lib/whatsapp";

export default function WhatsAppButton() {
  const url = buildChatUrl("Hi! I have a question about your supplements.");

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 rounded-full bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-600"
    >
      WhatsApp Us
    </a>
  );
}
