import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Person } from '../interfaces/person.interface';
import { Activity } from '../interfaces/activity.interface';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private readonly ACTIVITIES_COLLECTION = 'activities';
  private readonly PARTICIPANTS_COLLECTION = 'participants';

  constructor(private firestore: Firestore) { }

  async addParticipant(person: Person): Promise<string> {
    try {
      const docRef = await addDoc(
        collection(this.firestore, this.PARTICIPANTS_COLLECTION),
        this.sanitizePerson(person)
      );
      return docRef.id;
    } catch (e) {
      console.error("Error adding participant: ", e);
      throw new Error(`Failed to add participant: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  async getParticipants(): Promise<Person[]> {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, this.PARTICIPANTS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        selected: false
      }) as Person);
    } catch (e) {
      console.error("Error fetching participants: ", e);
      throw new Error(`Failed to fetch participants: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  private sanitizePerson(person: Person): any {
    return {
      fullname: person.fullname,
      age: person.age,
      tutorname: person.tutorname,
      phone: person.phone
      // Omit 'selected' and 'id' as they're handled separately
    };
  }

  async addActivity(activity: Activity): Promise<string> {
    try {
      // First, ensure all participants are in the participants collection
      const participantPromises = activity.participants.map(async participant => {
        if (!participant.id || participant.id.toString().length < 5) { // New participant
          const newId = await this.addParticipant(participant);
          return { ...participant, id: newId };
        }
        return participant;
      });

      const updatedParticipants = await Promise.all(participantPromises);

      // Then create the activity with the updated participant references
      const activityData = {
        activityName: activity.activityName,
        activityDate: activity.activityDate,
        participants: updatedParticipants.map(p => ({
          id: p.id,
          fullname: p.fullname,
          age: p.age,
          tutorname: p.tutorname,
          phone: p.phone
        }))
      };

      const docRef = await addDoc(
        collection(this.firestore, this.ACTIVITIES_COLLECTION),
        activityData
      );
      return docRef.id;
    } catch (e) {
      console.error("Error adding activity: ", e);
      throw new Error(`Failed to add activity: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  async getActivities(): Promise<Activity[]> {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, this.ACTIVITIES_COLLECTION));
      return querySnapshot.docs.map(doc => this.mapDocumentToActivity(doc));
    } catch (e) {
      console.error("Error fetching activities: ", e);
      throw new Error(`Failed to fetch activities: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  async deleteActivity(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, this.ACTIVITIES_COLLECTION, id));
    } catch (e) {
      console.error("Error deleting activity: ", e);
      throw new Error(`Failed to delete activity: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  async updateActivity(id: string, data: Partial<Activity>): Promise<void> {
    try {
      const sanitizedData = this.sanitizeActivity(data);
      await updateDoc(doc(this.firestore, this.ACTIVITIES_COLLECTION, id), sanitizedData);
    } catch (e) {
      console.error("Error updating activity: ", e);
      throw new Error(`Failed to update activity: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  private mapDocumentToActivity(doc: any): Activity {
    const data = doc.data();
    return {
      id: doc.id,
      activityName: data['activityName'] || '',
      activityDate: data['activityDate'] || '',
      participants: this.mapParticipants(data['participants'] || [])
    };
  }

  private mapParticipants(participants: any[]): Person[] {
    return participants.map(p => ({
      id: p.id,
      fullname: p.fullname || '',
      age: Number(p.age) || 0,
      tutorname: p.tutorname || '',
      phone: p.phone || null,
      selected: false
    }));
  }

  private sanitizeActivity(activity: Partial<Activity>): any {
    const sanitized: any = {};
    if (activity.activityName) sanitized.activityName = activity.activityName;
    if (activity.activityDate) sanitized.activityDate = activity.activityDate;
    if (activity.participants) sanitized.participants = activity.participants.map(p => ({
      id: p.id,
      fullname: p.fullname,
      age: p.age,
      tutorname: p.tutorname,
      phone: p.phone
      // Omit 'selected' as it's only for UI
    }));
    return sanitized;
  }
}