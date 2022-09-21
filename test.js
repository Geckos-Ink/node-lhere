
const lhere = require('./index.js');

lhere(["lhere"]);

lhere(["lhere", ".."]);

lhere(["lhere", "++", "test", "echo test"]);
lhere(["lhere", "test"]);

lhere(["lhere", "++", "test-hello", "test_echo.js"]);
lhere(["lhere", "test-hello"]);