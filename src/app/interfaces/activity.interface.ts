import { Person } from "./person.interface";

export interface Activity {
  id?: string;
  activityName: string;
  activityDate: string;
  participants: Person[];
}