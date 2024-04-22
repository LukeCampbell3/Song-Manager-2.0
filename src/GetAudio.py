from spleeter.separator import Separator
import os
import sys
import librosa
import numpy as np
import noisereduce as nr
from pydub import AudioSegment
import soundfile as sf  # This library is typically used for writing files in librosa


# uses spleeter to seperate the audio file into 4 parts. The vocals are good as is, but the instrumental must be remade.
def separate_audio(input_audio_path, output_directory):
    print(f"Input audio path: {input_audio_path}")
    print(f"Output directory: {output_directory}")
    print(f"File exists: {os.path.exists(input_audio_path)}")

    # Initialize the Separator with the 4stems model for more detailed separation
    separator = Separator('spleeter:4stems')
    
    # Perform separation
    try:
        separator.separate_to_file(input_audio_path, output_directory)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise
    
    base_name = os.path.basename(input_audio_path)
    file_name_without_extension = os.path.splitext(base_name)[0]
    
    # Paths for the separated files
    separated_folder = os.path.join(output_directory, file_name_without_extension)
    vocals_path = os.path.join(separated_folder, 'vocals.wav')
    bass_path = os.path.join(separated_folder, 'bass.wav')
    drums_path = os.path.join(separated_folder, 'drums.wav')
    other_path = os.path.join(separated_folder, 'other.wav')
    
    # Load the bass, drums, and other tracks using pydub
    bass_audio = AudioSegment.from_file(bass_path)
    drums_audio = AudioSegment.from_file(drums_path)
    other_audio = AudioSegment.from_file(other_path)

    # Mix the tracks together
    instrumental_mix = bass_audio.overlay(drums_audio).overlay(other_audio)

    # Export the mixed instrumental track as MP3
    instrumental_path_mp3 = os.path.join(separated_folder, "instrumental.mp3")
    instrumental_mix.export(instrumental_path_mp3, format='mp3')

    # Apply noise reduction to the vocals track using librosa and noisereduce
    vocals_audio, rate = librosa.load(vocals_path, sr=None)
    reduced_noise_vocals = nr.reduce_noise(y=vocals_audio, sr=rate)

    # Convert the reduced noise vocals to an AudioSegment
    reduced_noise_vocals_audio_segment = AudioSegment(
        data=np.array(reduced_noise_vocals).tobytes(),
        frame_rate=rate,
        sample_width=2,  # assuming the dtype of vocals_audio is float32
        channels=1
    )

    # Convert the existing vocals.wav to MP3
    vocals_path_wav = os.path.join(separated_folder, 'vocals.wav')
    vocals_audio = AudioSegment.from_wav(vocals_path_wav)
    vocals_path_mp3 = os.path.join(separated_folder, "vocals.mp3")
    vocals_audio.export(vocals_path_mp3, format='mp3')

    # Delete the original vocals.wav file
    os.remove(vocals_path_wav)

    # Delete the bass, drums, and other tracks
    try:
        os.remove(bass_path)
        os.remove(drums_path)
        os.remove(other_path)
    except OSError as e:
        print(f"Error deleting intermediate files: {e}")

    return vocals_path_mp3, instrumental_path_mp3



if __name__ == '__main__':
    # Example code to get the input arguments
    input_audio_path = sys.argv[1] if len(sys.argv) > 1 else None
    output_directory = sys.argv[2] if len(sys.argv) > 2 else None

    # Validate the input audio path
    if input_audio_path is None or not os.path.isfile(input_audio_path):
        print(f"Error: The file {input_audio_path} does not exist.")
        sys.exit(1)

    # Call your function with validated paths
    vocals_path, instrumental_path = separate_audio(input_audio_path, output_directory)