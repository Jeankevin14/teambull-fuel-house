/** What our forms get back from a server action. */
export type FormState = {
  ok: boolean;
  error?: string;
  message?: string;
  id?: number; // id of the product that was just saved
  fields?: Record<string, string>; // what the person typed (never the password)
};
