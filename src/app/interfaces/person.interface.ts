export interface Person {
  id: string;          // Changed from number to string to match Firestore ID format
  fullname: string;
  age: number;
  tutorname: string;
  phone: string | null;
  selected: boolean;
}