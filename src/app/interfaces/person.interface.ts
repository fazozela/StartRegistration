export interface Person {
  id: string;
  fullname: string;  // Only this is required
  age?: number;      // Optional
  tutorname?: string; // Optional
  phone?: string | null; // Optional
  selected?: boolean;
}