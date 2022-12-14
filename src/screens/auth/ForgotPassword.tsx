import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, ScrollView, TouchableOpacity, View } from 'react-native';
import { supabase } from '@app/api/initSupabase';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Input, Button } from '@rneui/themed';
import * as Linking from 'expo-linking';
import { i18n } from '@app/localization/i18n';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import { FontText } from '@app/components/utils/FontText';
import { logErrorsWithMessage } from '@app/utils/errors';

export default function ({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'ForgetPassword'>) {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  async function forget() {
    setLoading(true);
    // rethink the whole logic, because it does not mean the person will open the email from their phone
    const redirectTo = Linking.createURL('');
    // TODO handle password input
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (!error) {
      setLoading(false);
      alert(i18n.t('forgot_password.email_sent'));
    }
    if (error) {
      setLoading(false);
      logErrorsWithMessage(error, error.message);
    }
  }

  return (
    <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} enabled style={{ flex: 1 }}>
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <Image
            resizeMode="contain"
            style={{
              height: 220,
              width: 220,
            }}
            source={require('../../../assets/images/forget.png')}
          />
        </View>
        <View
          style={{
            flex: 3,
            paddingHorizontal: 20,
            backgroundColor: 'white',
          }}
        >
          <FontText
            style={{
              alignSelf: 'flex-start',
              marginBottom: 10,
              fontWeight: 'bold',
            }}
            h3
          >
            {i18n.t('forgot_password.title')}
          </FontText>
          <Input
            containerStyle={{ marginTop: 15 }}
            placeholder={i18n.t('email_placeholder')}
            value={email}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={(text) => setEmail(text)}
          />
          <Button
            title={loading ? i18n.t('loading') : i18n.t('forgot_password.button.default')}
            onPress={() => {
              void forget();
            }}
            disabled={loading}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 15,
              justifyContent: 'center',
            }}
          >
            <FontText>{i18n.t('register.login.pretext')}</FontText>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Login');
              }}
            >
              <FontText
                style={{
                  marginLeft: 5,
                  fontWeight: 'bold',
                }}
              >
                {i18n.t('register.login.link')}
              </FontText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
