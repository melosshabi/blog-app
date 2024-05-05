export const parseDate = dateToParse => {
    const date = dateToParse.toDate()
    const year = date.getFullYear()
    let month;
    const day = date.getDate()
    const hours = date.getHours()
    let minutes = date.getMinutes()
    if(minutes.toString().length === 1) minutes = `0${minutes}`

    switch(date.getMonth()){
      case 0:
        month = 'Jan'
        break;
      case 1:
        month = "Feb"
        break;
      case 2:
        month = "Mar"
        break;
      case 3:
        month = "Apr"
        break;
      case 4:
        month = "May"
        break;
      case 5:
        month = "June"
        break;
      case 6:
        month = "July"
        break;
      case 7:
        month = "Aug"
        break;
      case 8:
        month = "Sep"
        break;
      case 9:
        month = "Oct"
        break;
      case 10:
        month = "Nov"
        break;
      case 11:
        month = "Dec"
        break;
      default:
        month = ""
    }

    return `${day} ${month} ${year} ${hours}:${minutes}`
}