from pytube import YouTube
import os
import sys

def download_clean_version(song_name, output_path):
    from googleapiclient.discovery import build
    youtube = build('youtube', 'v3', developerKey='AIzaSyDF_gFQ0phuQ3ZpNgFTq_PIwfK7O29hyk8')
    
    # Search for the song on YouTube
    request = youtube.search().list(
        q=f"{song_name} clean",
        part="snippet",
        maxResults=1,
        type="video"
    )
    response = request.execute()

    # Check if we have results
    if response['items']:
        video_id = response['items'][0]['id']['videoId']
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        
        # Download the video as an audio file using PyTube
        yt = YouTube(video_url)
        stream = yt.streams.filter(only_audio=True).first()
        stream.download(output_path=output_path, filename=f"{song_name}(C).mp3")
        print(f"Downloaded '{song_name}_clean.mp3' to {output_path}")
    else:
        print("No clean version found on YouTube.")

if __name__ == "__main__":
    # Check if two command-line arguments are given
    if len(sys.argv) == 3:
        # The first command-line argument is the song name
        song_name = sys.argv[1]
        # The second command-line argument is the output path
        output_path = sys.argv[2]

        download_clean_version(song_name, output_path)
    else:
        print("Usage: python script.py 'song_name' 'output_path'")
