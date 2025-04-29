class NoteApp {
    constructor() {
        this.notes = [];
        this.currentIndex = 0;
        this.cardsToShow = window.innerWidth <= 768 ? 1 : 3;
        this.cardWidth = 280;
        this.editingNote = null;
        this.selectedColor = '#FFD54F';
        this.currentTheme = localStorage.getItem('theme') || 'dark';

        // Éléments DOM
        this.cardTrack = document.getElementById('cardTrack');
        this.leftArrow = document.querySelector('.left-arrow');
        this.rightArrow = document.querySelector('.right-arrow');
        this.addNoteBtn = document.getElementById('addNoteBtn');
        this.toggleThemeBtn = document.getElementById('toggleThemeBtn');
        this.noteModal = document.getElementById('noteModal');
        this.noteTitleInput = document.getElementById('noteTitleInput');
        this.noteTextInput = document.getElementById('noteTextInput');
        this.modalTitle = document.getElementById('modalTitle');
        this.saveNoteBtn = document.getElementById('saveNoteBtn');
        this.cancelNoteBtn = document.getElementById('cancelNoteBtn');
        this.searchInput = document.querySelector('.search_input');
        this.modalColorOptions = document.querySelectorAll('.modal-content .color-option');
        this.modalContent = document.querySelector('.modal-content');

        // Couleurs
        this.noteColors = [
            '#FFD54F', '#E57373', '#81C784', 
            '#64B5F6', '#9575CD', '#FF8A65'
        ];

        // Icônes
        this.icons = {
            dark: {
                theme: 'img/dark_mode.svg',
                user: 'img/add_note.svg',
                arrow_left: 'img/arrow_left_icon.svg',
                arrow_right: 'img/arrow_right_icon.svg',
            },
            light: {
                theme: 'img/sun_mode.svg',
                user: 'img/add_note_dark.svg',
                arrow_left: 'img/arrow_left_icon_dark.svg',
                arrow_right: 'img/arrow_right_icon_dark.svg',
            }
        };

        // Initialisation
        this.init();
    }

    init() {
        // Définir le thème initial
        this.setTheme(this.currentTheme);

        // Charger les données depuis le localStorage
        this.loadNotes();

        // Configurer les écouteurs d'événements
        this.setupEventListeners();

        // Afficher l'état initial
        this.renderNotes();
        this.updateTrack();
    }

    setupEventListeners() {
        // Flèches de navigation
        this.rightArrow.addEventListener('click', () => this.nextSlide());
        this.leftArrow.addEventListener('click', () => this.prevSlide());

        // Boutons du menu
        this.addNoteBtn.addEventListener('click', () => this.openModal());
        this.toggleThemeBtn.addEventListener('click', () => this.toggleTheme());

        // Boutons des modales
        this.saveNoteBtn.addEventListener('click', () => this.saveNote());
        this.cancelNoteBtn.addEventListener('click', () => this.closeModal());

        // Recherche
        this.searchInput.addEventListener('input', (e) => this.searchNotes(e.target.value));

        // Sélecteur de couleur dans la modale
        this.modalColorOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectedColor = option.getAttribute('data-color');
                this.updateModalColorSelection();
                this.modalContent.style.backgroundColor = this.selectedColor;
            });
        });

        // Redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
            this.cardsToShow = window.innerWidth <= 768 ? 1 : 3;
            this.updateTrack();
        });
    }

    // Méthodes pour le thème
    setTheme(theme) {
        document.body.classList.toggle('light-theme', theme === 'light');
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
        this.updateIcons();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    updateIcons() {
        const theme = this.currentTheme;
        document.querySelector('.theme-icon').src = this.icons[theme].theme;
        const userIcon = document.querySelector('.add-icon');
        const arrow_leftIcon = document.querySelector('.arrow_letf-icon');
        const arrow_rightIcon = document.querySelector('.arrow_right-icon');

        if (userIcon) {
            userIcon.src = this.icons[theme].user;
        }
        if (arrow_leftIcon) {
            arrow_leftIcon.src = this.icons[theme].arrow_left;
        }
        if (arrow_rightIcon) {
            arrow_rightIcon.src = this.icons[theme].arrow_right;
        }

    }

    // Opérations CRUD pour les notes
    loadNotes() {
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
            this.notes = JSON.parse(savedNotes);
        }
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    renderNotes() {
        this.cardTrack.innerHTML = '';
        this.notes.forEach(note => this.createNoteElement(note));
        this.updateTrack();
    }

    createNoteElement(note) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.style.backgroundColor = note.color;
        noteElement.setAttribute('data-id', note.id);
        noteElement.setAttribute('data-created', note.created);

        noteElement.innerHTML = `
            <div class="note-header">
                <div>
                    <label class="note_title">${note.title}</label>
                </div>
                <button class="color-btn" style="background-color: ${note.color};" aria-label="Changer la couleur de la note"></button>
            </div>
            <label class="note_text">${note.text}</label>
            <div class="note_actions">
                <div class="note_date">${this.formatDate(new Date(note.created))}</div>
                <div class="action_buttons">
                    <button class="download_note" aria-label="Télécharger la note">
                        <img src="img/download_icon.svg" alt="Télécharger" class="icon">
                    </button>
                    <button class="edit_note" aria-label="Modifier la note">
                        <img src="img/edit_icon.svg" alt="Modifier" class="icon">
                    </button>
                    <button class="delete_note" aria-label="Supprimer la note">
                        <img src="img/delete_icon.svg" alt="Supprimer" class="icon">
                    </button>
                </div>
            </div>
            <div class="color-picker">
                ${this.noteColors.map(color => `
                    <div class="color-option" style="background-color: ${color};" data-color="${color}"></div>
                `).join('')}
            </div>
        `;

        // Ajouter les écouteurs d'événements
        const downloadBtn = noteElement.querySelector('.download_note');
        const editBtn = noteElement.querySelector('.edit_note');
        const deleteBtn = noteElement.querySelector('.delete_note');
        const colorBtn = noteElement.querySelector('.color-btn');
        const colorPicker = noteElement.querySelector('.color-picker');

        downloadBtn.addEventListener('click', () => this.downloadNoteAsPDF(note));
        editBtn.addEventListener('click', () => this.editNote(noteElement));
        deleteBtn.addEventListener('click', () => this.deleteNote(noteElement));
        colorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            colorPicker.classList.toggle('active');
        });

        // Options du sélecteur de couleur
        noteElement.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const newColor = option.getAttribute('data-color');
                noteElement.style.backgroundColor = newColor;
                colorBtn.style.backgroundColor = newColor;
                colorPicker.classList.remove('active');
                
                // Mettre à jour dans le tableau des notes
                const noteId = noteElement.getAttribute('data-id');
                const noteIndex = this.notes.findIndex(n => n.id === noteId);
                if (noteIndex !== -1) {
                    this.notes[noteIndex].color = newColor;
                    this.saveNotes();
                }
            });
        });

        this.cardTrack.appendChild(noteElement);
    }

    openModal(noteElement = null) {
        this.editingNote = noteElement;
        
        if (noteElement) {
            // Modification d'une note existante
            const noteId = noteElement.getAttribute('data-id');
            const note = this.notes.find(n => n.id === noteId);
            
            this.modalTitle.textContent = 'Modifier la note';
            this.noteTitleInput.value = note.title;
            this.noteTextInput.value = note.text;
            this.selectedColor = note.color;
            this.modalContent.style.backgroundColor = this.selectedColor;
        } else {
            // Ajout d'une nouvelle note
            this.modalTitle.textContent = 'Ajouter une note';
            this.noteTitleInput.value = '';
            this.noteTextInput.value = '';
            this.selectedColor = this.noteColors[0];
            this.modalContent.style.backgroundColor = this.selectedColor;
        }
        
        this.updateModalColorSelection();
        this.noteModal.style.display = 'flex';
    }

    closeModal() {
        this.noteModal.style.display = 'none';
    }

    updateModalColorSelection() {
        this.modalColorOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-color') === this.selectedColor) {
                option.classList.add('selected');
            }
        });
    }

    saveNote() {
        const title = this.noteTitleInput.value.trim();
        const text = this.noteTextInput.value.trim();

        // Validation
        if (!title) {
            alert('Veuillez entrer un titre pour votre note');
            this.noteTitleInput.focus();
            return;
        }
        
        if (!text) {
            alert('Veuillez entrer un contenu pour votre note');
            this.noteTextInput.focus();
            return;
        }

        const now = new Date();
        const createdDate = now.toISOString();

        if (this.editingNote) {
            // Mettre à jour une note existante
            const noteId = this.editingNote.getAttribute('data-id');
            const noteIndex = this.notes.findIndex(n => n.id === noteId);
            
            if (noteIndex !== -1) {
                this.notes[noteIndex] = {
                    ...this.notes[noteIndex],
                    title,
                    text,
                    color: this.selectedColor,
                    created: createdDate
                };
            }
        } else {
            // Ajouter une nouvelle note
            const newNote = {
                id: Date.now().toString(),
                title,
                text,
                color: this.selectedColor,
                created: createdDate
            };
            this.notes.unshift(newNote);
        }

        // Enregistrer et afficher
        this.saveNotes();
        this.renderNotes();
        this.closeModal();
    }

    editNote(noteElement) {
        this.openModal(noteElement);
    }

    deleteNote(noteElement) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
            const noteId = noteElement.getAttribute('data-id');
            const noteIndex = this.notes.findIndex(n => n.id === noteId);
            
            if (noteIndex !== -1) {
                this.notes.splice(noteIndex, 1);
                this.saveNotes();
                this.renderNotes();
            }
        }
    }

    downloadNoteAsPDF(note) {
        const content = `
            Titre: ${note.title}
            Créée le: ${this.formatDate(new Date(note.created))}
            
            ${note.text}
        `;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Méthodes de recherche
    searchNotes(term) {
        const searchTerm = term.toLowerCase();
        const notes = document.querySelectorAll('.note');
        
        notes.forEach(note => {
            const title = note.querySelector('.note_title').textContent.toLowerCase();
            const text = note.querySelector('.note_text').textContent.toLowerCase();
            
            const isVisible = title.includes(searchTerm) || text.includes(searchTerm);
            
            note.style.display = isVisible ? 'flex' : 'none';
        });
    }

    // Méthodes de navigation
    nextSlide() {
        const totalNotes = this.notes.length;
        const maxIndex = Math.ceil(totalNotes / this.cardsToShow) - 1;
        
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            this.updateTrack();
        }
    }

    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateTrack();
        }
    }

    updateTrack() {
        const offset = -this.currentIndex * this.cardWidth * this.cardsToShow;
        this.cardTrack.style.transform = `translateX(${offset}px)`;

        // Mettre à jour l'état des flèches
        const totalNotes = this.notes.length;
        this.leftArrow.disabled = this.currentIndex === 0;
        this.rightArrow.disabled = this.currentIndex >= Math.ceil(totalNotes / this.cardsToShow) - 1;
    }

    // Méthodes utilitaires
    formatDate(date) {
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
}

// Initialiser l'application lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new NoteApp();
});