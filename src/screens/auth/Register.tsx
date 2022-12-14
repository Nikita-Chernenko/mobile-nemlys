import React, { useContext, useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, TouchableOpacity, View } from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, useTheme } from '@rneui/themed';
import { OAuth } from '@app/components/auth/OAuth';
import { i18n } from '@app/localization/i18n';
import { supabase } from '@app/api/initSupabase';
import {
  APICouple,
  InsertAPICouple,
  InsertAPIUserOnboardingAnswer,
  InsertAPIUserProfile,
  SupabaseAnswer,
  SupabaseUser,
} from '@app/types/api';
import { randomReadnableString } from '@app/utils/strings';
import OnboardingResults from './OnboardingResults';
import { AuthContext } from '@app/provider/AuthProvider';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import { FontText } from '@app/components/utils/FontText';
import { logErrors, logErrorsWithMessage } from '@app/utils/errors';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'Register'>) {
  const { theme } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordAgain, setPasswordAgain] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [continueWithEmail, setContinueWithEmail] = useState<boolean>(false);
  const disabled = loading || !email || !password || password !== passwordAgain;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const passwordRef = useRef(null) as any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const passwordAgainRef = useRef(null) as any;
  const auth = useContext(AuthContext);
  const passwordsAreNotTheSame = password && passwordAgain && password != passwordAgain;
  async function register() {
    setLoading(true);
    try {
      const data = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      setLoading(false);
      if (data.error) {
        logErrorsWithMessage(data.error, data.error.message);
        return;
      } else if (!data.data.user) {
        logErrors(new Error('Not user after signUp call'));
        return;
      } else {
        await handleUserAfterSignUp(data.data.user, false);
        auth.setIsSignedIn?.(true);
      }
    } catch (e: unknown) {
      await supabase.auth.signOut();
      throw e;
    }
  }
  async function handleUserAfterSignUp(user: SupabaseUser, exists: boolean): Promise<void> {
    if (exists) {
      // TODO, maybe update user answers here
      console.log(`User ${user.email || 'with this email'} already exists, just signing in`);
    } else {
      const couple: InsertAPICouple = {
        invitation_code: randomReadnableString(6),
      };
      const { data, error }: SupabaseAnswer<APICouple> = await supabase
        .from('couple')
        .insert(couple)
        .select()
        .single();
      if (error) {
        throw error;
      }
      const userProfile: InsertAPIUserProfile = {
        couple_id: data.id,
        user_id: user.id,
        first_name: route.params.name,
        onboarding_finished: true,
        ios_expo_token: undefined,
        android_expo_token: undefined,
      };
      const { error: profileError } = await supabase.from('user_profile').insert(userProfile);
      if (profileError) {
        throw profileError;
      }

      const answers: InsertAPIUserOnboardingAnswer[] = route.params.userAnswers.map((a) => ({
        user_id: user.id,
        onboarding_answer_id: a.answer.id,
      }));

      const { error: onboaringError } = await supabase
        .from('user_onboarding_answer')
        .insert(answers);
      if (onboaringError) {
        throw onboaringError;
      }
    }
  }
  return (
    <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} style={{ flexGrow: 1 }}>
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: 'white',
          paddingVertical: 25,
          paddingHorizontal: 15,
        }}
      >
        <OnboardingResults userAnswers={route.params.userAnswers}></OnboardingResults>
        <View style={{ flexGrow: 1 }}>
          <FontText
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
            }}
            h3
          >
            {i18n.t('register.title')}
          </FontText>
          {continueWithEmail ? (
            <View>
              <Input
                containerStyle={{ marginTop: 10, paddingHorizontal: 0 }}
                placeholder={i18n.t('email_placeholder')}
                value={email}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef?.current?.focus()}
                onChangeText={(text) => setEmail(text)}
              />
              {passwordsAreNotTheSame && (
                <FontText style={{ color: theme.colors.grey3 }}>
                  {i18n.t('register.passwords_are_not_the_same')}
                </FontText>
              )}
              <Input
                containerStyle={{ paddingHorizontal: 0 }}
                placeholder={i18n.t('password_placeholder')}
                value={password}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry={true}
                returnKeyType="next"
                ref={passwordRef}
                onSubmitEditing={() => passwordAgainRef?.current?.focus()}
                onChangeText={(text) => setPassword(text)}
              />
              <Input
                containerStyle={{ paddingHorizontal: 0 }}
                placeholder={i18n.t('password_again_placeholder')}
                value={passwordAgain}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry={true}
                returnKeyType="done"
                ref={passwordAgainRef}
                onChangeText={(text) => setPasswordAgain(text)}
              />
              <Button
                title={loading ? i18n.t('loading') : i18n.t('register.register_button.default')}
                onPress={() => {
                  void register();
                }}
                disabled={disabled}
              />
            </View>
          ) : (
            <Button
              style={{ marginTop: '3%' }}
              title={loading ? i18n.t('loading') : i18n.t('register.continue_with_email.default')}
              onPress={() => {
                setContinueWithEmail(true);
              }}
            />
          )}
          <FontText
            style={{
              marginTop: 20,
              color: theme.colors.grey3,
              textAlign: 'center',
            }}
          >
            {i18n.t('or')}
          </FontText>
          <OAuth handleUser={handleUserAfterSignUp} />

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
