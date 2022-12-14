const axios = require("axios");
require('dotenv').config()
const audioURL = "https://www.youtube.com/watch?v=Ze1C1kyETi8"
const APIKey = process.env.ASSEMBLY
const refreshInterval = 5000
const XLSX = require("xlsx");
const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require("path");
const ffmpeg = require('fluent-ffmpeg');
const readline = require('readline');
// Setting up the AssemblyAI headers
const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: APIKey,
    "content-type": "application/json",
  },
});


let id = '7wNb0pHyGuI';

let stream = ytdl(id, {
  quality: 'highestaudio',
});

let start = Date.now();
ffmpeg(stream)
  .audioBitrate(128)
  .save(`${__dirname}/${id}.mp3`)
  .on('progress', p => {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${p.targetSize}kb downloaded`);
  })
  .on('end', () => {
    console.log(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
  });

const getTranscript = async () => {
  // Sends the audio file to AssemblyAI for transcription
  const response = await assembly.post("/transcript", {
    audio_url: audioURL,
    sentiment_analysis: true,
    summarization: true,
    summary_type: "bullets",
    auto_highlights: true
  })

  // Interval for checking transcript completion
  const checkCompletionInterval = setInterval(async () => {
    const transcript = await assembly.get(`/transcript/${response.data.id}`)
    const transcriptStatus = transcript.data.status

    if (transcriptStatus !== "completed") {
      console.log(`Transcript Status: ${transcriptStatus}, ${transcript.data.error}`)
    }  else if (transcriptStatus === "completed") {
      console.log("\nTranscription completed!\n")
    //  return transcript;
      let transcriptText = transcript.data.text
      console.log(`Your transcribed text:\n\n${transcriptText}`)
      console.log(transcript.data)
      console.log(transcript.data.auto_highlights_result)
      clearInterval(checkCompletionInterval) 
      return transcript
    }
  }, refreshInterval)
}
getTranscript()


// json to excel 
