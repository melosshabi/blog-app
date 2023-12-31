import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import colors from '../assets/colors'
import { TextInput } from 'react-native-gesture-handler'
// Firebase
import {auth, db, storage} from '../firebase/firebase'
import { useNavigation } from '@react-navigation/native'
import { getDownloadURL, ref, updateMetadata, uploadBytes, uploadString } from 'firebase/storage'
import { sendPasswordResetEmail, signOut, updateEmail, updateProfile } from 'firebase/auth'
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { DrawerNavigationProp } from '@react-navigation/drawer'
// Library for image selection
import * as ImagePicker from 'react-native-image-picker'
import Snackbar from 'react-native-snackbar'

type HomeProps = {
  Home: {fromSignUp:boolean, fromCreatePost:boolean} | undefined
}

export default function Profile() {
  
  const navigation = useNavigation<DrawerNavigationProp<HomeProps>>()

  // Current username
  const [currentName, setCurrentName] = useState<string | null>('')
  // New username
  const [newName, setNewName] = useState<string>('')
  // Current email
  const [currentEmail, setCurrentEmail] = useState<string | null>('')
  // New email
  const [newEmail, setNewEmail] = useState<string>('')
  // These 2 variables are used to determine whether to make the inputs editable or not
  const [userWantsToEditName, setUserWantsToEditName] = useState<boolean>(false)
  const [userWantsToEditEmail, setUserWantsToEditEmail] = useState<boolean>(false)
  // This variable is used to determine whether to show the save button or not
  const [showSaveBtn, setShowSaveBtn] = useState<boolean>(false)
  const [updatingInfo, setUpdatingInfo] = useState<boolean>(false)
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


  const [imageToUpload, setImageToUpload] = useState<any>('')
  const [uploadInProgress, setUploadInProgress] = useState<boolean>(false)


  const selectImage = () => {
    ImagePicker.launchImageLibrary({mediaType:'photo'}, res => {
        if(res.assets){
          setImageToUpload(res.assets[0])
        }
    })
  }

  const uploadImage = async () => {
    if(auth.currentUser !== null){ 
        setUploadInProgress(true)
        const response = await fetch(imageToUpload.uri)
        const blob = await response.blob()
        const pictureRef = ref(storage, `Profile Pictures/${`ProfilePictureOf` + auth.currentUser.uid}`)
        await uploadBytes(pictureRef, blob)
        const imageUrl = await getDownloadURL(pictureRef)
        await updateProfile(auth.currentUser, {photoURL:imageUrl})
        await updateDocs()
        setImageToUpload('')
    }
  }

  const saveChanges = async () => {
    setUpdatingInfo(true)
    setUserWantsToEditEmail(false)
    setUserWantsToEditName(false)
    await updateDocs()
  }

  const updateDocs = async () => {

      const docsRef = collection(db, 'posts')
      const postsQuery = query(docsRef, where('authorDetails.id', '==', auth.currentUser?.uid))
      const snapshot = await getDocs(postsQuery)

      if(newName || newEmail){
        if(auth.currentUser !== null){
          await updateProfile(auth.currentUser, {displayName:newName})
          await updateEmail(auth.currentUser, newEmail)
        }
      }

      for(let i = 0; i < snapshot.docs.length; i++){
        const docRef = doc(db, 'posts', snapshot.docs[i].id)

        if(newName || newEmail){
          if(auth.currentUser !== null){
              await updateDoc(docRef, {authorDetails:{
                id:auth.currentUser.uid,
                authorEmail:auth.currentUser.email,
                authorName:auth.currentUser.displayName,
                authorProfilePicture:auth.currentUser.photoURL,
              }})
            setShowSaveBtn(false)
          }
        }

        if(imageToUpload){
          if(auth.currentUser !== null){          
            await updateDoc(docRef, {
            authorDetails:{
              id:auth.currentUser.uid, 
              authorProfilePicture:auth.currentUser?.photoURL,
              authorEmail:auth.currentUser.email,
              authorName:auth.currentUser.displayName
            }})
          }
        }
      }
      setUploadInProgress(false)
      Snackbar.show({
        text:"Profile updated",
        duration:Snackbar.LENGTH_LONG
      })
  }

  const sendResetEmail = async () => {
    if(auth.currentUser !== null && auth.currentUser.email !== null){
      await sendPasswordResetEmail(auth, auth.currentUser.email)
      Snackbar.show({
        text:"Reset password link sent, logging out in 8 seconds",
        duration:Snackbar.LENGTH_LONG
      })
      setTimeout(async () => await signOut(auth), 8000)
    }
  }
  return (
    <View style={styles.profile}>
      {/* <Text style={styles.headingText}>My Information</Text> */}
        <View style={styles.infoWrapper}>

          {/* Wrapper of username input, email input and reset password btn */}
          <View style={styles.inputsWrapper}>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabels}>Username</Text>
              <TextInput style={[styles.inputs, !userWantsToEditName ? styles.disabledInputs : {}]} 
                placeholder={currentName !== null ? currentName : ''} 
                editable={userWantsToEditName} 
                value={newName} 
                onChangeText={setNewName}
                placeholderTextColor='white'
                />
              <Pressable style={styles.editBtns} onPress={() => {
                setUserWantsToEditName(true)
                setShowSaveBtn(true)
                }}><Text style={styles.editBtnsText}>Change Username</Text></Pressable>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabels}>Email</Text>
              <TextInput style={[styles.inputs, !userWantsToEditEmail ? styles.disabledInputs : {}]} 
                placeholder={currentEmail !== null ? currentEmail : ''} 
                editable={userWantsToEditEmail} 
                value={newEmail} 
                onChangeText={setNewEmail}
                placeholderTextColor='white'
                />
              <Pressable style={styles.editBtns} onPress={() => {
                setUserWantsToEditEmail(true)
                setShowSaveBtn(true)
                }}><Text style={styles.editBtnsText}>Change Email</Text></Pressable>
            </View>
              {showSaveBtn && <Pressable style={[styles.saveBtn, updatingInfo ? {opacity:.6} : {}]} disabled={updatingInfo} onPress={saveChanges}><Text style={{color:'white'}}>{!updatingInfo ? 'Save changes' : 'Saving changes'}</Text></Pressable>}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabels}>Password</Text>
              <Pressable style={styles.resetBtn} onPress={sendResetEmail}><Text style={{color:'white'}}>Send password reset email</Text></Pressable>
            </View>

          </View>

          {/* Profile picture */}
          <View style={styles.profilePictureFormWrapper}>
            <Text style={styles.pfpText}>Profile Picture</Text>
            
            <View style={styles.profilePictureWrapper}>
              <Image style={styles.profilePicture} source={auth.currentUser?.photoURL ? {uri: auth.currentUser?.photoURL} : userIcon}/>
            
              <View>
                <Pressable style={styles.choosePictureBtn} onPress={selectImage}><Text style={styles.choosePictureBtnText}>Select new picture</Text></Pressable>
                {imageToUpload && <Pressable style={[styles.choosePictureBtn, uploadInProgress ? {opacity:.6} : {}]} onPress={uploadImage} disabled={uploadInProgress}><Text style={styles.choosePictureBtnText}>{!uploadInProgress ? 'Upload new picture' : "Uploading new picture"}</Text></Pressable>}
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
    height:'98%',
    backgroundColor:colors.gray,
    borderRadius:10,
    marginTop:'3%'
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
    color:'white'
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
  editBtns:{
    marginTop:10,
    paddingVertical:5,
    paddingHorizontal:10,
    borderColor:'white',
    borderWidth:1,
    borderRadius:5
  },
  editBtnsText:{
    color:'white',
    fontSize:15
  },
  // The style of the button that saves the username and email
  saveBtn:{
    marginTop:20,
    paddingHorizontal:10,
    paddingVertical:5,
    borderRadius:5,
    borderColor:"white",
    borderWidth:1
  },
  // The reset button style
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