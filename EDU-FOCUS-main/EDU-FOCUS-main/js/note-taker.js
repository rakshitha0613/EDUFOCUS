class NoteTaker {
    constructor() {
        this.notes = [];
        this.currentNote = null;
        this.searchQuery = '';
        this.selectedTags = [];
        this.init();
    }

    init() {
        this.loadNotes();
        this.setupListeners();
        this.renderNotes();
    }

    setupListeners() {
        document.getElementById('createNoteBtn')?.addEventListener('click', () => this.createNewNote());
        document.getElementById('searchNotes')?.addEventListener('input', (e) => this.searchNotes(e.target.value));
        document.getElementById('saveNoteBtn')?.addEventListener('click', () => this.saveNote());
        document.getElementById('deleteNoteBtn')?.addEventListener('click', () => this.deleteCurrentNote());
        document.getElementById('exportNoteBtn')?.addEventListener('click', () => this.exportNote());
        document.getElementById('backFromEditorBtn')?.addEventListener('click', () => this.backToNotesList());
    }

    createNewNote() {
        const note = {
            id: Date.now(),
            title: 'Untitled Note',
            content: '',
            tags: [],
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            color: '#6c5ce7'
        };

        this.notes.push(note);
        this.currentNote = note;
        this.renderEditor();
    }

    openNote(noteId) {
        this.currentNote = this.notes.find(n => n.id === noteId);
        document.getElementById('notesList').style.display = 'none';
        document.getElementById('noteEditor').style.display = 'block';
        this.renderEditor();
    }

    backToNotesList() {
        if (this.currentNote) {
            this.saveNote();
        }
        this.currentNote = null;
        document.getElementById('notesList').style.display = 'block';
        document.getElementById('noteEditor').style.display = 'none';
        this.renderNotes();
    }

    renderEditor() {
        const editor = document.getElementById('noteEditor');
        
        editor.innerHTML = `
            <div class="editor-header">
                <button id="backFromEditorBtn" class="btn-back">← Back</button>
                <input type="text" id="noteTitle" class="note-title-input" value="${this.currentNote.title}" placeholder="Note Title">
                <div class="editor-actions">
                    <button id="saveNoteBtn" class="btn-success">💾 Save</button>
                    <button id="exportNoteBtn" class="btn-secondary">📥 Export</button>
                    <button id="deleteNoteBtn" class="btn-danger">🗑 Delete</button>
                </div>
            </div>

            <div class="editor-toolbar">
                <button class="toolbar-btn" onclick="noteTaker.insertMarkdown('**', '**', 'bold')">
                    <strong>B</strong>
                </button>
                <button class="toolbar-btn" onclick="noteTaker.insertMarkdown('*', '*', 'italic')">
                    <em>I</em>
                </button>
                <button class="toolbar-btn" onclick="noteTaker.insertMarkdown('~~', '~~', 'strikethrough')">
                    <s>S</s>
                </button>
                <button class="toolbar-btn" onclick="noteTaker.insertMarkdown('\\n- ', '', 'bullet')">
                    • List
                </button>
                <button class="toolbar-btn" onclick="noteTaker.insertMarkdown('\\n# ', '', 'heading')">
                    H1
                </button>
                <button class="toolbar-btn" onclick="noteTaker.insertMarkdown('\`', '\`', 'code')">
                    { }
                </button>
                <button class="toolbar-btn" onclick="noteTaker.insertMarkdown('[', '](url)', 'link')">
                    🔗 Link
                </button>
                <button class="toolbar-btn" onclick="noteTaker.insertMarkdown('> ', '', 'quote')">
                    " Quote
                </button>
            </div>

            <div class="editor-main">
                <textarea id="noteContent" class="note-editor" placeholder="Start typing... Supports Markdown formatting">${this.currentNote.content}</textarea>
                <div class="editor-preview" id="notePreview"></div>
            </div>

            <div class="editor-footer">
                <div class="tags-section">
                    <input type="text" id="tagInput" class="tag-input" placeholder="Add tags (comma-separated)" value="${this.currentNote.tags.join(', ')}">
                </div>
                <div class="note-stats">
                    <span>Words: <span id="wordCount">0</span></span>
                    <span>Characters: <span id="charCount">0</span></span>
                    <span>Last saved: <span id="lastSaved">${new Date(this.currentNote.lastModified).toLocaleString()}</span></span>
                </div>
            </div>
        `;

        const textarea = document.getElementById('noteContent');
        const preview = document.getElementById('notePreview');

        textarea.addEventListener('input', () => {
            this.updateStats();
            this.updatePreview();
        });

        document.getElementById('backFromEditorBtn').addEventListener('click', () => this.backToNotesList());
        document.getElementById('saveNoteBtn').addEventListener('click', () => this.saveNote());
        document.getElementById('deleteNoteBtn').addEventListener('click', () => this.deleteCurrentNote());
        document.getElementById('exportNoteBtn').addEventListener('click', () => this.exportNote());

        this.updateStats();
        this.updatePreview();
    }

    insertMarkdown(before, after, type) {
        const textarea = document.getElementById('noteContent');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        const before_text = before.replace('\\n', '\n');
        const replacement = before_text + (selected || 'text') + after;

        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        textarea.focus();
        this.updateStats();
        this.updatePreview();
    }

    updateStats() {
        const content = document.getElementById('noteContent').value;
        const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = content.length;

        document.getElementById('wordCount').textContent = words;
        document.getElementById('charCount').textContent = chars;
    }

    updatePreview() {
        const content = document.getElementById('noteContent').value;
        const preview = document.getElementById('notePreview');

        if (preview) {
            const html = this.markdownToHtml(content);
            preview.innerHTML = html;
        }
    }

    markdownToHtml(markdown) {
        let html = markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/~~(.*?)~~/gim, '<del>$1</del>')
            .replace(/`(.*?)`/gim, '<code>$1</code>')
            .replace(/\n\n/gim, '</p><p>')
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

        return `<p>${html}</p>`;
    }

    saveNote() {
        if (!this.currentNote) return;

        this.currentNote.title = document.getElementById('noteTitle').value;
        this.currentNote.content = document.getElementById('noteContent').value;
        this.currentNote.tags = document.getElementById('tagInput').value.split(',').map(t => t.trim()).filter(t => t);
        this.currentNote.lastModified = new Date().toISOString();

        this.saveNotes();
        this.showNotification('Note Saved', this.currentNote.title);
    }

    deleteCurrentNote() {
        if (!this.currentNote || !confirm('Delete this note?')) return;

        this.notes = this.notes.filter(n => n.id !== this.currentNote.id);
        this.saveNotes();
        this.backToNotesList();
    }

    exportNote() {
        if (!this.currentNote) return;

        const content = document.getElementById('noteContent').value;
        const markdown = `# ${this.currentNote.title}\n\n${content}\n\n---\nTags: ${this.currentNote.tags.join(', ')}\nExported: ${new Date().toISOString()}`;

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentNote.title}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }

    searchNotes(query) {
        this.searchQuery = query.toLowerCase();
        this.renderNotes();
    }

    renderNotes() {
        const container = document.getElementById('notesList');
        if (!container) return;

        let filtered = this.notes;
        if (this.searchQuery) {
            filtered = filtered.filter(n => 
                n.title.toLowerCase().includes(this.searchQuery) ||
                n.content.toLowerCase().includes(this.searchQuery) ||
                n.tags.some(t => t.toLowerCase().includes(this.searchQuery))
            );
        }

        const sorted = filtered.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

        container.innerHTML = `
            <div class="notes-header">
                <h2>📝 My Notes</h2>
                <button id="createNoteBtn" class="btn-primary">➕ New Note</button>
            </div>

            <div class="notes-search">
                <input type="text" id="searchNotes" class="search-input" placeholder="🔍 Search notes by title, content, or tags...">
            </div>

            <div class="notes-grid">
                ${sorted.map(note => `
                    <div class="note-card" style="border-left: 4px solid ${note.color}" onclick="noteTaker.openNote(${note.id})">
                        <h3>${note.title}</h3>
                        <p class="note-preview">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</p>
                        <div class="note-tags">
                            ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <p class="note-date">${new Date(note.lastModified).toLocaleDateString()}</p>
                    </div>
                `).join('')}
            </div>

            ${sorted.length === 0 ? '<p class="no-notes">No notes yet. Create one to get started!</p>' : ''}
        `;

        document.getElementById('createNoteBtn')?.addEventListener('click', () => this.createNewNote());
        document.getElementById('searchNotes')?.addEventListener('input', (e) => this.searchNotes(e.target.value));
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    loadNotes() {
        const saved = localStorage.getItem('notes');
        this.notes = saved ? JSON.parse(saved) : [];
    }

    showNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: message, icon: '📝' });
        }
    }
}

// Global reference
let noteTaker;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('notesList')) {
        noteTaker = new NoteTaker();
    }
});
