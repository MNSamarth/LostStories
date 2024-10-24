from flask import Flask, request, jsonify
from flask_cors import CORS
from pydub import AudioSegment
import os
import traceback
from lyrics import transcribe

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

@app.route('/transcribe', methods=['POST'])
def handle_transcribe():
    print("Transcription request received")
    if 'file' not in request.files:
        print("No file part in the request")
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        print("No selected file")
        return jsonify({'error': 'No selected file'}), 400
    if file:
        print(f"Processing file: {file.filename}")
        # Save the file temporarily
        temp_dir = 'temp'
        os.makedirs(temp_dir, exist_ok=True)
        original_file_path = os.path.join(temp_dir, file.filename)
        file.save(original_file_path)
        print(f"File saved temporarily at: {original_file_path}")
        
        # Convert to WAV if it's an MP3
        file_name, file_extension = os.path.splitext(file.filename)
        wav_file_path = os.path.join(temp_dir, f"{file_name}.wav")
        
        if file_extension.lower() == '.mp3':
            print("Converting MP3 to WAV")
            audio = AudioSegment.from_mp3(original_file_path)
            audio.export(wav_file_path, format="wav")
            os.remove(original_file_path)  # Remove the original MP3 file
        else:
            wav_file_path = original_file_path  # If it's already a WAV file
        
        # Perform transcription
        try:
            print(f"Starting transcription for file: {wav_file_path}")
            transcription = transcribe(wav_file_path)
            print(f"Transcription completed. First 100 chars: {transcription[:100]}...")
            return jsonify({'transcription': transcription})
        except Exception as e:
            print(f"Error during transcription: {str(e)}")
            print(traceback.format_exc())
            return jsonify({'error': str(e)}), 500
        finally:
            # Ensure the temporary files are removed even if an error occurs
            if os.path.exists(wav_file_path):
                os.remove(wav_file_path)
                print(f"Temporary WAV file removed: {wav_file_path}")
            if os.path.exists(original_file_path):
                os.remove(original_file_path)
                print(f"Temporary original file removed: {original_file_path}")

if __name__ == '__main__':
    print("Starting Flask server for transcription")
    app.run(port=5001, debug=True)
