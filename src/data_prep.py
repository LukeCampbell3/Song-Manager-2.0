import os
import wave
import csv
import json
from pydub import AudioSegment
from vosk import Model, KaldiRecognizer
from shutil import copy2

def convert_mp3_to_wav(mp3_dir, wav_dir):
    """
    Converts MP3 files in the given directory to WAV format.
    """
    if not os.path.exists(mp3_dir):
        print(f"The source directory {mp3_dir} does not exist.")
        return

    if not os.path.exists(wav_dir):
        os.makedirs(wav_dir)
        print(f"Created the directory {wav_dir} for WAV files.")

    for mp3_file in os.listdir(mp3_dir):
        if mp3_file.endswith('.mp3'):
            path_to_mp3 = os.path.join(mp3_dir, mp3_file)
            path_to_wav = os.path.join(wav_dir, mp3_file.replace('.mp3', '.wav'))
            
            try:
                # Load the mp3 file
                audio = AudioSegment.from_mp3(path_to_mp3)
                
                # Ensure audio is mono and has the correct frame rate and sample width
                audio = audio.set_channels(1)
                audio = audio.set_frame_rate(16000)
                audio = audio.set_sample_width(2)  # 2 bytes = 16 bits
                
                # Export as WAV in the desired format
                audio.export(path_to_wav, format="wav")
                print(f"Converted {mp3_file} to WAV in 16kHz 16-bit mono format.")
            except Exception as e:
                print(f"Error converting {mp3_file}: {e}")
                
    print("Conversion complete.")

if __name__ == "__main__":
    # Replace these paths with your actual paths
    mp3_dir = 'C:\\Users\\jcthi\\Visual Studio Code\\YT - MP3\\songs-mp3'
    wav_dir = 'C:\\Users\\jcthi\\Visual Studio Code\\YT - MP3\\songs-wav'
    convert_mp3_to_wav(mp3_dir, wav_dir)