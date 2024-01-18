var env = require('../env.json')
console.log(env)
console.log(process.env.NODE_ENV)
var cfg= env[process.env.NODE_ENV||'production']
console.log(cfg.port.express)

const resu = {
  "sunrise": "2020-05-25T09:13:30+00:00",
  "sunset": "2020-05-26T01:09:30+00:00",
  "solar_noon": "2020-05-25T16:41:30+00:00",
  "day_length": 53760,
  "civil_twilight_begin": "2020-05-25T08:40:14+00:00",
  "civil_twilight_end": "2020-05-26T00:42:47+00:00",
  "nautical_twilight_begin": "2020-05-25T07:57:54+00:00",
  "nautical_twilight_end": "2020-05-26T01:25:07+00:00",
  "astronomical_twilight_begin": "2020-05-25T07:08:27+00:00",
  "astronomical_twilight_end": "2020-05-26T02:14:34+00:00"
}
const tzadj= "-04:00"  

console.log('resu: ', resu)  

let sunrise = resu.sunrise.split('T')[1].slice(0,5)
let sunset = resu.sunset.split('T')[1].slice(0,5)
sunrise = timeAdj(sunrise, tzadj)
sunset = timeAdj(sunset, tzadj)

console.log('sunrise,sunset: ', sunrise,sunset)

function timeAdj(time, adj){
  let rawhr = time.split(':')[0]*1
  const tadj = adj.split(':')[0]*1
  if (rawhr<-tadj){
    rawhr = 24 - (-rawhr)
  }
  const hr = rawhr+tadj
  const adjtime = `${hr}:${time.split(':')[1]}`
  return adjtime
}