// DOM Elements
const addAssignmentBtn = document.getElementById('addAssignmentBtn');
const assignmentForm = document.getElementById('assignmentForm');
const cancelBtn = document.getElementById('cancelBtn');
const saveAssignmentBtn = document.getElementById('saveAssignmentBtn');
const assignmentList = document.getElementById('assignmentList');
const emptyState = document.getElementById('emptyState');
const searchAssignment = document.getElementById('searchAssignment');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const totalAssignments = document.getElementById('totalAssignments');
const completedAssignments = document.getElementById('completedAssignments');
const pendingAssignments = document.getElementById('pendingAssignments');
const profileName = document.getElementById('profileName');
const profileBio = document.getElementById('profileBio');
const addAppLinkBtn = document.getElementById('addAppLinkBtn');
const appLinkForm = document.getElementById('appLinkForm');
const cancelAppBtn = document.getElementById('cancelAppBtn');
const saveAppLinkBtn = document.getElementById('saveAppLinkBtn');
const appLinksGrid = document.getElementById('appLinksGrid');
const emptyAppsState = document.getElementById('emptyAppsState');
const copyrightName = document.getElementById('copyrightName');
const currentYear = document.getElementById('currentYear');
const linkedinLink = document.getElementById('linkedinLink');
const githubLink = document.getElementById('githubLink');
const instagramLink = document.getElementById('instagramLink');
const emailLink = document.getElementById('emailLink');

// Set current year
currentYear.textContent = new Date().getFullYear();

// State
let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
let appLinks = JSON.parse(localStorage.getItem('appLinks')) || [];
let socialLinks = JSON.parse(localStorage.getItem('socialLinks')) || {
    linkedin: '#',
    github: '#',
    instagram: '#',
    email: 'mailto:your.email@example.com'
};
let editingId = null;
let editingAppId = null;
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
    name: 'Your Name',
    bio: 'Add your bio or any information about yourself here. Click to edit.'
};

// Load user profile
function loadUserProfile() {
    profileName.textContent = userProfile.name;
    profileBio.textContent = userProfile.bio;
    copyrightName.textContent = userProfile.name;
}

// Save user profile
function saveUserProfile() {
    userProfile.name = profileName.textContent;
    userProfile.bio = profileBio.textContent;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    copyrightName.textContent = userProfile.name;
}

// Load social links
function loadSocialLinks() {
    linkedinLink.href = socialLinks.linkedin;
    githubLink.href = socialLinks.github;
    instagramLink.href = socialLinks.instagram;
    emailLink.href = socialLinks.email;
}

// Event listeners for profile editing
profileName.addEventListener('blur', saveUserProfile);
profileBio.addEventListener('blur', saveUserProfile);

// Initialize
function init() {
    loadUserProfile();
    loadSocialLinks();
    renderAssignments();
    renderAppLinks();
    updateStats();
}

// Toggle assignment form visibility
addAssignmentBtn.addEventListener('click', () => {
    assignmentForm.style.display = 'block';
    document.getElementById('assignmentTitle').focus();
    editingId = null; // Reset editing state
    // Reset form
    document.getElementById('assignmentTitle').value = '';
    document.getElementById('assignmentSubject').value = '';
    document.getElementById('assignmentDescription').value = '';
    document.getElementById('assignmentDeadline').value = '';
    document.getElementById('assignmentPriority').value = 'low';
});

// Toggle app link form visibility
addAppLinkBtn.addEventListener('click', () => {
    appLinkForm.style.display = 'block';
    document.getElementById('appTitle').focus();
    editingAppId = null; // Reset editing state
    // Reset form
    document.getElementById('appTitle').value = '';
    document.getElementById('appUrl').value = '';
    document.getElementById('appDescription').value = '';
    document.getElementById('appIcon').value = '';
});

// Cancel forms
cancelBtn.addEventListener('click', () => {
    assignmentForm.style.display = 'none';
});

cancelAppBtn.addEventListener('click', () => {
    appLinkForm.style.display = 'none';
});

