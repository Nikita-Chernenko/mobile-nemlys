import React from 'react';
import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation';
import { AuthProvider } from './src/provider/AuthProvider';

import * as Localization from 'expo-localization';
import { i18n } from '@app/localization/i18n';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@app/theme';
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

i18n.locale = Localization.locale;
