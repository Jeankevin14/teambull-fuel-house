// ============================================================
//  THE PEOPLE BEHIND TEAM BULL — used by the About page and
//  by the launch experience, so both always say the same thing.
// ============================================================

export type Person = {
  name: string;
  role: string;
  photo: string;
  blurb: string;
  hello: string;
  /** their own WhatsApp, digits only with country code; the shop's is used when absent */
  whatsapp?: string;
};

export const PEOPLE: Person[] = [
  {
    name: "Vishwam D",
    role: "Founder",
    photo: "/images/vishwam.jpg",
    blurb: "The founder behind TeamBull, building people, athletes and a brand.",
    hello: "Hi Vishwam! I found Team Bull Fuel House online and would like to talk.",
  },
  {
    name: "Praveen S",
    role: "Co-founder",
    photo: "/images/praveen.jpg",
    blurb: "Co-founder of TeamBull, turning the vision into a working business.",
    hello: "Hi Praveen! I found Team Bull Fuel House online and would like to talk.",
    whatsapp: "916383208113",
  },
];
