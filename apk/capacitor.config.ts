import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.whizpos.app',
  appName: 'WHIZ POS',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  }
};

export default config;
