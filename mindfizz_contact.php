<?php
/*
  Mindfizz contact form handler
  Place this file in the same folder as the page containing the contact form.
*/

$to = 'studio@mindfizz.com';
$from_email = 'studio@mindfizz.com';
$from_name = 'Mindfizz website';

$redirect_success = 'index.html?contact=success#contact';
$redirect_error = 'index.html?contact=error#contact';

function clean_text($value) {
    $value = trim((string) $value);
    $value = str_replace(["\r", "\n"], ' ', $value);
    return filter_var($value, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
}

function clean_message($value) {
    $value = trim((string) $value);
    return filter_var($value, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
}

function redirect_to($url) {
    header('Location: ' . $url);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_to($redirect_error);
}

// Honeypot field. Real users should leave this blank.
if (!empty($_POST['website'])) {
    redirect_to($redirect_success);
}

$name = clean_text($_POST['name'] ?? '');
$email_raw = trim((string) ($_POST['email'] ?? ''));
$email = filter_var($email_raw, FILTER_VALIDATE_EMAIL);
$organisation = clean_text($_POST['organisation'] ?? '');
$message = clean_message($_POST['message'] ?? '');

if ($name === '' || !$email || $message === '') {
    redirect_to($redirect_error);
}

$subject = 'New enquiry from the Mindfizz website';

$email_body = "New enquiry from the Mindfizz website\n\n";
$email_body .= "Name: {$name}\n";
$email_body .= "Email: {$email}\n";
$email_body .= "Organisation: " . ($organisation !== '' ? $organisation : 'Not provided') . "\n\n";
$email_body .= "Message:\n{$message}\n\n";
$email_body .= "Sent from: " . ($_SERVER['HTTP_HOST'] ?? 'mindfizz.com') . "\n";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: ' . $from_name . ' <' . $from_email . '>';
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$sent = mail($to, $subject, $email_body, implode("\r\n", $headers));

if ($sent) {
    redirect_to($redirect_success);
}

redirect_to($redirect_error);
