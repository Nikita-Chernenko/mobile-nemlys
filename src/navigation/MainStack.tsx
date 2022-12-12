import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SetHomeScreen from '@app/screens/sets/SetHomeScreen';
import SetItemDetails from '@app/screens/sets/SetItemDetails';
import SetReminder from '@app/screens/sets/SetReminder';

const MainStack = createNativeStackNavigator();
const Main = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen name="SetHomeScreen" component={SetHomeScreen} />
      <MainStack.Screen name="SetItemDetails" component={SetItemDetails} />
      <MainStack.Screen name="SetReminder" component={SetReminder} />
    </MainStack.Navigator>
  );
};

export default Main;
