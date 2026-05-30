# Security Specification for En-ji Catalog

## Data Invariants
1. Products cannot have zero or negative price. Colors, text sizes, and dimensions must be clean.
2. Product category must be one of: 'Handbag', 'Shoulder Bag', 'Tote Bag', 'Crossbody'.
3. Product ID must be non-empty and match standard format.
4. Settings must contain valid whatsappNumber and bankAccount details.
5. Only the designated admin (sukardimen95@gmail.com) with a verified email can execute WRITE operations on Products and Settings.
6. Public visitors can read (GET, LIST) products and settings to view the catalog but cannot write.

## The "Dirty Dozen" Malicious Payloads
These payloads attempt to bypass schema validations or perform spoofing.
1. **Anonymous Product Injection**: Attempting to create a product without being authenticated.
2. **Category Bypass**: Product with a category of 'RocketLauncher' instead of catalog-allowed types.
3. **Negative Price**: Product with price -50000.
4. **Huge String Injection**: product description larger than legal limits (e.g. 10MB of data) causing resource exhaustion.
5. **Admin Settings Override by Unauthenticated user**: Attempting to write to `settings/global` to change the adminPin to a custom value.
6. **Spoof Admin Write**: Attempting to write a product as authenticated user with non-verified email or different email `hacker@gmail.com`.
7. **Identity Spoofing via email claims**: Attempting to write with unverified email of admin.
8. **Invalid Product ID**: Injecting non-alphanumeric characters into product document IDs to perform path traversal.
9. **Missing Required Fields**: Product payload without a category field.
10. **Zero Price Product**: Product with price 0.
11. **Hacked Bank Account Settings**: Modifying Bank Transfer details to direct payments to a hacker's account.
12. **Self-promotion to Admin**: Forbidding unauthenticated users from making themselves admins.

## Secure Firestore Rules

We will implement the firestore security rules to restrict write access to the verified admin email `sukardimen95@gmail.com` and allow read-only access to anyone.
