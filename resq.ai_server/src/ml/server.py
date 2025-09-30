from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={
    r"/infer": {
        "origins": ["http://localhost:5173"],
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/infer', methods=['POST'])
def infer():
    if 'pre_disaster' not in request.files or 'post_disaster' not in request.files:
        return jsonify({'error': 'Missing required files'}), 400
    
    pre_file = request.files['pre_disaster']
    post_file = request.files['post_disaster']
    
    if pre_file.filename == '' or post_file.filename == '':
        return jsonify({'error': 'No selected files'}), 400
    
    if not (allowed_file(pre_file.filename) and allowed_file(post_file.filename)):
        return jsonify({'error': 'Invalid file type'}), 400

    try:
        # Save files
        pre_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(pre_file.filename))
        post_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(post_file.filename))
        
        pre_file.save(pre_path)
        post_file.save(post_path)

        # Mock response for testing
        return jsonify({
            'success': True,
            'damage_level': 0.75,
            'message': 'Analysis complete',
            'details': {
                'pre_image': pre_file.filename,
                'post_image': post_file.filename
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(port=5000, debug=True)
