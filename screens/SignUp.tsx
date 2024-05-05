import { StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
// Libraries
import { Formik } from 'formik'
import * as yup from 'yup'
// Utils
import colors from '../assets/colors'
import { Pressable } from 'react-native'
// Firebase functions
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase/firebase'
import { DrawerNavigationProp } from '@react-navigation/drawer'

type HomeProps = {
    Home: {fromSignUp:boolean} | undefined
}
export default function SignUp() {
    
    const navigation = useNavigation<DrawerNavigationProp<HomeProps>>()
    useEffect(() => {
        auth.onAuthStateChanged(() => {
            if(auth.currentUser){
                navigation.navigate('Home')
            }
        })
    }, [])
    
    const [creationInProgress, setCreationInProgress] = useState<boolean>(false)

    const signUpSchema = yup.object().shape({
        username:yup.string().min(4, "Username must be at least 4 characters long"),
        email:yup.string().email("Please enter an email"),
        password:yup.string().min(6, "Password must be at least 6 characters long"),
    })

    const createAccount = async (username:string, email:string, password:string) => {
        const result = signUpSchema.isValidSync({username, email, password})
        if(result){
            setCreationInProgress(true)
            const newUser = (await createUserWithEmailAndPassword(auth, email, password)).user
            await updateProfile(newUser, {displayName:username})
            navigation.navigate('Home', {fromSignUp:true})
        }
    }

  return (
    <View style={styles.signUpWrapper}>
        <Text style={styles.headingText}>Welcome!</Text>
        <Text style={styles.subHeadingText}>Sign up for an account by filling the form below</Text>
    <Formik
     initialValues={{ username:'', email: '', password:'', }}
     validationSchema={signUpSchema}
     onSubmit={values => createAccount(values.username, values.email, values.password)}
    >
     {({ handleChange, handleBlur, handleSubmit, errors, values }) => (
       <View>
        {/* Username */}
         <TextInput
           onChangeText={handleChange('username')}
           onBlur={handleBlur('username')}
           value={values.username}
           placeholder='Username'
           style={styles.inputs}
           placeholderTextColor='white'
         />
         {errors.username && (<Text style={styles.error}>{errors.username}</Text>)}
         {/* Email */}
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

         {/* Password */}
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
         {errors.password && (<Text style={styles.error}>{errors.password}</Text>)}
         <Pressable onPress={() => handleSubmit()} style={[styles.signUpBtn, creationInProgress ? styles.disabledBtn : {}]} disabled={creationInProgress}><Text style={styles.signUpBtnText}>{creationInProgress ? 'Creating account' : 'Sign Up'}</Text></Pressable>
       </View>
     )}
   </Formik>
        {/* <Pressable onPress={() => navigation.navigate('Home')}><Text>Navigate to home</Text></Pressable> */}
    </View>
  )
}

const styles = StyleSheet.create({
    signUpWrapper:{
        flex:1,
        backgroundColor:colors.black
    },
    headingText:{
        fontSize:32,
        textAlign:'center',
        marginVertical:15,
        color:'white'
    },
    subHeadingText:{
        color:'white',
        textAlign:'center',
        marginBottom:20,
        fontSize:15
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
        marginLeft:15
    },
    signUpBtn:{
        marginTop:50,
        alignSelf:'center',
        backgroundColor:'#12B0E8',
        paddingVertical: 10,
        paddingHorizontal:40,
        borderRadius:8
    },
    signUpBtnText:{
        color:'white',
        fontSize:20,
        fontWeight:"500"
    },
    disabledBtn:{
        opacity:.5
    }
})