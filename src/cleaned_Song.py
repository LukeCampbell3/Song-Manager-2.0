import json
from pydub import AudioSegment

def load_explicit_terms(filepath):
    with open(filepath, 'r') as file:
        return [line.strip().lower() for line in file.readlines()]

def mute_explicit_sections(audio_file_path, transcription_file_path, explicit_terms_file, output_file_path):
    explicit_terms = load_explicit_terms(explicit_terms_file)
    audio = AudioSegment.from_file(audio_file_path, format="wav")

    # Assuming the original audio is high quality, we preserve the frame rate
    original_frame_rate = audio.frame_rate

    with open(transcription_file_path, 'r') as file:
        transcriptions = json.load(file)

    for transcription in transcriptions:
        word = transcription.get('word', '').lower()
        if word in explicit_terms:
            start_time = float(transcription['start']) * 1000  # Convert to milliseconds
            end_time = float(transcription['end']) * 1000
            mute_section = audio[start_time:end_time] - 96  # Reduce volume
            audio = audio[:start_time] + mute_section + audio[end_time:]

    # Export using settings to preserve quality
    audio.set_frame_rate(original_frame_rate)
    audio.export(output_file_path, format="wav", parameters=["-acodec", "pcm_s16le", "-ar", str(original_frame_rate)])

# Example usage
audio_file_path = 'C:\\Users\\jcthi\\Visual Studio Code\\YT - MP3\\songs-wav\\SICKO MODE.wav'
transcription_file_path = 'C:\\Users\\jcthi\\Visual Studio Code\\YT - MP3\\txt\\transcription_output.json'
explicit_terms_file = 'C:\\Users\\jcthi\\Visual Studio Code\\YT - MP3\\txt\\Explicits.txt'
output_file_path = 'C:\\Users\\jcthi\\Visual Studio Code\\YT - MP3\\cleaned songs\\Sicko Mode(C)2.wav'  # Include name and extension
mute_explicit_sections(audio_file_path, transcription_file_path, explicit_terms_file, output_file_path)
