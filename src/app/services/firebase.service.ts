import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Person } from '../interfaces/person.interface';
import { Activity } from '../interfaces/activity.interface';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private readonly COLLECTION_NAME = 'activities';

  constructor(private firestore: Firestore) { }

  async addActivity(activity: Activity): Promise<string> {
    try {
      const docRef = await addDoc(
        collection(this.firestore, this.COLLECTION_NAME),
        this.sanitizeActivity(activity)
      );
      return docRef.id;
    } catch (e) {
      console.error("Error adding activity: ", e);
      throw new Error(`Failed to add activity: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  async getActivities(): Promise<Activity[]> {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, this.COLLECTION_NAME));
      return querySnapshot.docs.map(doc => this.mapDocumentToActivity(doc));
    } catch (e) {
      console.error("Error fetching activities: ", e);
      throw new Error(`Failed to fetch activities: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  async deleteActivity(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, this.COLLECTION_NAME, id));
    } catch (e) {
      console.error("Error deleting activity: ", e);
      throw new Error(`Failed to delete activity: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  async updateActivity(id: string, data: Partial<Activity>): Promise<void> {
    try {
      const sanitizedData = this.sanitizeActivity(data);
      await updateDoc(doc(this.firestore, this.COLLECTION_NAME, id), sanitizedData);
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