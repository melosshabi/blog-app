import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
// Form validation
import { Formik } from 'formik'
import * as yup from 'yup';
// Colors
import colors from '../assets/colors'
// Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import {auth} from '../firebase/firebase'
import { DrawerNavigationProp } from '@react-navigation/drawer';

type HomeProps = {
  Home: {fromSignUp:boolean} | undefined
}

export default function SignIn() {

  const navigation = useNavigation<DrawerNavigationProp<HomeProps>>()
  
  useEffect(() => {
    auth.onAuthStateChanged(() => {
      if(auth.currentUser) navigation.navigate('Home')
    })
  }, [])

  
  const [signInProgress, setSignInProgress] = useState<boolean>(false)
  const [emailError, setEmailError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')

  const signInSchema = yup.object().shape({
    email:yup.string().email("Please enter an email"),
  })

  const signIn = async (email:string, password:string) => {
    const result = signInSchema.isValidSync({email})
    if(result){
      setSignInProgress(true)
      await signInWithEmailAndPassword(auth, email, password)
      .then(() => navigation.navigate('Home', {fromSignUp:false}))
      .catch(err => {
        switch(err.code){
          case 'auth/user-not-found':
            setEmailError('Account does not exist')
            setSignInProgress(false)
            setTimeout(() => setEmailError(''), 4000)
            break;
          case 'auth/wrong-password':
            setPasswordError('Incorrect password')
            setSignInProgress(false)
            setTimeout(() => setPasswordError(''), 4000)
            break;
        }
      })
    }
  }
  return (
    <View style={styles.signIn}>
      <Text style={styles.headingText}>Welcome back!</Text>
       <Formik
     initialValues={{email: '', password:'', }}
     validationSchema={signInSchema}
     onSubmit={values => signIn(values.email, values.password)}
    >
     {({ handleChange, handleBlur, handleSubmit, errors, values }) => (
       <View>
         {/* Email */}
         <View style={styles.inputWrapper}>
          <TextInput
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            value={values.email}
            placeholder='Email'
            style={styles.inputs}
            autoCapitalize='none'
            placeholderTextColor='white'
          />
         
         {errors.email && (<Text style={styles.error}>{errors.email}</Text>)}
         {emailError && (<Text style={styles.error}>{emailError}</Text>)}
         </View>
         {/* Password */}
         <View style={styles.inputWrapper}>
           <TextInput
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
            placeholder='Password'
            style={styles.inputs}
            secureTextEntry={true}
            autoCapitalize='none'
            placeholderTextColor='white'
          />
         </View>
         {passwordError && (<Text style={styles.error}>{passwordError}</Text>)}
         <Pressable onPress={() => handleSubmit()} style={[styles.signInBtn, signInProgress ? styles.disabledBtn : {}]} disabled={signInProgress}><Text style={styles.signInBtnText}>{signInProgress ? 'Signing in' : 'Sign In'}</Text></Pressable>
       </View>
     )}
   </Formik>
    </View>
  )
}

const styles = StyleSheet.create({
  signIn:{
    flex:1,
    backgroundColor:colors.gray
  },
  headingText:{
    fontSize:32,
    textAlign:'center',
    marginVertical:15,
    color:'white'
  },
  inputWrapper:{
    marginVertical:20,
  },
  inputs:{
      borderColor:'white',
      borderWidth:1,
      margin:5,
      borderRadius:8,
      paddingHorizontal:10,
      color:'white'
  },
  error:{
      color:'#b4161b',
      marginLeft:15,
  },
  signInBtn:{
      marginTop:50,
      alignSelf:'center',
      backgroundColor:'#12B0E8',
      paddingVertical: 10,
      paddingHorizontal:60,
      borderRadius:8
  },
  signInBtnText:{
      color:'white',
      fontSize:20,
      fontWeight:"500"
  },
  disabledBtn:{
      opacity:.5
  }
})