// Save assignment
saveAssignmentBtn.addEventListener('click', () => {
    const title = document.getElementById('assignmentTitle').value.trim();
    const subject = document.getElementById('assignmentSubject').value.trim();
    const description = document.getElementById('assignmentDescription').value.trim();
    const deadline = document.getElementById('assignmentDeadline').value;
    const priority = document.getElementById('assignmentPriority').value;

    if (!title || !subject || !deadline) {
        alert('Please fill in all required fields (title, subject, and deadline)');
        return;
    }

    if (editingId !== null) {
        // Update existing assignment
        const index = assignments.findIndex(a => a.id === editingId);
        if (index !== -1) {
            assignments[index] = {
                ...assignments[index],
                title,
                subject,
                description,
                deadline,
                priority
            };
        }
    } else {
        // Create new assignment
        const newAssignment = {
            id: Date.now().toString(),
            title,
            subject,
            description,
            deadline,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        assignments.push(newAssignment);
    }

    // Save to localStorage
    localStorage.setItem('assignments', JSON.stringify(assignments));

    // Hide form and render assignments
    assignmentForm.style.display = 'none';
    renderAssignments();
    updateStats();
});

// Save app link
saveAppLinkBtn.addEventListener('click', () => {
    const title = document.getElementById('appTitle').value.trim();
    const url = document.getElementById('appUrl').value.trim();
    const description = document.getElementById('appDescription').value.trim();
    const icon = document.getElementById('appIcon').value.trim();

    if (!title || !url) {
        alert('Please fill in all required fields (title and URL)');
        return;
    }

    if (editingAppId !== null) {
        // Update existing app link
        const index = appLinks.findIndex(a => a.id === editingAppId);
        if (index !== -1) {
            appLinks[index] = {
                ...appLinks[index],
                title,
                url,
                description,
                icon
            };
        }
    } else {
        // Create new app link
        const newAppLink = {
            id: Date.now().toString(),
            title,
            url,
            description,
            icon: icon || '🔗',
            createdAt: new Date().toISOString()
        };
        appLinks.push(newAppLink);
    }

    // Save to localStorage
    localStorage.setItem('appLinks', JSON.stringify(appLinks));

    // Hide form and render app links
    appLinkForm.style.display = 'none';
    renderAppLinks();
});

// Generate priority badge
function getPriorityBadge(priority) {
    const priorityClass = `priority-${priority}`;
    return `<span class="priority-badge ${priorityClass}">${priority}</span>`;
}

// Calculate deadline status
function getDeadlineStatus(deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
        return { status: 'urgent', text: 'Overdue!' };
    } else if (daysUntil === 0) {
        return { status: 'urgent', text: 'Due Today!' };
    } else if (daysUntil <= 3) {
        return { status: 'approaching', text: `${daysUntil} day${daysUntil > 1 ? 's' : ''} left` };
    } else {
        return { status: 'safe', text: `${daysUntil} days left` };
    }
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Toggle assignment completion
function toggleAssignmentCompletion(id) {
    const index = assignments.findIndex(a => a.id === id);
    if (index !== -1) {
        assignments[index].completed = !assignments[index].completed;
        localStorage.setItem('assignments', JSON.stringify(assignments));
        renderAssignments();
        updateStats();
    }
}

// Edit assignment
function editAssignment(id) {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
        editingId = id;
        document.getElementById('assignmentTitle').value = assignment.title;
        document.getElementById('assignmentSubject').value = assignment.subject;
        document.getElementById('assignmentDescription').value = assignment.description || '';
        document.getElementById('assignmentDeadline').value = assignment.deadline;
        document.getElementById('assignmentPriority').value = assignment.priority;
        
        assignmentForm.style.display = 'block';
        document.getElementById('assignmentTitle').focus();
    }
}

// Edit app link
function editAppLink(id) {
    const appLink = appLinks.find(a => a.id === id);
    if (appLink) {
        editingAppId = id;
        document.getElementById('appTitle').value = appLink.title;
        document.getElementById('appUrl').value = appLink.url;
        document.getElementById('appDescription').value = appLink.description || '';
        document.getElementById('appIcon').value = appLink.icon || '';
        
        appLinkForm.style.display = 'block';
        document.getElementById('appTitle').focus();
    }
}

// Delete assignment
function deleteAssignment(id) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        assignments = assignments.filter(a => a.id !== id);
        localStorage.setItem('assignments', JSON.stringify(assignments));
        renderAssignments();
        updateStats();
    }
}

