import { AppItem, AppReview, AppCategory } from '../types';

export const APP_CATEGORIES: { name: AppCategory; icon: string; description: string; count: number }[] = [
  { name: 'Transportation', icon: 'Car', description: 'Rides, delivery, navigation & fleet tracking', count: 0 },
  { name: 'Business', icon: 'Briefcase', description: 'Invoicing, POS, inventory & teamwork', count: 0 },
  { name: 'Education', icon: 'GraduationCap', description: 'Learning, coding, courses & study tools', count: 0 },
  { name: 'Entertainment', icon: 'Film', description: 'Streaming, audio, podcasts & video creators', count: 0 },
  { name: 'Games', icon: 'Gamepad2', description: 'Arcade, action, strategy & mobile simulations', count: 0 },
  { name: 'Travel', icon: 'Plane', description: 'Flight booking, hotel discovery & local guides', count: 0 },
  { name: 'Productivity', icon: 'CheckCircle2', description: 'Notes, office docs, organizers & time trackers', count: 0 },
  { name: 'Social', icon: 'MessageCircle', description: 'Chat, community feeds, voice & video rooms', count: 0 },
  { name: 'Other', icon: 'Boxes', description: 'Utility tools, file managers & custom APKs', count: 0 },
];

export const AVAILABLE_PERMISSIONS: { id: string; name: string; description: string; risk: 'low' | 'medium' | 'high' }[] = [
  { id: 'INTERNET', name: 'Full Network Access', description: 'Allows the app to create network sockets and use custom network protocols.', risk: 'low' },
  { id: 'ACCESS_NETWORK_STATE', name: 'View Network Connections', description: 'Allows the app to view information about network connections such as which networks exist and are connected.', risk: 'low' },
  { id: 'ACCESS_FINE_LOCATION', name: 'Precise GPS Location', description: 'Access precise location sources such as GPS on the device when in use.', risk: 'high' },
  { id: 'ACCESS_COARSE_LOCATION', name: 'Approximate Location', description: 'Access approximate location derived from network location sources like cell towers and Wi-Fi.', risk: 'medium' },
  { id: 'CAMERA', name: 'Take Pictures and Videos', description: 'Allows the app to take pictures and videos with the camera.', risk: 'high' },
  { id: 'RECORD_AUDIO', name: 'Record Audio / Microphone', description: 'Allows the app to record audio with the microphone.', risk: 'high' },
  { id: 'READ_EXTERNAL_STORAGE', name: 'Read Storage', description: 'Allows the app to read from internal and SD card storage.', risk: 'medium' },
  { id: 'WRITE_EXTERNAL_STORAGE', name: 'Write / Modify Storage', description: 'Allows the app to write to internal and SD card storage.', risk: 'high' },
  { id: 'BLUETOOTH', name: 'Bluetooth Connectivity', description: 'Allows the app to connect to paired Bluetooth devices and peripherals.', risk: 'medium' },
  { id: 'BLUETOOTH_CONNECT', name: 'Bluetooth Connect', description: 'Required to connect to Bluetooth devices on Android 12 and above.', risk: 'medium' },
  { id: 'POST_NOTIFICATIONS', name: 'Post Notifications', description: 'Allows the app to post push notifications on Android 13 and above.', risk: 'low' },
  { id: 'VIBRATE', name: 'Control Vibration', description: 'Allows the app to control the vibrator motor for tactile haptics.', risk: 'low' },
  { id: 'WAKE_LOCK', name: 'Prevent Phone from Sleeping', description: 'Allows the app to prevent the processor from sleeping or screen from dimming.', risk: 'low' },
];

// Clean empty catalogs - all mock, fake, and demo apps and reviews removed.
// Real applications are managed via Supabase database or the Admin Console.
export const INITIAL_APPS: AppItem[] = [];
export const INITIAL_REVIEWS: AppReview[] = [];
