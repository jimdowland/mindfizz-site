<?php
/*
  Mindfizz contact form handler
  Place this file in the same folder as the page containing the contact form.
*/

$to = 'studio@mindfizz.com, jim@jamesdowland.co.uk';
$from_email = 'studio@mindfizz.com';
$from_name = 'Mindfizz website';

$redirect_success = 'index.html?contact=success#contact';
$redirect_error = 'index.html?contact=error#contact';
$is_ajax = (isset($_POST['_ajax']) && $_POST['_ajax'] === '1')
    || (isset($_SERVER['HTTP_X_REQUESTED_WITH'])
        && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest');

function clean_text($value) {
    $value = trim((string) $value);
    $value = str_replace(array("\r", "\n"), ' ', $value);
    return filter_var($value, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
}

function clean_message($value) {
    $value = trim((string) $value);
    return filter_var($value, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
}

function redirect_to($url) {
    header('Location: ' . $url, true, 303);
    exit;
}

function finish_request($success) {
    global $is_ajax, $redirect_success, $redirect_error;

    if ($is_ajax) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(array('success' => (bool) $success));
        exit;
    }

    redirect_to($success ? $redirect_success : $redirect_error);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_to($redirect_error);
}

// Honeypot field. Real users should leave this blank.
if (!empty($_POST['website'])) {
    finish_request(true);
}

$name = clean_text(isset($_POST['name']) ? $_POST['name'] : '');
$email_raw = trim((string) (isset($_POST['email']) ? $_POST['email'] : ''));
$email = filter_var($email_raw, FILTER_VALIDATE_EMAIL);
$organisation = clean_text(isset($_POST['organisation']) ? $_POST['organisation'] : '');
$message = clean_message(isset($_POST['message']) ? $_POST['message'] : '');

if ($name === '' || !$email || $message === '') {
    finish_request(false);
}

$subject = 'New enquiry from the Mindfizz website';

$email_body = "New enquiry from the Mindfizz website\n\n";
$email_body .= "Name: {$name}\n";
$email_body .= "Email: {$email}\n";
$email_body .= "Organisation: " . ($organisation !== '' ? $organisation : 'Not provided') . "\n\n";
$email_body .= "Message:\n{$message}\n\n";
$email_body .= "Sent from: " . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'mindfizz.com') . "\n";

$headers = array();
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: ' . $from_name . ' <' . $from_email . '>';
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

if (!function_exists('mail')) {
    error_log('Mindfizz contact form: PHP mail() is unavailable.');
    finish_request(false);
}

$sent = mail($to, $subject, $email_body, implode("\r\n", $headers));

if ($sent) {
    finish_request(true);
}

error_log('Mindfizz contact form: mail() returned false.');
finish_request(false);
