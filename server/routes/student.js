import { Router } from 'express'
import mongoose from 'mongoose'
import { Report, Question, File } from '../models'
let router = Router()

let gfs
mongoose.connection.on('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    chunkSizeBytes: 1024,
    bucketName: 'questions'
  })
})

router.get('/question/:branch/:course/:n/image', async (req, res) => {
  let filename = `${req.params.branch}_${req.params.course}_${req.params.n}`
  try {
    console.log(filename)
    let { _id } = await File.findOne({ filename })
    let stream = gfs.openDownloadStream(_id)
    let chunks = []
    stream.on('data', function (chunk) {
      chunks.push(chunk)
      console.log('chunk:', chunk.length)
    })
    stream.on('end', function () {
      var result = Buffer.concat(chunks)
      console.log('final result:', result.length)
      res.send({ image: result.toString('base64') })
    })
  } catch (err) {
    console.log(err)
    res.send('none')
  }
})
router.post('/update', async (req, res) => {
  try {
    let { username, questions } = req.body
    let student = await Report.findOne({ username })
    student.questions = questions
    await student.save()
    res.status(200).send({ success: true, questions })
  } catch (err) {
    res.status(400).send({ success: false, err })
  }
})
router.get('/question/:branch/:course/:n', async (req, res) => {
  try {
    let { branch, course, n } = req.params
    let question = await Question.findOne({ branch, course, n })
    console.log(question)
    res.json({ ...question.toObject(), answer: undefined })
  } catch (err) {
    console.log(err)
    res.status(400).send({ err })
  }
})

router.post('/edit', async (req, res) => {
  console.log(req.body)

  try {
    let report = await Report.findOneAndUpdate(
      { username: req.user.username },
      req.body,
      { new: true }
    )
    res.json({ success: true, report })
  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, err })
  }
})

router.post('/endtest', async function (req, res) {
  try {
    let { username, course, branch } = req.body
    let student = await Report.findOne({ username, course, branch })
    student.status = 1
    await student.save()
    res.status(200).send({ success: true })
  } catch (err) {
    res.status(400).send({ err })
  }
})
export default router