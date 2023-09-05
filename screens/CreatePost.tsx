import { Dimensions, GestureResponderEvent, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
// colors
import colors from '../assets/colors'
// Form validation
import { Formik } from 'formik'
import * as yup from 'yup'
// Firebase
import {addDoc, collection, serverTimestamp} from 'firebase/firestore'
import { auth, db, storage } from '../firebase/firebase'
import { DrawerNavigationProp } from '@react-navigation/drawer'
// Image picker
import * as ImagePicker from 'react-native-image-picker'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
// Library to generate an ID
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
// Library to show videos
import Video from 'react-native-video'

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
  const [imageIcon] = useState(require('../assets/images/image-icon.png'))
  const [videoIcon] = useState(require('../assets/images/video-icon.png'))
  const [creationInProgress, setCreationInProgress] = useState<boolean>(false)

  const blogSchema = yup.object().shape({
    title:yup.string().min(2, "Title must be at least 2 characters long"),
    blog:yup.string().min(2, "Blog must be at least 2 characters long")
  })
  
  const [selectedImage, setSelectedImage] = useState<string>()

  const selectImage = () => {
    ImagePicker.launchImageLibrary({mediaType:'photo'}, res => {
      if(res.assets){
        setSelectedImage(res.assets[0].uri)
      }
    })
  }

  const [selectedVideo, setSelectedVideo] = useState<string>()
  const [videoError, setVideoError] = useState<string>('')

  const selectVideo = () => {
    ImagePicker.launchImageLibrary({mediaType:'video'}, async res => {
      if(res.assets){
        setSelectedVideo(res.assets[0].uri)
      }
    })
  }

  const createPost = async (title:string, blog:string) => {

    if(auth.currentUser !== null){

    setCreationInProgress(true)
    // Upload image
    let pictureName = ''
    let postImageUrl = ''
    if(selectedImage){
      pictureName = `PostPictures/${uuidv4()}`
      const imageFile = await fetch(selectedImage)
      const blob = await imageFile.blob()
      const pictureRef = ref(storage, pictureName)
      await uploadBytes(pictureRef, blob)
      postImageUrl = await getDownloadURL(pictureRef)
    }

    let videoName = ''
    let postVideoUrl = ''
    if(selectedVideo){
      videoName = `PostVideos/${uuidv4()}`
      let videoFile;
      let blob
      try{
        videoFile = await fetch(selectedVideo)
        blob = await videoFile.blob()
      }catch(err){
        setVideoError(`${err}`)
      }
      if(!videoError){
        const videoRef = ref(storage, videoName)
        if(blob){
          await uploadBytes(videoRef, blob)
          postVideoUrl = await getDownloadURL(videoRef)
        }
    }
  }

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
      picture:postImageUrl,
      pictureName:pictureName,
      video:postVideoUrl,
      videoName:videoName,
      createdAt:serverTimestamp(),
      lastUpdatedAt:serverTimestamp(),
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
            placeholderTextColor='white'
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
            placeholderTextColor='white'
          />
          {errors.blog && (<Text style={styles.error}>{errors.blog}</Text>)}
          <View style={styles.fileBtnsWrapper}>
            {/* Add image button */}
            <View style={styles.imageVideoBtnWrapper}>
              <Pressable onPress={selectImage}><Image source={imageIcon} style={styles.fileBtns}/></Pressable>
              {selectedImage && <Image source={{uri:selectedImage}} style={{width:40, height:40}}/>}
            </View>
            {/* Add video button */}
            <View style={styles.imageVideoBtnWrapper}>
              <Pressable onPress={selectVideo}><Image source={videoIcon} style={styles.fileBtns}/></Pressable>
              {selectedVideo && <Video source={{uri:selectedVideo}} style={{width:80, height:80}} controls={false}/>}
            </View>
          </View>
          {videoError && <Text style={styles.error}>Failed to fetch video for upload: {videoError}</Text>}
         </View>
         
         <Pressable onPress={handleSubmit as unknown as (e: GestureResponderEvent) => void} style={[styles.createPostBtn, creationInProgress ? styles.disabledBtn : {}]} disabled={creationInProgress}><Text style={styles.createBtnText}>{creationInProgress ? 'Creating Blog' : 'Create Blog'}</Text></Pressable>
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
    color:'white'
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
  },
  fileBtnsWrapper:{
    width:'90%',
    marginLeft:'5%',
    flexDirection:'row',
    justifyContent:'space-around',
    alignItems:'center',
    marginTop:20,
  },
  fileBtns:{
    width:40,
    height:40,
    marginHorizontal:15
  },
  imageVideoBtnWrapper:{
    flexDirection:'row',
    alignItems:'center'
  }
})