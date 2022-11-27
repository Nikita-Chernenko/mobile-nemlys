import React, { useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Text } from '@rneui/themed';
import { GoogleOAuth } from '@app/components/auth/GoogleOAuth';
import { i18n } from '@app/localization/i18n';
import { supabase } from '@app/api/initSupabase';
import { APICouple, InsertAPICouple, InsertAPIUserProfile, SupabaseUser } from '@app/types/api';
import { randomReadnableString } from '@app/utils/strings';
import { PostgrestError } from '@supabase/supabase-js';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'Register'>) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const passwordRef = useRef(null) as any;

  async function register() {
    setLoading(true);
    const data = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    setLoading(false);
    if (!data.error && data?.data.user?.confirmation_sent_at) {
      alert(i18n.t('register.check_email_for_confirmation'));
    } else {
      alert(data.error?.message ?? i18n.t('register.unexpected_error'));
    }
  }
  async function handleUserAfterSignUp(user: SupabaseUser, exists: boolean): Promise<void> {
    if (exists) {
      // TODO, maybe update user answers here
      console.log(`User ${user.email} already exists, just sign in`);
    } else {
      const couple: InsertAPICouple = {
        invitation_code: randomReadnableString(6),
      };
      const { data, error }: { data: APICouple; error: PostgrestError } = await supabase
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
      };
      const { data: profileData, error: profileError } = await supabase
        .from('user_profile')
        .insert(userProfile)
        .select()
        .single();
      if (profileError) {
        throw profileError;
      }
      console.log(profileData);
    }
  }
  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <ScrollView
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
            source={require('../../../assets/images/register.png') as ImageSourcePropType}
          />
        </View>
        <View
          style={{
            flex: 3,
            paddingHorizontal: 20,
            paddingBottom: 20,
            backgroundColor: 'white',
          }}
        >
          <Text
            style={{
              alignSelf: 'flex-start',
              marginBottom: 10,
              fontWeight: 'bold',
            }}
            h3
          >
            {i18n.t('register.title')}
          </Text>
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
            onSubmitEditing={() => void register()}
            onChangeText={(text) => setPassword(text)}
          />
          <Button
            title={loading ? i18n.t('loading') : i18n.t('register.button.default')}
            onPress={() => {
              void register();
            }}
            disabled={loading}
          />
          <GoogleOAuth preHandleUser={undefined} postHandleUser={handleUserAfterSignUp} />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 15,
              justifyContent: 'center',
            }}
          >
            <Text>{i18n.t('register.login.pretext')}</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Login');
              }}
            >
              <Text
                style={{
                  marginLeft: 5,
                  fontWeight: 'bold',
                }}
              >
                {i18n.t('register.login.link')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
