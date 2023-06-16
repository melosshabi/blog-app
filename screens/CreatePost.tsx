import { Dimensions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
// colors
import colors from '../assets/colors'
// Form validation
import { Formik } from 'formik'
import * as yup from 'yup'
// Firebase
import {addDoc, collection, serverTimestamp} from 'firebase/firestore'
import { auth, db } from '../firebase/firebase'
import { DrawerNavigationProp } from '@react-navigation/drawer'

type HomeProps = {
  Home: {fromSignUp:boolean, fromCreatePost:boolean} | undefined
}

export default function CreatePost() {

  const navigation = useNavigation<DrawerNavigationProp<HomeProps>>()

  useEffect(() => {
    auth.onAuthStateChanged(() => {
      if(auth.currentUser === null) navigation.navigate('Home', {fromSignUp:false, fromCreatePost:false})
    })
  },[])

  const [deviceHeight] = useState(Dimensions.get('window').height)
  const [creationInProgress, setCreationInProgress] = useState<boolean>(false)

  const blogSchema = yup.object().shape({
    title:yup.string().min(2, "Title must be at least 2 characters long"),
    blog:yup.string().min(2, "Blog must be at least 2 characters long")
  })

  async function createPost(title:string, blog:String){
    if(auth.currentUser !== null){
    setCreationInProgress(true)
    const postsCollection = collection(db, 'posts')
    await addDoc(postsCollection, {
      authorDetails:{
        authorEmail:auth.currentUser.email,
        authorName:auth.currentUser.displayName,
        authorProfilePicture:auth.currentUser.photoURL,
        id:auth.currentUser.uid
      },
      title,
      blog,
      picture:'',
      pictureName:'',
      video:'',
      videoName:'',
      createdAt:serverTimestamp(),
      lastUpdatedAt:serverTimestamp()
    })
    setCreationInProgress(false)
    navigation.navigate('Home', {fromSignUp:false, fromCreatePost:true})
  }}

  return (
    <View style={styles.createPost}>
      <Formik
     initialValues={{title: '', blog:'', }}
     validationSchema={blogSchema}
     onSubmit={values => createPost(values.title, values.blog)}
    >
     {({ handleChange, handleBlur, handleSubmit, errors, values }) => (
       <View>
         {/* Title */}
         <View style={styles.inputWrapper}>
          <TextInput
            onChangeText={handleChange('title')}
            onBlur={handleBlur('title')}
            value={values.title}
            placeholder='Blog Title'
            style={styles.inputs}
            autoCapitalize='none'
          />
         
         {errors.title && (<Text style={styles.error}>{errors.title}</Text>)}
         </View>
         {/* Blog */}
         <View style={styles.inputWrapper}>
           <TextInput
            onChangeText={handleChange('blog')}
            onBlur={handleBlur('blog')}
            value={values.blog}
            placeholder='Blog'
            style={[styles.inputs, {height:deviceHeight / 4, textAlignVertical:'top'}]}
            autoCapitalize='none'
          />
          {errors.blog && (<Text style={styles.error}>{errors.blog}</Text>)}
         </View>
         
         <Pressable onPress={handleSubmit} style={[styles.createPostBtn, creationInProgress ? styles.disabledBtn : {}]} disabled={creationInProgress}><Text style={styles.createBtnText}>{creationInProgress ? 'Creating Blog' : 'Create Blog'}</Text></Pressable>
       </View>
     )}
   </Formik>
    </View>
  )
}

const styles = StyleSheet.create({
  createPost:{
    flex:1,
    backgroundColor:colors.black,
  },
  error:{
    color:'#b4161b',
    marginLeft:25,
    marginTop:8
  },
  inputWrapper:{
    marginVertical:20,
  },
  inputs:{
    width:'90%',
    paddingHorizontal:10,
    borderColor:'white',
    borderWidth:1,
    borderRadius:8,
    marginLeft:'5%',
  },
  blogInput:{
  },
  createPostBtn:{
    marginTop:50,
    alignSelf:'center',
    backgroundColor:'#12B0E8',
    paddingVertical: 10,
    paddingHorizontal:60,
    borderRadius:8
  },
  createBtnText:{
    color:'white',
    fontSize:20,
    fontWeight:"500"
  },
  disabledBtn:{
    opacity:.5
}
})