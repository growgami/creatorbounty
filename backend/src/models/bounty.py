from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Bounty(db.Model):
    __tablename__ = 'bounties'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    bounty_pool = db.Column(db.Float, nullable=False)
    token_symbol = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # draft, active, paused, completed, ended
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    end_date = db.Column(db.DateTime, nullable=True)
    created_by = db.Column(db.String(36), nullable=False)  # Admin user ID
    requirements = db.Column(db.Text, nullable=True)  # JSON stringified array
    submissions_count = db.Column(db.Integer, default=0, nullable=False)
    total_submissions = db.Column(db.Integer, nullable=False)
    completion_percentage = db.Column(db.Float, default=0.0, nullable=False)
    
    def __repr__(self):
        return f'<Bounty {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'bountyPool': self.bounty_pool,
            'tokenSymbol': self.token_symbol,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'endDate': self.end_date.isoformat() if self.end_date else None,
            'createdBy': self.created_by,
            'requirements': self.requirements,
            'submissionsCount': self.submissions_count,
            'totalSubmissions': self.total_submissions,
            'completionPercentage': self.completion_percentage
        }
