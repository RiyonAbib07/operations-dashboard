# HTTP & Web Fundamentals — My Notes

## The Request Lifecycle
1. URL — I type an address
2. DNS — converts domain name to IP Address
3. TCP/TLS — opens a connection and makes it encrypted
4. Request — browser sends a HTTP request message 
5. Response — server sends back status code + data(HTML/CSS/JSON/JS)
6. Render — browser builds the DOM and paints pixels

## HTTP Status Codes
- 200 — OK
- 401 — Unauthorized
- 403 — Forbidden
- 404 — Not Found
- 429 — Too Many Requests
- 500 — Internal Server Error

## HTTP is Stateless — what does that mean?
HTTP does not remember previous requests. Every request is treated as a new, independent request unless extra information (like cookies or tokens) is sent.

## Sessions vs Cookies — how do websites remember me?
-> Cookies: Small pieces of data stored in the browser.
-> Sessions: User data stored on the server.
The browser sends the session ID cookie with every request, allowing the server to identify the logged-in user.

## Why does HTTPS matter even for internal tools?
-> Encrypts data between browser and server.
-> Prevents passwords and sensitive data from being stolen.
-> Protects against eavesdropping and tampering.
-> Verifies you're communicating with the correct server using SSL/TLS certificates.
-> Keeps internal company tools secure, especially on shared or public networks. 