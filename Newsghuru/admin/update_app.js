const fs = require('fs');

let content = fs.readFileSync('src/App.js', 'utf8');

// Replace Admin Routes
content = content.replace(/path="\/admin\/[^"]+"\s*element=\{\s*<ProtectedRoute>/g, match => {
  return match.replace('<ProtectedRoute>', '<ProtectedRoute requiredRole="admin">');
});

// Replace Editor Routes
content = content.replace(/path="\/editor\/[^"]+"\s*element=\{\s*<ProtectedRoute>/g, match => {
  return match.replace('<ProtectedRoute>', '<ProtectedRoute requiredRole="editor">');
});

// Replace Reporter Routes
content = content.replace(/path="\/reporter\/[^"]+"\s*element=\{\s*<ProtectedRoute>/g, match => {
  return match.replace('<ProtectedRoute>', '<ProtectedRoute requiredRole="reporter">');
});

fs.writeFileSync('src/App.js', content);
console.log("App.js updated");
