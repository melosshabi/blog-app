import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import colors from '../assets/colors'
import { TextInput } from 'react-native-gesture-handler'
// Firebase
import {auth, db, storage} from '../firebase/firebase'
import { useNavigation } from '@react-navigation/native'
import { getDownloadURL, ref, updateMetadata, uploadBytes, uploadString } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { DrawerNavigationProp } from '@react-navigation/drawer'
import * as ImagePicker from 'react-native-image-picker'

type HomeProps = {
  Home: {fromSignUp:boolean, fromCreatePost:boolean} | undefined
}

export default function Profile() {
  

  const navigation = useNavigation<DrawerNavigationProp<HomeProps>>()

  const [currentName, setCurrentName] = useState<string | null>('')
  const [currentEmail, setCurrentEmail] = useState<string | null>('')
  const [userWantsToEditName, setUserWantsToEditName] = useState<boolean>(false)
  const [userWantsToEditEmail, setUserWantsToEditEmail] = useState<boolean>(false)
  const [userIcon] = useState(require('../assets/images/user.png'))
  
  useEffect(() => {
    auth.onAuthStateChanged(() => {
      if(auth.currentUser === null) navigation.navigate('Home', {fromSignUp:false, fromCreatePost:false})
      else if(auth.currentUser !== null) {
        const name = auth.currentUser.displayName
        const email = auth.currentUser.email
        setCurrentName(name)
        setCurrentEmail(email)
      }
    })
  }, [])

  // This variable is used for the MIME types and the file name
  const [image, setImage] = useState<any>()
  // This variable holds the base64 encoded image
  const [imageToUpload, setImageToUpload] = useState<any>('')
  
  const selectImage = async () => {
    ImagePicker.launchImageLibrary({mediaType:'photo'}, async response => {
      if(response.errorCode){
        console.log("error", response.errorCode)
      }else {
        if(response.assets){
          console.log("Image:", response.assets[0])
          const uri = response.assets[0].uri
          const path = await normalizePath(uri)
          console.log('path', path)
          setImageToUpload(response.assets[0])
        }
      }
    })
  }

  const normalizePath = async (path: any) => {
    if(Platform.OS === 'android' || Platform.OS === 'ios'){
      const filePrefix = "file://"
      if(path.startsWith(filePrefix)){
        path = path.substring(filePrefix.length)
        path = decodeURI(path)
      }
    }
    return path
  }

  const uploadImage = async () => {
    if(auth.currentUser !== null){
      try{  
        const pictureRef = ref(storage, `Profile Pictures/${`ProfilePictureOf` + auth.currentUser.uid}`)
        await uploadBytes(pictureRef, imageToUpload)
        const imageUrl = await getDownloadURL(pictureRef)
        await updateProfile(auth.currentUser, {photoURL:imageUrl})
        // await updateDocs()
      }catch(e){
        console.log(e)
      } 
    }
  }

  const updateDocs = async () => {
  
      const docsRef = collection(db, 'posts')
      const postsQuery = query(docsRef, where('authorDetails.id', '==', auth.currentUser?.uid))
      const snapshot = await getDocs(postsQuery)
      for(let i = 0; i < snapshot.docs.length; i ++){
        const docRef = doc(db, 'posts', snapshot.docs[i].id)
        if(imageToUpload){
          await updateDoc(docRef, {authorDetails:{authorProfilePicture:auth.currentUser?.photoURL}})
        }
      }
  }
  return (
    <View style={styles.profile}>
      <Text style={styles.headingText}>My Information</Text>
        <View style={styles.infoWrapper}>

          {/* Wrapper of username input, email input and reset password btn */}
          <View style={styles.inputsWrapper}>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabels}>Username</Text>
              <TextInput style={[styles.inputs, !userWantsToEditName ? styles.disabledInputs : {}]} placeholder={currentName !== null ? currentName : ''} editable={userWantsToEditName}/>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabels}>Email</Text>
              <TextInput style={[styles.inputs, !userWantsToEditEmail ? styles.disabledInputs : {}]} placeholder={currentEmail !== null ? currentEmail : ''} editable={userWantsToEditEmail}/>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabels}>Password</Text>
              <Pressable style={styles.resetBtn}><Text style={{color:'white'}}>Send password reset email</Text></Pressable>
            </View>

          </View>

          {/* Profile picture */}
          <View style={styles.profilePictureFormWrapper}>
            <Text style={styles.pfpText}>Profile Picture</Text>
            
            <View style={styles.profilePictureWrapper}>
              {/* <Image style={styles.profilePicture} source={auth.currentUser?.photoURL ? {uri: imageToUpload} : userIcon}/> */}
            
              <View>
                <Pressable style={styles.choosePictureBtn} onPress={selectImage}><Text style={styles.choosePictureBtnText}>Select new picture</Text></Pressable>
                {imageToUpload && <Pressable style={styles.choosePictureBtn} onPress={uploadImage}><Text style={styles.choosePictureBtnText}>Upload new picture</Text></Pressable>}
              </View>

            </View>
          </View>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  profile:{
    flex:1,
    backgroundColor:colors.black,
    alignItems:'center'
  },
  headingText:{
    fontSize:25,
    textAlign:'center',
    marginVertical:15,
    color:'white',
  },
  infoWrapper:{
    width:'95%',
    height:'90%',
    backgroundColor:colors.gray,
    borderRadius:10,
  },
  inputsWrapper:{
    alignItems:'center'
  },
  inputWrapper:{
    width:'90%',
    alignItems:'center',
    marginTop:20
  },
  inputs:{
    borderWidth:1,
    borderColor:'white',
    borderRadius:8,
    paddingHorizontal:10,
    width:'90%',
  },
  inputLabels:{
    width:'90%',
    textAlign:'left',
    marginBottom:10,
    color:'white',
  },
  disabledInputs:{
    opacity:.6
  },
  resetBtn:{
    marginTop:25,
    padding:15,
    borderWidth:1,
    borderColor:'white',
    borderRadius:8
  },
  profilePictureFormWrapper:{
    width:'98%',
    marginTop:50,
    marginLeft:'1%'
  },
  profilePictureWrapper:{
    flexDirection:'row',
    alignItems:'center',
  },
  pfpText:{
    fontSize:25,
    color:'white',
    textAlign:'center',
    marginTop:10,
    marginBottom:50
  },
  profilePicture:{
    width:100,
    height:100,
    marginLeft:20
  },
  choosePictureBtn:{
    paddingVertical:10,
    paddingHorizontal:15,
    borderWidth:1,
    borderColor:'white',
    borderRadius:8,
    marginLeft:40,
    marginVertical:10
  },
  choosePictureBtnText:{
    color:'white',
    fontSize:15,
    textAlign:'center'
  }
})