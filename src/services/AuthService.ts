import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  verifyBeforeUpdateEmail,
  updatePassword,
  type User
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

  static async updateDisplayName(user: User, name: string): Promise<void> {
    await updateProfile(user, { displayName: name });
  }

  /**
   * Sends a verification email to the new address.
   * The change only takes effect after the user clicks the link in the new email.
   */
  static async updateEmail(user: User, newEmail: string): Promise<void> {
    await verifyBeforeUpdateEmail(user, newEmail);
  }

  static async updatePassword(user: User, newPassword: string): Promise<void> {
    await updatePassword(user, newPassword);
  }
}
