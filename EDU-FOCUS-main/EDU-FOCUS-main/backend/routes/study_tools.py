from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, StudySession, FlashcardDeck, Flashcard, Note, Quiz, MindMap, PomodoroStats
from datetime import datetime, date
import json

study_bp = Blueprint('study', __name__)

# ==================== Study Sessions ====================
@study_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    """Get all study sessions for current user"""
    try:
        user_id = get_jwt_identity()
        sessions = StudySession.query.filter_by(user_id=user_id).order_by(StudySession.session_date.desc()).all()
        return jsonify({'sessions': [s.to_dict() for s in sessions]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@study_bp.route('/sessions', methods=['POST'])
@jwt_required()
def create_session():
    """Create a new study session"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        session = StudySession(
            user_id=user_id,
            subject=data['subject'],
            session_date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            session_time=datetime.strptime(data['time'], '%H:%M').time(),
            duration=data.get('duration'),
            goals=data.get('goals'),
            status=data.get('status', 'scheduled')
        )
        
        db.session.add(session)
        db.session.commit()
        
        return jsonify({'message': 'Session created', 'session': session.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@study_bp.route('/sessions/<int:session_id>', methods=['PUT'])
@jwt_required()
def update_session(session_id):
    """Update a study session"""
    try:
        user_id = get_jwt_identity()
        session = StudySession.query.filter_by(id=session_id, user_id=user_id).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        data = request.get_json()
        
        if data.get('subject'):
            session.subject = data['subject']
        if data.get('date'):
            session.session_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if data.get('time'):
            session.session_time = datetime.strptime(data['time'], '%H:%M').time()
        if data.get('duration'):
            session.duration = data['duration']
        if data.get('goals'):
            session.goals = data['goals']
        if data.get('status'):
            session.status = data['status']
        
        db.session.commit()
        
        return jsonify({'message': 'Session updated', 'session': session.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@study_bp.route('/sessions/<int:session_id>', methods=['DELETE'])
@jwt_required()
def delete_session(session_id):
    """Delete a study session"""
    try:
        user_id = get_jwt_identity()
        session = StudySession.query.filter_by(id=session_id, user_id=user_id).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        db.session.delete(session)
        db.session.commit()
        
        return jsonify({'message': 'Session deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== Flashcards ====================
@study_bp.route('/flashcards/decks', methods=['GET'])
@jwt_required()
def get_decks():
    """Get all flashcard decks"""
    try:
        user_id = get_jwt_identity()
        decks = FlashcardDeck.query.filter_by(user_id=user_id).order_by(FlashcardDeck.created_at.desc()).all()
        return jsonify({'decks': [d.to_dict() for d in decks]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@study_bp.route('/flashcards/decks', methods=['POST'])
@jwt_required()
def create_deck():
    """Create a new flashcard deck"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        deck = FlashcardDeck(
            user_id=user_id,
            name=data['name'],
            description=data.get('description', '')
        )
        
        db.session.add(deck)
        db.session.commit()
        
        return jsonify({'message': 'Deck created', 'deck': deck.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@study_bp.route('/flashcards/decks/<int:deck_id>', methods=['DELETE'])
@jwt_required()
def delete_deck(deck_id):
    """Delete a flashcard deck"""
    try:
        user_id = get_jwt_identity()
        deck = FlashcardDeck.query.filter_by(id=deck_id, user_id=user_id).first()
        
        if not deck:
            return jsonify({'error': 'Deck not found'}), 404
        
        db.session.delete(deck)
        db.session.commit()
        
        return jsonify({'message': 'Deck deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@study_bp.route('/flashcards/decks/<int:deck_id>/cards', methods=['POST'])
@jwt_required()
def add_card(deck_id):
    """Add a card to a deck"""
    try:
        user_id = get_jwt_identity()
        deck = FlashcardDeck.query.filter_by(id=deck_id, user_id=user_id).first()
        
        if not deck:
            return jsonify({'error': 'Deck not found'}), 404
        
        data = request.get_json()
        
        card = Flashcard(
            deck_id=deck_id,
            question=data['question'],
            answer=data['answer'],
            difficulty=data.get('difficulty', 'medium')
        )
        
        db.session.add(card)
        db.session.commit()
        
        return jsonify({'message': 'Card added', 'card': card.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@study_bp.route('/flashcards/cards/<int:card_id>', methods=['DELETE'])
@jwt_required()
def delete_card(card_id):
    """Delete a flashcard"""
    try:
        user_id = get_jwt_identity()
        card = Flashcard.query.join(FlashcardDeck).filter(
            Flashcard.id == card_id,
            FlashcardDeck.user_id == user_id
        ).first()
        
        if not card:
            return jsonify({'error': 'Card not found'}), 404
        
        db.session.delete(card)
        db.session.commit()
        
        return jsonify({'message': 'Card deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== Notes ====================
@study_bp.route('/notes', methods=['GET'])
@jwt_required()
def get_notes():
    """Get all notes"""
    try:
        user_id = get_jwt_identity()
        notes = Note.query.filter_by(user_id=user_id).order_by(Note.updated_at.desc()).all()
        return jsonify({'notes': [n.to_dict() for n in notes]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@study_bp.route('/notes', methods=['POST'])
@jwt_required()
def create_note():
    """Create a new note"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        note = Note(
            user_id=user_id,
            title=data['title'],
            content=data['content'],
            tags=','.join(data.get('tags', []))
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify({'message': 'Note created', 'note': note.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@study_bp.route('/notes/<int:note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    """Update a note"""
    try:
        user_id = get_jwt_identity()
        note = Note.query.filter_by(id=note_id, user_id=user_id).first()
        
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        
        data = request.get_json()
        
        if data.get('title'):
            note.title = data['title']
        if data.get('content'):
            note.content = data['content']
        if 'tags' in data:
            note.tags = ','.join(data['tags'])
        
        note.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Note updated', 'note': note.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@study_bp.route('/notes/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    """Delete a note"""
    try:
        user_id = get_jwt_identity()
        note = Note.query.filter_by(id=note_id, user_id=user_id).first()
        
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        
        db.session.delete(note)
        db.session.commit()
        
        return jsonify({'message': 'Note deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== Quizzes ====================
@study_bp.route('/quizzes', methods=['GET'])
@jwt_required()
def get_quizzes():
    """Get all quizzes"""
    try:
        user_id = get_jwt_identity()
        quizzes = Quiz.query.filter_by(user_id=user_id).order_by(Quiz.created_at.desc()).all()
        return jsonify({'quizzes': [q.to_dict() for q in quizzes]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@study_bp.route('/quizzes', methods=['POST'])
@jwt_required()
def create_quiz():
    """Create a new quiz"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        quiz = Quiz(
            user_id=user_id,
            title=data['title'],
            topic=data.get('topic'),
            difficulty=data.get('difficulty'),
            questions_data=json.dumps(data.get('questions', [])),
            max_score=len(data.get('questions', []))
        )
        
        db.session.add(quiz)
        db.session.commit()
        
        return jsonify({'message': 'Quiz created', 'quiz': quiz.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@study_bp.route('/quizzes/<int:quiz_id>', methods=['DELETE'])
@jwt_required()
def delete_quiz(quiz_id):
    """Delete a quiz"""
    try:
        user_id = get_jwt_identity()
        quiz = Quiz.query.filter_by(id=quiz_id, user_id=user_id).first()
        
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        db.session.delete(quiz)
        db.session.commit()
        
        return jsonify({'message': 'Quiz deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== Mind Maps ====================
@study_bp.route('/mindmaps', methods=['GET'])
@jwt_required()
def get_mindmaps():
    """Get all mind maps"""
    try:
        user_id = get_jwt_identity()
        maps = MindMap.query.filter_by(user_id=user_id).order_by(MindMap.updated_at.desc()).all()
        return jsonify({'maps': [m.to_dict() for m in maps]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@study_bp.route('/mindmaps', methods=['POST'])
@jwt_required()
def create_mindmap():
    """Create a new mind map"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        mindmap = MindMap(
            user_id=user_id,
            title=data['title'],
            description=data.get('description', ''),
            map_data=json.dumps(data.get('map_data', {}))
        )
        
        db.session.add(mindmap)
        db.session.commit()
        
        return jsonify({'message': 'Mind map created', 'map': mindmap.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@study_bp.route('/mindmaps/<int:map_id>', methods=['PUT'])
@jwt_required()
def update_mindmap(map_id):
    """Update a mind map"""
    try:
        user_id = get_jwt_identity()
        mindmap = MindMap.query.filter_by(id=map_id, user_id=user_id).first()
        
        if not mindmap:
            return jsonify({'error': 'Mind map not found'}), 404
        
        data = request.get_json()
        
        if data.get('title'):
            mindmap.title = data['title']
        if data.get('description'):
            mindmap.description = data['description']
        if 'map_data' in data:
            mindmap.map_data = json.dumps(data['map_data'])
        
        mindmap.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Mind map updated', 'map': mindmap.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@study_bp.route('/mindmaps/<int:map_id>', methods=['DELETE'])
@jwt_required()
def delete_mindmap(map_id):
    """Delete a mind map"""
    try:
        user_id = get_jwt_identity()
        mindmap = MindMap.query.filter_by(id=map_id, user_id=user_id).first()
        
        if not mindmap:
            return jsonify({'error': 'Mind map not found'}), 404
        
        db.session.delete(mindmap)
        db.session.commit()
        
        return jsonify({'message': 'Mind map deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== Pomodoro Stats ====================
@study_bp.route('/pomodoro/stats', methods=['GET'])
@jwt_required()
def get_pomodoro_stats():
    """Get pomodoro statistics"""
    try:
        user_id = get_jwt_identity()
        today = date.today()
        stats = PomodoroStats.query.filter_by(user_id=user_id, date=today).first()
        
        if not stats:
            return jsonify({'stats': {'sessions_completed': 0, 'total_focus_time': 0}}), 200
        
        return jsonify({'stats': stats.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@study_bp.route('/pomodoro/stats', methods=['POST'])
@jwt_required()
def update_pomodoro_stats():
    """Update pomodoro statistics"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        today = date.today()
        
        stats = PomodoroStats.query.filter_by(user_id=user_id, date=today).first()
        
        if not stats:
            stats = PomodoroStats(user_id=user_id, date=today)
            db.session.add(stats)
        
        if 'sessions_completed' in data:
            stats.sessions_completed = data['sessions_completed']
        if 'total_focus_time' in data:
            stats.total_focus_time = data['total_focus_time']
        
        db.session.commit()
        
        return jsonify({'message': 'Stats updated', 'stats': stats.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
