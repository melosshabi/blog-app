import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
// Colors
import colors from '../assets/colors'
// Interface
import { Posts } from './Home'
// Firebase
import { collection, query, where, orderBy, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import {db, auth} from '../firebase/firebase'
// Parse date function
import { parseDate } from '../assets/functions'
import Video from 'react-native-video'
import Snackbar from 'react-native-snackbar'

interface UserPosts extends Posts{}

export default function UserPosts() {

  const [dots] = useState(require('../assets/images/dots.png'))

  const [userPosts, setUserPosts] = useState<UserPosts[]>()
  const [deviceWidth] = useState(Dimensions.get('window').width - 30)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  // This variable will hold the firebase document id which the user might want to delete or edit
  const [postId, setPostId] = useState<string>("")
  // This variable holds the content of the post which the user is going to edit
  const [postToEditContent, setPostToEditContent] = useState('')

  useEffect(() => {
    auth.onAuthStateChanged(async () => {
      
    if(auth.currentUser !== null){
      const postsCollection = collection(db, 'posts')
      const postsQuery = query(postsCollection, where("authorDetails.id", "==", auth.currentUser.uid), orderBy('createdAt'))
      let tempArr: UserPosts[] = []
      const snapshot = await getDocs(postsQuery)
      snapshot.docs.map(doc => {
        tempArr.push({
          authorDetails:{
            authorEmail:doc.data().authorDetails.authorEmail,
            authorName:doc.data().authorDetails.authorName,
            authorProfilePicture:doc.data().authorDetails.authorProfilePicture,
            userId:doc.data().authorDetails.id
          },
          title:doc.data().title,
          blog:doc.data().blog,
          createdAt:doc.data().createdAt,
          picture:doc.data().picture,
          pictureName:doc.data().pictureName,
          video:doc.data().video,
          videoName: doc.data().videoName,
          docId:doc.id
        })
      })
      setUserPosts(tempArr)
    }
    })
  }, [])

  const deletePost = async () => {
    setShowMoreOptions(false)
    if(postId && userPosts !== undefined){

    const tempArr = userPosts.filter(post => post.docId !== postId) //postId is the variable which holds the id of the document the user wants to delete
    setUserPosts(tempArr)
    const postRef = doc(db, 'posts', postId)
    await deleteDoc(postRef).then(() => {
      Snackbar.show({
        text:"Post Deleted",
        duration:Snackbar.LENGTH_SHORT
      })
    })
    }
  }

  const savePost = async () => {
    if(postToEditContent === ""){
       Snackbar.show({
         text:"The post can't be empty",
         duration:Snackbar.LENGTH_SHORT
       })
       return
     }
     setPostId('')
     if(userPosts){
       const filteredArr = userPosts.filter(post => post.docId === postId)
       const editedPost = filteredArr[0]
       editedPost.blog = postToEditContent
       const postRef = doc(db, 'posts', postId)
       await updateDoc(postRef, {blog:postToEditContent}).then(() => {
         Snackbar.show({
           text:"The post has been edited",
           duration:Snackbar.LENGTH_LONG
         })
         setPostToEditContent('')
     })
   }}
   
  return (
    <View style={styles.userPosts}>
      <FlatList style={{width:"100%",}} contentContainerStyle={{alignItems:'center'}} data={userPosts} keyExtractor={post => post.docId} renderItem={({item}) => (

        <View style={[styles.post, {width:deviceWidth}]}>
              
          {/* Author */}
        <View style={styles.authorWrapper}>
              
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image source={{uri:item.authorDetails.authorProfilePicture}} style={{width:40, height:40, borderRadius:20, marginRight:15}}/>
            <Text style={styles.author}>@{item.authorDetails.authorName}</Text>
          </View>
              
          {/* More options button */}
          {auth.currentUser !== null && auth.currentUser.uid === item.authorDetails.userId && <Pressable onPress={() => {
            setShowMoreOptions(true)
            setPostId(item.docId)
            setPostToEditContent(item.blog)
          }} style={({pressed}) => [styles.moreOptionsBtn, {backgroundColor:pressed ? colors.transparentWhite : 'transparent'}]}>
            <Image source={dots} style={{width:30, height:30}}/>
          </Pressable>}
        </View>
        
        {/* Title */}
        <View><Text style={styles.postTitle} selectable={true}>{item.title}</Text></View>
        
        {/* Blog */}
        <View style={styles.blogWrapper}>
          <TextInput style={[styles.blogText, {borderColor: postId === item.docId ? 'white' : colors.transparentWhite, borderTopWidth: 1, borderBottomWidth:1}]} editable={postId === item.docId ? true : false} multiline={true} value={postId === item.docId ? postToEditContent : item.blog} onFocus={() => setPostToEditContent(item.blog)} onChangeText={value => setPostToEditContent(value)} />
          <View style={styles.blogPictureWrapper}>
          {item.picture && <Image source={{uri:item.picture}} style={{width:'80%', height:400, maxHeight:'80%', resizeMode:'contain'}}/>}
          {item.video && <Video source={{uri:item.video}}  style={{width:'100%', height:400}} controls={true}/>}
          </View>
        </View>
        {item.docId === postId && <Pressable style={styles.savePostBtn} onPress={savePost}><Text>Save</Text></Pressable>}
        <Text style={styles.postDate}>{parseDate(item.createdAt)}</Text>
        </View>
        )}
        />
        {/* post options */}
      {showMoreOptions && <Pressable onPress={() => setShowMoreOptions(false)} style={styles.moreOptionsWrapper}><View style={styles.moreOptionsWrapper}>
        <View style={styles.moreOptions}>
            {/* Edit Btn */}
            <Pressable onPress={() => {
               setShowMoreOptions(false)
            }} style={({pressed}) => [styles.postActionsBtns, {backgroundColor: pressed ? colors.transparentWhite : 'transparent'}]}><Text style={styles.btnText}>Edit</Text></Pressable>
            {/* Delete Btn */}
            <Pressable onPress={() => {
              deletePost()
            }} style={({pressed}) => [styles.postActionsBtns, {backgroundColor: pressed ? colors.transparentWhite : 'transparent'}]}><Text style={[styles.btnText, {color:'red'}]}>Delete</Text></Pressable>
        </View>
        </View>
      </Pressable>}
    </View>
  )
}

const styles = StyleSheet.create({
  userPosts:{
    flex:1,
    backgroundColor:colors.black
  },
  post:{
    backgroundColor:colors.gray,
    marginTop:20,
    borderRadius:5,
    shadowOffset:{
      width:1,
      height:1
    },
    shadowColor:'white',
  },
  authorWrapper:{
    borderBottomColor:'white',
    borderBottomWidth:1,
    padding:10,
    flexDirection:'row',
    justifyContent:'space-between'
  },
  moreOptionsBtn:{
    paddingHorizontal:3,
    borderRadius:10,
    justifyContent:'center',
    position:'relative',
  },
  moreOptionsWrapper:{
    width:'100%',
    height:'100%',
    position:'absolute',
    left:0,
    top:0,
    backgroundColor:colors.transparentBlack,
    justifyContent:'flex-end'
  },
  moreOptions:{
    width:'100%',
    height:'20%',
    backgroundColor:colors.gray,
    borderColor:'white',
    justifyContent:'center'
  },
  btnText:{
    fontSize:25,
    textAlign:'center'
  },
  postActionsBtns:{
    height:'50%',
    paddingVertical:3,
    borderTopColor:'white',
    borderTopWidth:1,
    borderBottomColor:'white',
    borderBottomWidth:1,
    justifyContent:'center'
  },
  author:{
    fontSize:18
  },
  postTitle:{
    fontSize:18,
    textAlign:'center',
    paddingVertical:10,
    borderBottomColor:'white',
    borderBottomWidth:1,
    marginBottom:10,
    color:'white'
  },
  blogWrapper:{
    padding:5,
    marginBottom:25,
  },
  blogText:{
    fontSize:15,
    marginBottom:20,
    color:'white'
  },
  blogPictureWrapper:{
    width:'95%',
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  savePostBtn:{
    width:55,
    margin:5,
    padding:10,
    borderColor:'white',
    borderWidth:1,
    alignItems:'center'
  },
  postDate:{
    position:'absolute',
    bottom:5,
    right:5,
  }
})