// Delete app link
function deleteAppLink(id) {
    if (confirm('Are you sure you want to delete this app link?')) {
        appLinks = appLinks.filter(a => a.id !== id);
        localStorage.setItem('appLinks', JSON.stringify(appLinks));
        renderAppLinks();
    }
}

// Filter assignments
function filterAssignments() {
    const searchTerm = searchAssignment.value.toLowerCase();
    const statusFilter = filterStatus.value;
    const priorityFilter = filterPriority.value;
    
    return assignments.filter(assignment => {
        // Search term
        const matchesSearch = 
            assignment.title.toLowerCase().includes(searchTerm) ||
            assignment.subject.toLowerCase().includes(searchTerm) ||
            (assignment.description && assignment.description.toLowerCase().includes(searchTerm));
        
        // Status
        const matchesStatus = 
            statusFilter === 'all' || 
            (statusFilter === 'completed' && assignment.completed) ||
            (statusFilter === 'pending' && !assignment.completed);
        
        // Priority
        const matchesPriority = 
            priorityFilter === 'all' || 
            assignment.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });
}

// Render assignments
function renderAssignments() {
    const filteredAssignments = filterAssignments();
    
    if (filteredAssignments.length === 0) {
        assignmentList.innerHTML = '';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        
        // Sort assignments by deadline (closest first)
        filteredAssignments.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        
        assignmentList.innerHTML = filteredAssignments.map(assignment => {
            const deadlineInfo = getDeadlineStatus(assignment.deadline);
            const completedClass = assignment.completed ? 'completed' : '';
            
            return `
                <li class="assignment-item ${completedClass}" data-id="${assignment.id}">
                    <div class="assignment-info">
                        <h3 class="assignment-title">${assignment.title}</h3>
                        <span class="subject-tag">${assignment.subject}</span>
                        ${getPriorityBadge(assignment.priority)}
                        <p>${assignment.description || ''}</p>
                        <div class="assignment-details">
                            <span class="assignment-detail">
                                📅 Due: ${formatDate(assignment.deadline)}
                            </span>
                            <span class="assignment-detail">
                                ⏱ <span class="deadline ${deadlineInfo.status}">${deadlineInfo.text}</span>
                            </span>
                        </div>
                    </div>
                    <div class="assignment-actions">
                        <button class="btn-icon complete" onclick="toggleAssignmentCompletion('${assignment.id}')">
                            ${assignment.completed ? '↩️' : '✓'}
                        </button>
                        <button class="btn-icon edit" onclick="editAssignment('${assignment.id}')">
                            ✏️
                        </button>
                        <button class="btn-icon delete" onclick="deleteAssignment('${assignment.id}')">
                            🗑️
                        </button>
                    </div>
                </li>
            `;
        }).join('');
    }
}

// Render app links
function renderAppLinks() {
    if (appLinks.length === 0) {
        appLinksGrid.innerHTML = '';
        emptyAppsState.style.display = 'block';
    } else {
        emptyAppsState.style.display = 'none';
        
        // Sort app links by title
        appLinks.sort((a, b) => a.title.localeCompare(b.title));
        
        appLinksGrid.innerHTML = appLinks.map(app => {
            return `
                <div class="app-link-card" data-id="${app.id}">
                    <div class="app-icon">${app.icon || '🔗'}</div>
                    <h3 class="app-title">${app.title}</h3>
                    <p class="app-description">${app.description || ''}</p>
                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <a href="${app.url}" target="_blank" class="btn-icon">🔗</a>
                        <button class="btn-icon edit" onclick="editAppLink('${app.id}')">✏️</button>
                        <button class="btn-icon delete" onclick="deleteAppLink('${app.id}')">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Update stats
function updateStats() {
    totalAssignments.textContent = assignments.length;
    completedAssignments.textContent = assignments.filter(a => a.completed).length;
    pendingAssignments.textContent = assignments.filter(a => !a.completed).length;
}

// Event listeners for filters
searchAssignment.addEventListener('input', renderAssignments);
filterStatus.addEventListener('change', renderAssignments);
filterPriority.addEventListener('change', renderAssignments);

// Initialize app
init();
