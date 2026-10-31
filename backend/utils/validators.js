export function validEmail(email) {
  return (
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

export function validMessage(message) {
  return (
    typeof message === "string" &&
    message.trim().length > 0 &&
    message.trim().length <= 1000
  );
}