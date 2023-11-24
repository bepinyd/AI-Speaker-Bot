
const button = document.querySelector(".button");
const apiKey = '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'; 
const endpoint = 'https://api.openai.com/v1/chat/completions';


// languages available
speech = new SpeechSynthesisUtterance()
let voices = [];
let voiceSelect = document.querySelector("select")
window.speechSynthesis.onvoiceschanged=()=>{
voices = window.speechSynthesis.getVoices()
speech.voice = voices[1]
voices.forEach((voice, i)=>(voiceSelect.options[i]) = new Option(voice.name, i))
};
voiceSelect.addEventListener('change', ()=>{
  speech.voice=voices[voiceSelect.value]
})


// api callback  

let recognition = null;
let chunks = [];
let isRecording = false;

function fetchData() {
  const transcript = chunks.join(' ');
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "user",
          "content": transcript
        }
      ]
    })
  })
    .then(response => {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making another request.');
      }
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('generating');
      if (data.choices && data.choices.length > 0) {
        const speech = new SpeechSynthesisUtterance();
        speech.text = data.choices[0].message.content;
        window.speechSynthesis.speak(speech);
      } else {
        console.error('Invalid response format:', data);
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    })
    .finally(() => {
    
      chunks = [];
    });
}


7
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.interimResults = true;

  recognition.addEventListener('result', e => {
    const transcript = Array.from(e.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');

    if (e.results[0].isFinal) {
      chunks.push(transcript);
    }
  });

  recognition.addEventListener('end', () => {
    if (isRecording) {
     
      recognition.start();
    } else {
      fetchData();
    }
  });

  button.addEventListener('click', () => {
    if (!isRecording) {
      isRecording = true;
      recognition.start();
      button.innerText='Stop Recording'
      button.style.backgroundColor='red'
    } else {
      isRecording = false;
      recognition.stop();
      button.innerText='Start Recording'
      button.style.backgroundColor='rgb(148, 67, 223)'
    }
  });
} else {
  console.error("SpeechRecognition is not supported in this browser");
}
