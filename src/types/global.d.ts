// Global type declarations
import { UserActivityService } from '@/services/userActivityService';

// Extend Window interface to include our guest session timer and services
interface Window {
  guestSessionTimer: number | null;
  userActivityService?: UserActivityService;
}
