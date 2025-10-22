<?php
echo "<h1>Callback Test</h1>";
echo "<p>Code: " . ($_GET['code'] ?? 'none') . "</p>";
echo "<p>State: " . ($_GET['state'] ?? 'none') . "</p>";
echo "<p>Error: " . ($_GET['error'] ?? 'none') . "</p>";

echo "<script>
    console.log('Callback reached');
    window.opener.postMessage({type: 'AVITO_AUTH_SUCCESS'}, '*');
    setTimeout(() => window.close(), 2000);
</script>";
?>