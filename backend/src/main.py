import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_talisman import Talisman
from dotenv import load_dotenv

try:
    from src.models.user import db
    from src.routes.user import user_bp
    from src.routes.payment import payment_bp
except ImportError:
    from models.user import db
    from routes.user import user_bp
    from routes.payment import payment_bp

load_dotenv()

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Security and CORS
force_https = os.getenv('FORCE_HTTPS', 'false').lower() == 'true'
Talisman(app, 
         force_https=force_https,
         strict_transport_security=True,
         content_security_policy={
             'default-src': "'self'",
             'script-src': "'self' 'unsafe-inline'",
             'style-src': "'self' 'unsafe-inline'",
             'img-src': "'self' data:",
         })
CORS(app)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(payment_bp, url_prefix='/api/payment')

# Initialize database
db.init_app(app)
with app.app_context():
    os.makedirs(os.path.join(os.path.dirname(__file__), 'database'), exist_ok=True)
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve static files and handle SPA routing"""
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/health')
def app_health():
    """Application health check"""
    return {"status": "healthy", "service": "creator-bounty-backend"}, 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
