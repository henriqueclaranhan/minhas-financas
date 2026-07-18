import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../services/AuthService';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  getAuth: vi.fn(() => ({}))
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call signInWithEmailAndPassword for login', async () => {
    (signInWithEmailAndPassword as any).mockResolvedValue({ user: { uid: '123' } });
    await AuthService.login('test@test.com', '123456');
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
  });

  it('should call multiple auth functions for signup', async () => {
    const mockUser = { uid: '123' };
    (createUserWithEmailAndPassword as any).mockResolvedValue({ user: mockUser });
    
    await AuthService.signup('test@test.com', '123456', 'Test Name');
    
    expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Test Name' });
    expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
  });

  it('should call sendPasswordResetEmail for resetPassword', async () => {
    await AuthService.resetPassword('test@test.com');
    expect(sendPasswordResetEmail).toHaveBeenCalled();
  });
});
