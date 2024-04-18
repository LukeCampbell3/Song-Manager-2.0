from vosk import Model, KaldiRecognizer
import os
import wave
import json
import sys
import librosa
import noisereduce as nr
from pydub import AudioSegment

def preprocess_audio(vocals_path):
    # Load the audio file
    y, sr = librosa.load(vocals_path, sr=16000)

    # Perform noise reduction
    reduced_noise = nr.reduce_noise(y=y, sr=sr)

    # Using PyDub to perform normalization
    audio_segment = AudioSegment(
        reduced_noise.tobytes(), 
        frame_rate=sr, 
        sample_width=reduced_noise.dtype.itemsize, 
        channels=1
    )
    normalized_audio = audio_segment.normalize()

    # Save the processed audio to a temporary file
    temp_processed_path = 'temp_processed_vocals.wav'
    normalized_audio.export(temp_processed_path, format="wav")
    
    return temp_processed_path

def transcribe_vocals_to_text(model_path, vocals_path, output_json_path):
    # Preprocess the audio to normalize and reduce noise
    processed_vocals_path = preprocess_audio(vocals_path)
    
    # Initialize Vosk model and recognizer
    model = Model(model_path)
    recognizer = KaldiRecognizer(model, 16000)
    recognizer.SetWords(True)
    transcription_data = []

    # Open the processed WAV file for transcription
    with wave.open(processed_vocals_path, 'rb') as wf:
        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if recognizer.AcceptWaveform(data):
                part_result = json.loads(recognizer.Result())
                transcription_data.extend(part_result.get('result', []))
        
        # Get any final results if available
        final_results = json.loads(recognizer.FinalResult())
        transcription_data.extend(final_results.get('result', []))

    # Save the transcription data to a JSON file
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(transcription_data, f, ensure_ascii=False, indent=4)
    
    # Clean up the temporary file
    os.remove(processed_vocals_path)

if __name__ == '__main__':
    model_path = 'C:\\Users\\jcthi\\Visual Studio Code\\YT - MP3\\vosk-model-en-us-0.22\\vosk-model-en-us-0.22'
    vocals_path = 'C:\\Users\\jcthi\\Visual Studio Code\\YT - MP3\\audio_input\\vocals_instrumentals\\TeenX\\vocals.wav'
    output_json_path = 'C:\\Users\\jcthi\\Visual Studio Code\\YT - MP3\\txt\\transcription.json'  # Updated to include file name

    # Validate the input audio path
    if not os.path.isfile(vocals_path):
        print(f"Error: The file {vocals_path} does not exist.")
        sys.exit(1)

    transcribe_vocals_to_text(model_path, vocals_path, output_json_path)
