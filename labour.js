const axios = require("axios");
const audioURL = "https://www.youtube.com/watch?v=Ze1C1kyETi8"
const APIKey = "47cb2007e83a4516baf72d939b5a7cc4"
const refreshInterval = 5000
const XLSX = require("xlsx");
const youtubedl = require('youtube-dl-exec');
const path = require("path");
// Setting up the AssemblyAI headers
const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: APIKey,
    "content-type": "application/json",
    
  },
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
