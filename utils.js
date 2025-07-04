function log(msg) {
    const logDiv = document.getElementById('log');
    logDiv.textContent += msg + '\n';
    void logDiv.offsetHeight;
}