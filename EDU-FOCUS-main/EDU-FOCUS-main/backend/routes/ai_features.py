from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import openai
import os

ai_bp = Blueprint('ai', __name__)

# Configure OpenAI
openai.api_key = os.environ.get('OPENAI_API_KEY')

@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    """AI Assistant chat endpoint"""
    try:
        data = request.get_json()
        message = data.get('message')
        conversation_history = data.get('history', [])
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Prepare messages for OpenAI
        messages = [
            {"role": "system", "content": "You are a helpful AI study assistant. Help students with their studies, answer questions, and provide educational support."}
        ]
        
        # Add conversation history
        messages.extend(conversation_history[-10:])  # Keep last 10 messages for context
        messages.append({"role": "user", "content": message})
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=messages,
            max_tokens=1000,
            temperature=0.7
        )
        
        reply = response.choices[0].message.content
        
        return jsonify({
            'reply': reply,
            'usage': {
                'prompt_tokens': response.usage.prompt_tokens,
                'completion_tokens': response.usage.completion_tokens,
                'total_tokens': response.usage.total_tokens
            }
        }), 200
        
    except openai.error.AuthenticationError:
        return jsonify({'error': 'Invalid API key'}), 401
    except openai.error.RateLimitError:
        return jsonify({'error': 'Rate limit exceeded'}), 429
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/summarize-video', methods=['POST'])
@jwt_required()
def summarize_video():
    """Video summarizer endpoint"""
    try:
        data = request.get_json()
        video_title = data.get('title', 'Educational Video')
        transcript = data.get('transcript', '')
        
        if not transcript:
            return jsonify({'error': 'Transcript is required'}), 400
        
        prompt = f"""Summarize this educational video titled "{video_title}":

{transcript}

Provide:
1. A concise summary
2. Key points (3-5 bullet points)
3. Main takeaways"""
        
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.5
        )
        
        summary = response.choices[0].message.content
        
        return jsonify({'summary': summary}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/summarize-pdf', methods=['POST'])
@jwt_required()
def summarize_pdf():
    """PDF summarizer endpoint"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'PDF text is required'}), 400
        
        # Limit text length to avoid token limits
        text = text[:4000]
        
        prompt = f"""Summarize this document:

{text}

Provide:
1. Main topic and purpose
2. Key concepts (3-5 points)
3. Important details
4. Conclusion"""
        
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            temperature=0.5
        )
        
        summary = response.choices[0].message.content
        
        return jsonify({'summary': summary}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/recommendations', methods=['POST'])
@jwt_required()
def get_recommendations():
    """Smart recommendations endpoint"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        performance_data = data.get('performance', {})
        study_history = data.get('study_history', [])
        
        prompt = f"""Based on this student's performance data:
- Average focus level: {performance_data.get('focus_level', 'N/A')}
- Study sessions completed: {performance_data.get('sessions', 0)}
- Subjects studied: {', '.join(study_history) if study_history else 'None'}

Provide 3-5 personalized study recommendations to improve their learning."""
        
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.7
        )
        
        recommendations = response.choices[0].message.content
        
        return jsonify({'recommendations': recommendations}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/study-guide', methods=['POST'])
@jwt_required()
def generate_study_guide():
    """Study guide generator endpoint"""
    try:
        data = request.get_json()
        topic = data.get('topic', '')
        guide_format = data.get('format', 'comprehensive')
        
        if not topic:
            return jsonify({'error': 'Topic is required'}), 400
        
        format_instructions = {
            'comprehensive': 'Create a detailed study guide with explanations, examples, and practice questions.',
            'quick': 'Create a quick reference guide with key points and definitions.',
            'flashcards': 'Generate 10 flashcard-style Q&A pairs.',
            'mindmap': 'Outline main concepts and their relationships in a hierarchical structure.'
        }
        
        instruction = format_instructions.get(guide_format, format_instructions['comprehensive'])
        
        prompt = f"""Topic: {topic}

{instruction}"""
        
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500,
            temperature=0.7
        )
        
        guide = response.choices[0].message.content
        
        return jsonify({'guide': guide, 'topic': topic, 'format': guide_format}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/analyze-material', methods=['POST'])
@jwt_required()
def analyze_material():
    """Analyze uploaded study material"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        question = data.get('question', '')
        
        if not content:
            return jsonify({'error': 'Material content is required'}), 400
        
        # Limit content length
        content = content[:3000]
        
        if question:
            prompt = f"""Based on this study material:

{content}

Answer this question: {question}"""
        else:
            prompt = f"""Analyze this study material and provide:
1. Main topics covered
2. Key concepts
3. Summary

Material:
{content}"""
        
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            temperature=0.5
        )
        
        analysis = response.choices[0].message.content
        
        return jsonify({'analysis': analysis}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
