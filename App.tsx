import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { DrawerItem, createDrawerNavigator } from '@react-navigation/drawer'
import { NavigationContainer } from '@react-navigation/native'
// Utils
import colors from './assets/colors'
// Screens
import Home from './screens/Home'
import Profile from './screens/Profile'
import UserPosts from './screens/UserPosts'
import CreatePost from './screens/CreatePost'
import SignIn from './screens/SignIn'
import SignUp from './screens/SignUp'
// Firebase
import { auth } from './firebase/firebase'

function DrawerContent({navigation} : any){

  return (
    <View style={styles.customDrawer}>
      <Text style={styles.drawerHeadingText}>Blog App</Text>
      <View style={styles.drawerContent}>
       <DrawerItem label="Home" style={styles.drawerBtns} labelStyle={styles.drawerBtnsText} onPress={() => navigation.navigate('Home')}/>
       {auth.currentUser && <DrawerItem label="Create Post" style={styles.drawerBtns} labelStyle={styles.drawerBtnsText} onPress={() => navigation.navigate('CreatePost')}/>}
       {auth.currentUser && <DrawerItem label="View Profile" style={styles.drawerBtns} labelStyle={styles.drawerBtnsText} onPress={() => navigation.navigate('MyProfile')}/>}
       {auth.currentUser && <DrawerItem label="My posts" style={styles.drawerBtns} labelStyle={styles.drawerBtnsText} onPress={() => navigation.navigate('MyPosts')}/>}
      </View>

      {!auth.currentUser  &&
      <View style={styles.authBtnsWrapper}>
        <DrawerItem label="Sign in" onPress={() => navigation.navigate('SignIn')} style={[styles.drawerBtns, styles.authBtns]} labelStyle={styles.authBtnsText} />
        <DrawerItem label="Sign up" onPress={() => navigation.navigate('SignUp')} style={[styles.drawerBtns, styles.authBtns]} labelStyle={styles.authBtnsText} />
      </View>}

      {auth.currentUser && 
        
        <View style={styles.emailWrapper}>
          <Text style={styles.email}>{auth.currentUser?.email}</Text>
          <Pressable style={styles.signOutBtn}><Text style={styles.signOutBtnText}>Sign out</Text></Pressable>
        </View>}
    </View>
  )
}

export type componentProps = {
  Home:{fromSignUp: boolean, fromCreatePost:boolean} | undefined;
  CreatePost:undefined;
  MyProfile:undefined;
  MyPosts:undefined;
  SignUp:undefined;
  SignIn:undefined
}

const Drawer = createDrawerNavigator<componentProps>()

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="MyProfile" screenOptions={{
        drawerStyle:{
          backgroundColor:colors.gray,
          borderRightColor:'white',
          borderRightWidth:1,
          width:'80%'
        },
        headerTitleStyle:{
          color:'white'
        },
        headerStyle:{
          backgroundColor:colors.gray,
          borderBottomColor:'white',
          borderBottomWidth:1
        },
        headerTintColor:'white'
      }} drawerContent={props => <DrawerContent {...props}/>} >

        <Drawer.Screen name="Home" component={Home} options={{unmountOnBlur:true}}/>
        <Drawer.Screen name="CreatePost" component={CreatePost} options={{title:"Create Post", unmountOnBlur:true}}/>
        <Drawer.Screen name="MyProfile" component={Profile} options={{title:"My Profile", unmountOnBlur:true}}/>
        <Drawer.Screen name="MyPosts" component={UserPosts} options={{title:"My Posts", unmountOnBlur:true}}/>
        <Drawer.Screen name="SignUp" component={SignUp} options={{title:"Sign Up"}}/>
        <Drawer.Screen name="SignIn" component={SignIn} options={{title:"Sign In"}}/>
      </Drawer.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  customDrawer:{
    flex:1,
    justifyContent:'space-between'
  },
  drawerHeadingText:{
    fontSize:30,
    textAlign:'center',
  },
  drawerContent:{
  },
  drawerBtns:{
    width:'100%',
    marginVertical:5,
    borderTopColor:'white',
    borderTopWidth:1,
    borderBottomColor:'white',
    borderBottomWidth:1,
    borderRadius:0,
    marginLeft:0
  },
  drawerBtnsText:{
    fontSize:18,
    textAlign:'center',
    color:'white',
    paddingVertical:8,
  },
  authBtnsWrapper:{
    flexDirection:'row',
    justifyContent:'space-between'
  },
  authBtns:{
    width:'30%',
    borderColor:'white',
    borderWidth:1,
    marginLeft:10,
  },
  authBtnsText:{
    width:'190%',
    color:'white',
    textAlign:'center',
  },
  emailWrapper:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:"center",
    marginBottom:5
  },
  email:{
    fontSize:15,
    marginLeft:5
  },
  signOutBtn:{
    marginRight:5,
    paddingVertical:5,
    paddingHorizontal:10,
    borderColor:'white',
    borderWidth:1
  },
  signOutBtnText:{
    fontSize:18,
  }
})