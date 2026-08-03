import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import { db } from './firebase';
import { Student, Activity } from '../types';

const STUDENTS_COLLECTION = 'students';
const ACTIVITIES_COLLECTION = 'activities';

/**
 * Subscribe to real-time student updates from Firestore globally.
 */
export function subscribeToStudents(
  onUpdate: (students: Student[]) => void,
  initialSeedStudents: Student[]
) {
  const colRef = collection(db, STUDENTS_COLLECTION);
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      console.log('Firestore students collection is empty. Seeding initial data...');
      try {
        const batch = writeBatch(db);
        initialSeedStudents.forEach(student => {
          const docRef = doc(db, STUDENTS_COLLECTION, student.id);
          batch.set(docRef, student);
        });
        await batch.commit();
      } catch (err) {
        console.error('Error seeding initial students to Firestore:', err);
      }
    } else {
      const studentsList: Student[] = snapshot.docs.map(docSnap => docSnap.data() as Student);
      
      // Ensure any missing seed students are automatically synced into Firestore
      const existingIds = new Set(studentsList.map(s => s.id));
      const missingSeedStudents = initialSeedStudents.filter(s => !existingIds.has(s.id));

      if (missingSeedStudents.length > 0) {
        console.log(`Adding ${missingSeedStudents.length} missing dummy seed students to Firestore...`);
        try {
          const batch = writeBatch(db);
          missingSeedStudents.forEach(student => {
            const docRef = doc(db, STUDENTS_COLLECTION, student.id);
            batch.set(docRef, student);
          });
          await batch.commit();
        } catch (err) {
          console.error('Error writing missing seed students to Firestore:', err);
        }
      }

      studentsList.sort((a, b) => b.submissionTimestamp - a.submissionTimestamp);
      onUpdate(studentsList);
    }
  }, (err) => {
    console.warn('Firestore subscription error for students:', err);
  });
}

/**
 * Subscribe to real-time activity config updates from Firestore globally.
 */
export function subscribeToActivities(
  onUpdate: (activities: Activity[]) => void,
  initialSeedActivities: Activity[]
) {
  const colRef = collection(db, ACTIVITIES_COLLECTION);
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      console.log('Firestore activities collection is empty. Seeding initial rules...');
      try {
        const batch = writeBatch(db);
        initialSeedActivities.forEach(act => {
          const docRef = doc(db, ACTIVITIES_COLLECTION, act.id);
          batch.set(docRef, act);
        });
        await batch.commit();
      } catch (err) {
        console.error('Error seeding initial activities to Firestore:', err);
      }
    } else {
      const activitiesList: Activity[] = snapshot.docs.map(docSnap => docSnap.data() as Activity);
      onUpdate(activitiesList);
    }
  }, (err) => {
    console.warn('Firestore subscription error for activities:', err);
  });
}

/**
 * Save or update a student in Firestore
 */
export async function saveStudentDoc(student: Student) {
  try {
    const docRef = doc(db, STUDENTS_COLLECTION, student.id);
    await setDoc(docRef, student, { merge: true });
  } catch (err) {
    console.error('Failed to save student doc to Firestore:', err);
  }
}

/**
 * Delete a student from Firestore
 */
export async function deleteStudentDoc(studentId: string) {
  try {
    const docRef = doc(db, STUDENTS_COLLECTION, studentId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Failed to delete student doc from Firestore:', err);
  }
}

/**
 * Save or update an activity rule in Firestore
 */
export async function saveActivityDoc(activity: Activity) {
  try {
    const docRef = doc(db, ACTIVITIES_COLLECTION, activity.id);
    await setDoc(docRef, activity, { merge: true });
  } catch (err) {
    console.error('Failed to save activity doc to Firestore:', err);
  }
}
