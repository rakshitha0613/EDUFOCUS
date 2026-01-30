// Debug script to clear all session data and test login flow
console.log('🔧 EduFocus Debug Helper');

// Function to clear all session data
function clearAllSessions() {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ All session data cleared');
}

// Function to check current session state
function checkSessionState() {
    console.log('📊 Current Session State:');
    console.log('userSession:', localStorage.getItem('userSession'));
    console.log('rememberMe:', localStorage.getItem('rememberMe'));
    console.log('edufocus_session:', localStorage.getItem('edufocus_session'));
    console.log('edufocus_users:', localStorage.getItem('edufocus_users'));
}

// Function to create test session
function createTestSession() {
    const testSession = {
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
        avatar: null,
        timestamp: new Date().getTime(),
        lastActivity: new Date().getTime()
    };
    
    localStorage.setItem('userSession', JSON.stringify(testSession));
    localStorage.setItem('rememberMe', 'true');
    console.log('✅ Test session created');
}

// Make functions available globally for console testing
window.eduDebug = {
    clear: clearAllSessions,
    check: checkSessionState,
    test: createTestSession
};

console.log('🎯 Use eduDebug.clear(), eduDebug.check(), or eduDebug.test() in console');

// Auto-check session state on load
checkSessionState();