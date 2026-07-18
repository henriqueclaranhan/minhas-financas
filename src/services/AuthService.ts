import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';

export class AuthService {
  static async login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  static async signup(email: string, password: string, name: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await sendEmailVerification(cred.user);
    return cred;
  }

  static async resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }
}
